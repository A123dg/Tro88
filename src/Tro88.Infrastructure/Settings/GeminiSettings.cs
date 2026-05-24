namespace Tro88.Infrastructure.Settings;

public class GeminiSettings
{
    public string ApiKey { get; set; } = default!;
    public string Model { get; set; } = "gemini-2.5-flash";
    public int MaxTokens { get; set; } = 2048;
    public string BaseUrl { get; set; }
        = "https://generativelanguage.googleapis.com";
}
