using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using StackExchange.Redis;
using Tro88.Application.Common.Interfaces;
using Tro88.Application.Features.AiAgent;
using Tro88.Application.Features.AiAgent.Tools;
using Tro88.Infrastructure.BackgroundServices;
using Tro88.Infrastructure.Identity;
using Tro88.Infrastructure.Persistence;
using Tro88.Infrastructure.Persistence.Interceptors;
using Tro88.Infrastructure.Services.Auth;
using Tro88.Infrastructure.Services.Cache;
using Tro88.Infrastructure.Services.Email;
using Tro88.Infrastructure.Services.Notification;
using Tro88.Infrastructure.Services.Ai;
using Tro88.Infrastructure.Services.Pdf;
using Tro88.Infrastructure.Services.Storage;
using Tro88.Infrastructure.Settings;

namespace Tro88.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // EF Core SQL Server
        services.AddDbContext<ApplicationDbContext>(opt =>
            opt.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                sql =>
                {
                    sql.MigrationsAssembly(
                        typeof(ApplicationDbContext).Assembly.FullName);
                    sql.EnableRetryOnFailure(5, TimeSpan.FromSeconds(30), null);
                    sql.CommandTimeout(30);
                }));

        services.AddScoped<IApplicationDbContext>(p =>
            p.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<AuditableEntityInterceptor>();
        services.AddScoped<DomainEventDispatchInterceptor>();
        services.AddSingleton(TimeProvider.System);
        services.AddHttpContextAccessor();

        // BCrypt password hasher
        services.AddScoped<IPasswordHasher, BcryptPasswordHasher>();

        // JWT
        services.Configure<JwtSettings>(
            configuration.GetSection("JwtSettings"));
        services.AddScoped<IJwtService, JwtService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();

        // Google OAuth
        services.Configure<GoogleAuthSettings>(
            configuration.GetSection("GoogleAuth"));
        services.AddScoped<IGoogleAuthService, GoogleAuthService>();

        // Cloudinary
        services.Configure<CloudinarySettings>(
            configuration.GetSection("Cloudinary"));
        services.AddScoped<IStorageService, CloudinaryStorageService>();

        // Redis
        services.AddSingleton<IConnectionMultiplexer>(sp =>
            ConnectionMultiplexer.Connect(
                configuration.GetConnectionString("Redis")!));
        services.Configure<RedisSettings>(configuration);
        services.AddScoped<ICacheService, RedisCacheService>();

        // Email
        services.Configure<EmailSettings>(configuration.GetSection("Email"));
        services.AddScoped<IEmailService, EmailService>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IPdfService, PdfService>();

        services.Configure<GeminiSettings>(configuration.GetSection("Gemini"));
        services.PostConfigure<GeminiSettings>(options =>
        {
            options.ApiKey = FirstNonEmpty(
                options.ApiKey,
                Environment.GetEnvironmentVariable("GEMINI_API_KEY"))
                ?? string.Empty;

            options.Model = FirstNonEmpty(
                options.Model,
                Environment.GetEnvironmentVariable("GEMINI_MODEL"))
                ?? "gemini-2.0-flash";

            if (int.TryParse(
                    Environment.GetEnvironmentVariable("GEMINI_MAX_TOKENS"),
                    out var maxTokens) && maxTokens > 0)
                options.MaxTokens = maxTokens;

            options.BaseUrl = FirstNonEmpty(
                options.BaseUrl,
                Environment.GetEnvironmentVariable("GEMINI_BASE_URL"))
                ?? "https://generativelanguage.googleapis.com";
        });
        services.AddHttpClient("Gemini", client =>
        {
            client.Timeout = TimeSpan.FromSeconds(60);
            client.DefaultRequestHeaders.Add("Accept", "application/json");
        });

        // AI Tools
        services.AddScoped<IAiTool, GetAvailableRoomsTool>();
        services.AddScoped<IAiTool, GetTenantBillsTool>();
        services.AddScoped<IAiTool, GetContractsTool>();
        services.AddScoped<IAiTool, GetRevenueSummaryTool>();
        services.AddScoped<IAiTool, GetRoomDetailsTool>();
        services.AddScoped<IAiTool, GetUnpaidInvoicesTool>();

        // AI Tool Manager
        services.AddScoped<IAiToolManager, AiToolManager>();

        services.AddScoped<IAiService, GeminiAiService>();

        // BackgroundService (PeriodicTimer, không Hangfire)
        services.AddHostedService<ContractExpiryService>();
        services.AddHostedService<InvoiceReminderService>();
        services.AddHostedService<NotificationCleanupService>();
        services.AddHostedService<OverdueInvoiceService>();
        services.AddHostedService<ContractExpiryNotifyService>();

        // SignalR is registered in API layer

        return services;
    }

    private static string? FirstNonEmpty(params string?[] values)
        => values.FirstOrDefault(v => !string.IsNullOrWhiteSpace(v));
}
