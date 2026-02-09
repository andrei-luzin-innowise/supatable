using System.Diagnostics;

namespace Supatable.Api.Observability;

public sealed class TraceIdMiddleware(RequestDelegate next)
{
    private static readonly ActivitySource ActivitySource = new("Supatable.Api");

    public async Task Invoke(HttpContext ctx)
    {
        if (Activity.Current is null && !ctx.Request.Headers.ContainsKey("traceparent"))
        {
            if (ctx.Request.Headers.TryGetValue("x-trace-id", out var header) &&
                TryParseTraceId(header.ToString(), out var incomingTraceId))
            {
                var parent = new ActivityContext(
                    incomingTraceId,
                    ActivitySpanId.CreateRandom(),
                    ActivityTraceFlags.Recorded);

                using var _ = ActivitySource.StartActivity(
                    "incoming-x-trace-id",
                    ActivityKind.Server,
                    parent);

                await Run(ctx);
                return;
            }
        }

        await Run(ctx);

        async Task Run(HttpContext httpContext)
        {
            httpContext.Response.OnStarting(() =>
            {
                var traceId = Activity.Current?.TraceId.ToString();
                if (!string.IsNullOrWhiteSpace(traceId))
                    httpContext.Response.Headers["x-trace-id"] = traceId;

                return Task.CompletedTask;
            });

            await next(httpContext);
        }
    }

    private static bool TryParseTraceId(string value, out ActivityTraceId traceId)
    {
        value = value.Trim();
        if (value.Length != 32)
        {
            traceId = default;
            return false;
        }

        for (var i = 0; i < value.Length; i++)
        {
            var c = value[i];
            var isHex =
                (c >= '0' && c <= '9') ||
                (c >= 'a' && c <= 'f') ||
                (c >= 'A' && c <= 'F');

            if (!isHex)
            {
                traceId = default;
                return false;
            }
        }

        traceId = ActivityTraceId.CreateFromString(value.AsSpan());
        return traceId != default;
    }
}
