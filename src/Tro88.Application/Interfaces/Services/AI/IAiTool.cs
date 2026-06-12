namespace Tro88.Application.Interfaces.Services.AI;

public interface IAiTool
{
    string Name { get; }
    string Description { get; }
    object ParametersSchema { get; }

    Task<AiToolResult> ExecuteAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct = default);
}
