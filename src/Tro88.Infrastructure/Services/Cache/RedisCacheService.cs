using System.Text.Json;
using Microsoft.Extensions.Options;
using StackExchange.Redis;
using Tro88.Application.Common.Interfaces;

namespace Tro88.Infrastructure.Services.Cache;

public class RedisCacheService : ICacheService
{
    private readonly IConnectionMultiplexer _redis;
    private readonly RedisSettings _settings;

    public RedisCacheService(
        IConnectionMultiplexer redis,
        IOptions<RedisSettings> settings)
    {
        _redis = redis;
        _settings = settings.Value;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var value = await db.StringGetAsync(key);

        if (value.IsNullOrEmpty)
            return default;

        return JsonSerializer.Deserialize<T>(value!);
    }

    public async Task SetAsync<T>(
        string key,
        T value,
        TimeSpan? expiry = null,
        CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        var json = JsonSerializer.Serialize(value);
        var expiration = expiry ?? TimeSpan.FromMinutes(_settings.DefaultExpiryMinutes);

        await db.StringSetAsync(key, json, expiration);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(key);
    }

    public async Task<T> GetOrSetAsync<T>(
        string key,
        Func<Task<T>> factory,
        TimeSpan? expiry = null,
        CancellationToken ct = default)
    {
        var cached = await GetAsync<T>(key, ct);
        if (cached is not null)
            return cached;

        var value = await factory();
        await SetAsync(key, value, expiry, ct);
        return value;
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken ct = default)
    {
        var db = _redis.GetDatabase();
        return await db.KeyExistsAsync(key);
    }
}

public class RedisSettings
{
    public int DefaultExpiryMinutes { get; set; } = 30;
}
