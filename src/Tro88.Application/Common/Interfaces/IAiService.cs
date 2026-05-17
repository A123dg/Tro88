namespace Tro88.Application.Common.Interfaces;

public interface IAiService
{
    Task<AiChatResult> ChatAsync(
        List<AiChatMessage> messages,
        string? systemPrompt = null,
        CancellationToken ct = default);

    Task<AiTaskResult> RunAgentTaskAsync(
        string taskType,
        string taskInput,
        Guid userId,
        CancellationToken ct = default);
}

public sealed record AiChatMessage(string Role, string Content);

public sealed record AiChatResult(
    string Content,
    int InputTokens,
    int OutputTokens);

public sealed record AiTaskResult(
    bool Success,
    string Output,
    string? ErrorMessage = null);
