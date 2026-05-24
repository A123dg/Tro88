using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Common.Interfaces.AI;
using Tro88.Application.Common.Models.AI;
using Tro88.Infrastructure.Settings;

namespace Tro88.Infrastructure.Services.Ai;

public class GeminiAiService : IAiService
{
    private readonly HttpClient _http;
    private readonly GeminiSettings _settings;
    private readonly IAiToolManager _toolManager;
    private readonly ILogger<GeminiAiService> _logger;

    private static readonly string[] _dangerousPatterns =
    {
        "ignore previous",
        "ignore all instructions",
        "you are now",
        "act as",
        "jailbreak",
        "bypass",
        "override system"
    };

    public GeminiAiService(
        IHttpClientFactory factory,
        IOptions<GeminiSettings> settings,
        IAiToolManager toolManager,
        ILogger<GeminiAiService> logger)
    {
        _http = factory.CreateClient("Gemini");
        _settings = settings.Value;
        _toolManager = toolManager;
        _logger = logger;
    }

    public async Task<AiChatResult> ChatAsync(
        List<AiChatMessage> messages,
        string? systemPrompt = null,
        CancellationToken ct = default)
    {
        foreach (var msg in messages.Where(m => m.Role == "user"))
        {
            if (_dangerousPatterns.Any(p => msg.Content.ToLower().Contains(p)))
            {
                _logger.LogWarning("Potential prompt injection detected");
                return new AiChatResult("Tôi không thể xử lý yêu cầu này.", 0, 0);
            }
        }

        return await ExecuteWithToolCallingAsync(messages, systemPrompt, ct);
    }

    private async Task<AiChatResult> ExecuteWithToolCallingAsync(
        List<AiChatMessage> messages,
        string? systemPrompt,
        CancellationToken ct)
    {
        const int maxIterations = 5;
        var iteration = 0;

        var contents = BuildContents(messages);

        while (iteration < maxIterations)
        {
            iteration++;
            _logger.LogDebug("Gemini iteration {Iteration}", iteration);

            var requestBody = BuildRequestBody(contents, systemPrompt);
            var response = await CallGeminiAsync(requestBody, ct);

            var parsed = ParseGeminiResponse(response);

            if (!parsed.HasFunctionCall)
            {
                return new AiChatResult(
                    parsed.TextContent,
                    parsed.InputTokens,
                    parsed.OutputTokens);
            }

            _logger.LogInformation("AI requested tool: {Tool}", parsed.FunctionCall!.Name);

            contents.Add(new
            {
                role = "model",
                parts = parsed.RawParts
            });

            var toolResult = await _toolManager.ExecuteToolAsync(
                parsed.FunctionCall.Name,
                parsed.FunctionCall.ArgsJson,
                parsed.UserId,
                ct);

            _logger.LogInformation(
                "Tool {Tool} executed: success={Success}, records={Count}",
                toolResult.ToolName,
                toolResult.Success,
                toolResult.RecordCount);

            contents.Add(new
            {
                role = "user",
                parts = new[]
                {
                    new
                    {
                        functionResponse = new
                        {
                            name = parsed.FunctionCall.Name,
                            response = new { content = toolResult.ToJsonString() }
                        }
                    }
                }
            });
        }

        _logger.LogWarning("Max tool calling iterations reached");
        return new AiChatResult(
            "Tôi cần thêm thông tin để trả lời câu hỏi này.",
            0, 0);
    }

    private List<object> BuildContents(List<AiChatMessage> messages)
        => messages.Select(m => (object)new
        {
            role = m.Role == "assistant" ? "model" : "user",
            parts = new[] { new { text = m.Content } }
        }).ToList();

    private object BuildRequestBody(List<object> contents, string? systemPrompt)
    {
        var tools = _toolManager.BuildGeminiFunctionDeclarations();

        return new
        {
            system_instruction = systemPrompt is null ? null : new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents,
            tools = tools.Length > 0 ? new[] { new { function_declarations = tools } } : null,
            tool_config = tools.Length > 0 ? new
            {
                function_calling_config = new { mode = "AUTO" }
            } : null,
            generation_config = new
            {
                max_output_tokens = _settings.MaxTokens,
                temperature = 0.3
            }
        };
    }

    private async Task<JsonDocument> CallGeminiAsync(object requestBody, CancellationToken ct)
    {
        var url = $"{_settings.BaseUrl}/v1beta/models/{_settings.Model}:generateContent?key={_settings.ApiKey}";

        var json = JsonSerializer.Serialize(requestBody, JsonOptions);
        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        req.Headers.Add("X-goog-api-key", _settings.ApiKey);

        var response = await _http.SendAsync(req, ct);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Gemini API error {Status}: {Error}", response.StatusCode, error);
            throw new InvalidOperationException($"Gemini API error: {error}");
        }

        var responseBody = await response.Content.ReadAsStringAsync(ct);
        return JsonDocument.Parse(responseBody);
    }

    private GeminiParsedResponse ParseGeminiResponse(JsonDocument doc)
    {
        var root = doc.RootElement;
        var candidate = root.GetProperty("candidates")[0];
        var content = candidate.GetProperty("content");
        var parts = content.GetProperty("parts");

        var inputTokens = 0;
        var outputTokens = 0;
        if (root.TryGetProperty("usageMetadata", out var usage))
        {
            inputTokens = usage.GetProperty("promptTokenCount").GetInt32();
            outputTokens = usage.GetProperty("candidatesTokenCount").GetInt32();
        }

        foreach (var part in parts.EnumerateArray())
        {
            if (part.TryGetProperty("functionCall", out var funcCall))
            {
                var name = funcCall.GetProperty("name").GetString() ?? string.Empty;
                var argsJson = funcCall.TryGetProperty("args", out var args)
                    ? args.GetRawText()
                    : "{}";

                return new GeminiParsedResponse
                {
                    HasFunctionCall = true,
                    FunctionCall = new FunctionCallInfo
                    {
                        Name = name,
                        ArgsJson = argsJson
                    },
                    RawParts = parts.EnumerateArray().Select(p => (object)p).ToArray(),
                    InputTokens = inputTokens,
                    OutputTokens = outputTokens
                };
            }
        }

        var text = parts
            .EnumerateArray()
            .Where(p => p.TryGetProperty("text", out _))
            .Select(p => p.GetProperty("text").GetString())
            .FirstOrDefault() ?? string.Empty;

        return new GeminiParsedResponse
        {
            HasFunctionCall = false,
            TextContent = text,
            RawParts = Array.Empty<object>(),
            InputTokens = inputTokens,
            OutputTokens = outputTokens
        };
    }

    public async Task<AiTaskResult> RunAgentTaskAsync(
        string taskType,
        string taskInput,
        Guid userId,
        CancellationToken ct = default)
    {
        var result = await _toolManager.ExecuteToolAsync(taskType, taskInput, userId, ct);
        return result.Success
            ? new AiTaskResult(true, result.ToJsonString())
            : new AiTaskResult(false, string.Empty, result.ErrorMessage);
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };

    private sealed class GeminiParsedResponse
    {
        public bool HasFunctionCall { get; set; }
        public FunctionCallInfo? FunctionCall { get; set; }
        public string TextContent { get; set; } = string.Empty;
        public object[] RawParts { get; set; } = Array.Empty<object>();
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public Guid UserId { get; set; }
    }

    private sealed class FunctionCallInfo
    {
        public string Name { get; set; } = default!;
        public string ArgsJson { get; set; } = "{}";
    }
}