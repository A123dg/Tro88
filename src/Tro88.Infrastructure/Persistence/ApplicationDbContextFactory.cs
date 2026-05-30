using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Tro88.Application.Common.Interfaces;
using Tro88.Infrastructure.Persistence.Interceptors;

namespace Tro88.Infrastructure.Persistence;

public class ApplicationDbContextFactory
    : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        LoadEnvFile(Directory.GetCurrentDirectory());

        var connectionString = args.FirstOrDefault()
            ?? BuildConfiguration().GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException(
                "Connection string 'DefaultConnection' not found.");

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        optionsBuilder.UseSqlServer(connectionString, sql =>
            sql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName));

        return new ApplicationDbContext(
            optionsBuilder.Options,
            new AuditableEntityInterceptor(
                new DesignTimeCurrentUserService(),
                TimeProvider.System),
            new DomainEventDispatchInterceptor());
    }

    private static IConfiguration BuildConfiguration()
    {
        var basePath = Path.Combine(
            Directory.GetCurrentDirectory(),
            "..",
            "Tro88.API");

        return new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .AddEnvironmentVariables()
            .Build();
    }

    private static void LoadEnvFile(string startPath)
    {
        var envPath = FindEnvFile(startPath);
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

    private static string? FindEnvFile(string startPath)
    {
        var directory = new DirectoryInfo(startPath);
        while (directory is not null)
        {
            var envPath = Path.Combine(directory.FullName, ".env");
            if (File.Exists(envPath))
                return envPath;

            directory = directory.Parent;
        }

        return null;
    }

    private sealed class DesignTimeCurrentUserService : ICurrentUserService
    {
        public Guid UserId => Guid.Empty;
        public string Email => string.Empty;
        public string Role => string.Empty;
        public bool IsAuthenticated => false;
        public bool IsInRole(string role) => false;
    }
}
