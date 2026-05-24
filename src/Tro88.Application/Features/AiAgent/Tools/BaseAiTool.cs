using System.Text.Json;
using Microsoft.Extensions.Logging;

namespace Tro88.Application.Features.AiAgent.Tools;

public abstract class BaseAiTool : IAiTool
{
    protected readonly IApplicationDbContext Db;
    protected readonly ILogger Logger;

    protected BaseAiTool(
        IApplicationDbContext db,
        ILogger logger)
    {
        Db = db;
        Logger = logger;
    }

    public abstract string Name { get; }
    public abstract string Description { get; }
    public abstract object ParametersSchema { get; }

    public async Task<AiToolResult> ExecuteAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct = default)
    {
        Logger.LogInformation(
            "Executing tool {Tool} for user {UserId}",
            Name, userId);
        try
        {
            return await ExecuteCoreAsync(
                parametersJson, userId, ct);
        }
        catch (JsonException ex)
        {
            Logger.LogWarning(ex,
                "Invalid JSON parameters for tool {Tool}",
                Name);
            return AiToolResult.Fail(Name,
                "Invalid parameters format");
        }
        catch (Exception ex)
        {
            Logger.LogError(ex,
                "Tool {Tool} execution failed", Name);
            return AiToolResult.Fail(Name,
                "Tool execution failed");
        }
    }

    protected abstract Task<AiToolResult> ExecuteCoreAsync(
        string parametersJson,
        Guid userId,
        CancellationToken ct);
}