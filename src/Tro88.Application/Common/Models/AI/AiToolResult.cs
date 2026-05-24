using System.Text.Json;
using System.Text.Json.Serialization;

namespace Tro88.Application.Common.Models.AI;

public sealed record AiToolResult
{
    public bool Success { get; init; }
    public string ToolName { get; init; } = default!;
    public object? Data { get; init; }
    public string? ErrorMessage { get; init; }
    public int RecordCount { get; init; }

    public static AiToolResult Ok(
        string toolName,
        object data,
        int recordCount = 0)
        => new()
        {
            Success = true,
            ToolName = toolName,
            Data = data,
            RecordCount = recordCount
        };

    public static AiToolResult Fail(
        string toolName,
        string error)
        => new()
        {
            Success = false,
            ToolName = toolName,
            ErrorMessage = error
        };

    public string ToJsonString()
        => JsonSerializer.Serialize(this,
            new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            });
}