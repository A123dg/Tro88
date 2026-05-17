using Serilog;
using Serilog.Sinks.MSSqlServer;
using Microsoft.AspNetCore.DataProtection;
using Tro88.API.Extensions;
using Tro88.API.Middleware;
using Tro88.Application;
using Tro88.Infrastructure;
using Tro88.Infrastructure.Hubs;

LoadEnvFile(Directory.GetCurrentDirectory());

var builder = WebApplication.CreateBuilder(args);

LoadEnvFile(builder.Environment.ContentRootPath);
builder.Configuration.AddEnvironmentVariables();

builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(new DirectoryInfo(
        Path.Combine(builder.Environment.ContentRootPath, "App_Data", "DataProtectionKeys")));

// Serilog - log vào Console + SQL Server
builder.Host.UseSerilog((ctx, lc) => lc
    .ReadFrom.Configuration(ctx.Configuration)
    .WriteTo.Console()
    .WriteTo.MSSqlServer(
        ctx.Configuration.GetConnectionString("DefaultConnection"),
        new MSSqlServerSinkOptions
        {
            TableName = "AppLogs",
            SchemaName = "dbo",
            AutoCreateSqlTable = true
        }));

builder.Services.AddApplicationServices();
builder.Services.AddInfrastructureServices(builder.Configuration);
builder.Services.AddApiServices(builder.Configuration);

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint(
        "/swagger/v1/swagger.json", "Tro88 API v1"));
    await app.InitialiseDatabaseAsync();
}

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();
app.UseHttpsRedirection();
app.UseCors("Tro88Policy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notifications");

app.Run();

static void LoadEnvFile(string contentRootPath)
{
    var envPath = FindEnvFile(contentRootPath);
    if (envPath is null)
        return;

    foreach (var rawLine in File.ReadAllLines(envPath))
    {
        var line = rawLine.Trim();
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith('#'))
            continue;

        if (line.StartsWith("export ", StringComparison.OrdinalIgnoreCase))
            line = line["export ".Length..].TrimStart();

        var separatorIndex = line.IndexOf('=');
        if (separatorIndex <= 0)
            continue;

        var key = line[..separatorIndex].Trim();
        var value = line[(separatorIndex + 1)..].Trim();

        if (value.Length >= 2 &&
            ((value[0] == '"' && value[^1] == '"') ||
             (value[0] == '\'' && value[^1] == '\'')))
        {
            value = value[1..^1];
        }

        if (string.IsNullOrWhiteSpace(key) ||
            Environment.GetEnvironmentVariable(key) is not null)
        {
            continue;
        }

        Environment.SetEnvironmentVariable(key, value);
    }
}

static string? FindEnvFile(string startPath)
{
    var directory = new DirectoryInfo(startPath);
    while (directory is not null)
    {
        var envPath = Path.Combine(directory.FullName, ".env");
        if (File.Exists(envPath))
            return envPath;

        envPath = Path.Combine(directory.FullName, "tro88", ".env");
        if (File.Exists(envPath))
            return envPath;

        directory = directory.Parent;
    }

    return null;
}
