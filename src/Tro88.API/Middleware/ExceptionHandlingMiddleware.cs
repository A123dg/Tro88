using System.Text.Json;
using Tro88.Application.Common.Constants;
using Tro88.Application.Common.Models;
using Tro88.Domain.Exceptions;

namespace Tro88.API.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (FluentValidation.ValidationException ex)
        {
            await WriteResponseAsync(
                context,
                ErrorMessages.COMMON_422,
                ex.Errors.Select(x => x.ErrorMessage));
        }
        catch (UnauthorizedAccessException)
        {
            await WriteResponseAsync(context, ErrorMessages.COMMON_401);
        }
        catch (ForbiddenException ex)
        {
            await WriteResponseAsync(context, ex.Message);
        }
        catch (NotFoundException ex)
        {
            await WriteResponseAsync(context, ex.Message);
        }
        catch (BusinessRuleException ex)
        {
            await WriteResponseAsync(context, ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception");
            await WriteResponseAsync(context, ErrorMessages.COMMON_500);
        }
    }

    private static async Task WriteResponseAsync(
        HttpContext context,
        string message,
        object? errors = null)
    {
        context.Response.ContentType = "application/json";
        context.Response.StatusCode = 200;

        var response = new ApiResponse<object>
        {
            Code = 200,
            Success = false,
            Message = message,
            Data = errors
        };

        await context.Response.WriteAsJsonAsync(response);
    }
}
