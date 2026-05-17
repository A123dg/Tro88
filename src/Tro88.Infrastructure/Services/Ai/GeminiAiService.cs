using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using Tro88.Application.Common.Interfaces;
using Tro88.Infrastructure.Settings;

namespace Tro88.Infrastructure.Services.Ai;

public class GeminiAiService : IAiService
{
    private readonly HttpClient _http;
    private readonly GeminiSettings _settings;
    private readonly ILogger<GeminiAiService> _logger;

    public GeminiAiService(
        IHttpClientFactory factory,
        IOptions<GeminiSettings> settings,
        ILogger<GeminiAiService> logger)
    {
        _http = factory.CreateClient("Gemini");
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task<AiChatResult> ChatAsync(
        List<AiChatMessage> messages,
        string? systemPrompt = null,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_settings.ApiKey))
            return new AiChatResult(
                "AI service is not configured.",
                0, 0);

        var contents = messages.Select(m => new
        {
            role = m.Role == "assistant" ? "model" : "user",
            parts = new[] { new { text = m.Content } }
        }).ToList();

        var body = new
        {
            system_instruction = systemPrompt is null ? null : new
            {
                parts = new[] { new { text = systemPrompt } }
            },
            contents,
            generationConfig = new
            {
                maxOutputTokens = _settings.MaxTokens,
                temperature = 0.7
            }
        };

        var url = $"{_settings.BaseUrl.TrimEnd('/')}/v1beta/models/" +
                  $"{_settings.Model}:generateContent?key={_settings.ApiKey}";

        var json = JsonSerializer.Serialize(body, JsonOptions);
        using var req = new HttpRequestMessage(HttpMethod.Post, url)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };

        var response = await _http.SendAsync(req, ct);
        response.EnsureSuccessStatusCode();

        using var doc = JsonDocument.Parse(
            await response.Content.ReadAsStringAsync(ct));
        var root = doc.RootElement;

        var content = root.GetProperty("candidates")[0]
            .GetProperty("content")
            .GetProperty("parts")[0]
            .GetProperty("text")
            .GetString() ?? string.Empty;

        var usage = root.GetProperty("usageMetadata");
        var inputTokens = usage.GetProperty("promptTokenCount").GetInt32();
        var outputTokens = usage
            .GetProperty("candidatesTokenCount").GetInt32();

        return new AiChatResult(content, inputTokens, outputTokens);
    }

    public async Task<AiTaskResult> RunAgentTaskAsync(
        string taskType,
        string taskInput,
        Guid userId,
        CancellationToken ct = default)
    {
        try
        {
            var prompt =
                $"Execute Tro88 agent task '{taskType}' for user {userId}. " +
                $"Input: {taskInput}. Return structured summary.";

            var result = await ChatAsync(
                [new AiChatMessage("user", taskInput)],
                prompt,
                ct);

            return new AiTaskResult(true, result.Content);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Agent task {Type} failed", taskType);
            return new AiTaskResult(false, string.Empty, ex.Message);
        }
    }

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
}
