using MediatR;
using Microsoft.Extensions.Logging;

namespace Tro88.Application.Common.Behaviors;

public sealed class LoggingBehavior<TRequest, TResponse>
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(
        ILogger<LoggingBehavior<TRequest, TResponse>> logger)
        => _logger = logger;

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken ct)
    {
        var name = typeof(TRequest).Name;

        _logger.LogInformation(
            "Handling {RequestName}", name);

        try
        {
            var response = await next();

            _logger.LogInformation(
                "Handled {RequestName}", name);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Error handling {RequestName}", name);
            throw;
        }
    }
}