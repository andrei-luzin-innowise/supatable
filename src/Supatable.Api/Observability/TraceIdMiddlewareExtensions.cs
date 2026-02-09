namespace Supatable.Api.Observability;

public static class TraceIdMiddlewareExtensions
{
    public static IApplicationBuilder UseTraceId(this IApplicationBuilder app)
        => app.UseMiddleware<TraceIdMiddleware>();
}