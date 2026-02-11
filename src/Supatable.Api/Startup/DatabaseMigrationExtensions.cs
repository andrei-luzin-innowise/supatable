using Microsoft.EntityFrameworkCore;
using Supatable.Infrastructure.Persistence.Ef;

namespace Supatable.Api.Startup;

public static class DatabaseMigrationExtensions
{
    public static async Task ApplyDatabaseMigrationsAsync(this WebApplication app)
    {
        var enabled = app.Configuration.GetValue<bool>("Database:MigrateOnStartup");
        app.Logger.LogInformation("Database:MigrateOnStartup={Enabled}", enabled);

        if (!enabled)
        {
            app.Logger.LogInformation("Database migrations skipped.");
            return;
        }

        using var scope = app.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<SupatableDbContext>();

        const int maxAttempts = 20;
        for (var attempt = 1; attempt <= maxAttempts; attempt++)
        {
            try
            {
                app.Logger.LogInformation("Applying EF migrations (attempt {Attempt}/{Max})...", attempt, maxAttempts);
                await db.Database.MigrateAsync();
                app.Logger.LogInformation("EF migrations applied successfully.");
                return;
            }
            catch (Exception ex)
            {
                app.Logger.LogWarning(ex, "Failed to apply migrations (attempt {Attempt}/{Max}).", attempt, maxAttempts);
                await Task.Delay(TimeSpan.FromSeconds(2));
            }
        }

        throw new InvalidOperationException("Could not apply EF migrations on startup.");
    }
}