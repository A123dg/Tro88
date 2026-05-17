using Microsoft.EntityFrameworkCore;
using Tro88.Infrastructure.Persistence;

namespace Tro88.API.Extensions;

public static class WebApplicationExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await dbContext.Database.EnsureCreatedAsync();
    }
}
