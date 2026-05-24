namespace Tro88.Application.Features.AiAgent;

public sealed class AiToolManager : IAiToolManager
{
    private readonly Dictionary<string, IAiTool> _tools;
    private readonly ILogger<AiToolManager> _logger;

    public AiToolManager(
        IEnumerable<IAiTool> tools,
        ILogger<AiToolManager> logger)
    {
        _logger = logger;
        _tools = tools.ToDictionary(
            t => t.Name,
            t => t,
            StringComparer.OrdinalIgnoreCase);

        _logger.LogInformation(
            "AiToolManager registered {Count} tools: {Names}",
            _tools.Count,
            string.Join(", ", _tools.Keys));
    }

    public IReadOnlyList<IAiTool> GetAllTools()
        => _tools.Values.ToList().AsReadOnly();

    public IAiTool? GetTool(string name)
        => _tools.TryGetValue(name, out var tool) ? tool : null;

    public object[] BuildGeminiFunctionDeclarations()
        => _tools.Values.Select(t => new
        {
            name = t.Name,
            description = t.Description,
            parameters = t.ParametersSchema
        }).ToArray<object>();

    public async Task<AiToolResult> ExecuteToolAsync(
        string toolName,
        string parametersJson,
        Guid userId,
        CancellationToken ct = default)
    {
        var tool = GetTool(toolName);
        if (tool is null)
        {
            _logger.LogWarning("Tool {Name} not found", toolName);
            return AiToolResult.Fail(toolName, $"Tool '{toolName}' not found");
        }

        return await tool.ExecuteAsync(parametersJson, userId, ct);
    }
}