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

    private sealed class DesignTimeCurrentUserService : ICurrentUserService
    {
        public Guid UserId => Guid.Empty;
        public string Email => string.Empty;
        public string Role => string.Empty;
        public bool IsAuthenticated => false;
        public bool IsInRole(string role) => false;
    }
}
