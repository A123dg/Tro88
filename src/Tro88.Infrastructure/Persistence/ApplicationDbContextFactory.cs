using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Tro88.Application.Common.Interfaces;

namespace Tro88.Infrastructure.Persistence;

public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        var connectionString = args.FirstOrDefault()
            ?? "Server=localhost,1433;Database=Tro88;User Id=sa;Password=YourStrong@Password;TrustServerCertificate=True;MultipleActiveResultSets=True";

        optionsBuilder.UseSqlServer(connectionString);

        return new ApplicationDbContext(
            optionsBuilder.Options,
            new Persistence.Interceptors.AuditableEntityInterceptor(new DesignTimeCurrentUserService(), TimeProvider.System),
            new Persistence.Interceptors.DomainEventDispatchInterceptor());
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
