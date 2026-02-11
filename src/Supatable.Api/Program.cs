using Microsoft.EntityFrameworkCore;
using OpenTelemetry.Metrics;
using Serilog;
using Serilog.Enrichers.Span;
using Supatable.Api.Startup;
using Supatable.Api.GraphQL;
using Supatable.Api.Observability;
using Supatable.Application;
using Supatable.Application.Features.Users;
using Supatable.Infrastructure.Persistence.Dapper;
using Supatable.Infrastructure.Persistence.Ef;

var builder = WebApplication.CreateBuilder(args);

// serilog
builder.Host.UseSerilog((ctx, lc) =>
{
    lc.ReadFrom.Configuration(ctx.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithEnvironmentName()
        .Enrich.WithProcessId()
        .Enrich.WithThreadId()
        .Enrich.WithSpan();
});

// OpenTelemetry Metrics (/metrics)
builder.Services.AddOpenTelemetry()
    .WithMetrics(m =>
    {
        m.AddAspNetCoreInstrumentation()
         .AddHttpClientInstrumentation()
         .AddRuntimeInstrumentation()
         .AddProcessInstrumentation()
         .AddMeter("Supatable.Api")
         .AddPrometheusExporter();
    });

// GraphQL
builder.Services
    .AddGraphQLServer()
    //.ModifyRequestOptions(o => o.IncludeExceptionDetails = true)
    .AddQueryType<Query>();

// MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(ApplicationAssemblyMarker).Assembly));

// DB options
var cs = builder.Configuration.GetConnectionString("Default")
         ?? throw new InvalidOperationException("ConnectionStrings:Default is missing");

builder.Services.Configure<DatabaseOptions>(opt => opt.ConnectionString = cs);

builder.Services.AddDbContext<SupatableDbContext>(opt =>
    opt.UseNpgsql(cs)
       .UseSnakeCaseNamingConvention());

// repos
builder.Services.AddScoped<IUsersReadRepository, UsersReadRepository>();

var app = builder.Build();

await app.ApplyDatabaseMigrationsAsync();

// request logs (method/path/status/duration)
app.UseSerilogRequestLogging(options =>
{
    options.GetLevel = (httpContext, elapsed, ex) =>
    {
        var path = httpContext.Request.Path;

        return path.StartsWithSegments("/metrics")
            ? Serilog.Events.LogEventLevel.Debug
            : Serilog.Events.LogEventLevel.Information;
    };
});
app.UseTraceId();

// static
app.UseDefaultFiles();
app.UseStaticFiles();

// GraphQL endpoint
app.MapGraphQL("/graphql");

// Prometheus
app.MapPrometheusScrapingEndpoint("/metrics");

// SPA fallback
app.MapFallbackToFile("index.html");

app.Run();