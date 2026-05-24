namespace Tro88.Application.Common.Interfaces.AI;

public interface IAiToolManager
{
    IReadOnlyList<IAiTool> GetAllTools();
    IAiTool? GetTool(string name);
    object[] BuildGeminiFunctionDeclarations();

    Task<AiToolResult> ExecuteToolAsync(
        string toolName,
        string parametersJson,
        Guid userId,
        CancellationToken ct = default);
}