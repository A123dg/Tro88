using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Tro88.Application.Common.Behaviors;

public sealed class PerformanceBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<PerformanceBehavior<TRequest, TResponse>> _logger;
    private const long ThreshholdMs = 500;

    public PerformanceBehavior(
        ILogger<PerformanceBehavior<TRequest, TResponse>> logger)
        => _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();
        var response = await next();
        sw.Stop();

        var elapsedMs = sw.ElapsedMilliseconds;
        var name = typeof(TRequest).Name;

        if (elapsedMs > ThreshholdMs)
        {
            _logger.LogWarning(
                "Long Running {RequestName}: {ElapsedMs}ms",
                name, elapsedMs);
        }

        return response;
    }
}