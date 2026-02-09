using System.Diagnostics.Metrics;

namespace Supatable.Api.Observability;

public static class AppMetrics
{
    public static readonly Meter Meter = new("Supatable.Api", "1.0.0");

    public static readonly Counter<long> UsersRequests =
        Meter.CreateCounter<long>("supatable_users_requests_total");

    public static readonly Histogram<double> UsersDurationMs =
        Meter.CreateHistogram<double>("supatable_users_duration_ms");

    public static readonly Counter<long> UsersErrors =
        Meter.CreateCounter<long>("supatable_users_errors_total");
}