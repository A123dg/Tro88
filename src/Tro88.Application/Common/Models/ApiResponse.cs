namespace Tro88.Application.Common.Models;

public class ApiResponse<T>
{
    public int Code { get; set; } = 200;
    public bool Success { get; set; }
    public string? Message { get; set; }
    public T? Data { get; set; }
    public MetaData? MetaData { get; set; }

    public static ApiResponse<T> Ok(
        T? data,
        string? message = null,
        MetaData? metaData = null)
        => new()
        {
            Code = 200,
            Success = true,
            Message = message,
            Data = data,
            MetaData = metaData
        };

    public static ApiResponse<T> Fail(
        string message,
        T? data = default)
        => new()
        {
            Code = 200,
            Success = false,
            Message = message,
            Data = data
        };
}