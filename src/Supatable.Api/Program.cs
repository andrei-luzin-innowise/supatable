using Serilog;
using Supatable.Application;
using Supatable.Api.GraphQL;
using Supatable.Application.Features.Users;
using Microsoft.EntityFrameworkCore;
using Supatable.Infrastructure.Persistence.Ef;
using Supatable.Infrastructure.Persistence.Dapper;

var builder = WebApplication.CreateBuilder(args);

builder.Host.UseSerilog((ctx, lc) =>
{
    lc
        .MinimumLevel.Debug()
        .Enrich.FromLogContext()
        .WriteTo.Console();
});

builder.Logging.AddFilter("HotChocolate", LogLevel.Debug);
builder.Logging.AddFilter("Microsoft", LogLevel.Warning);
builder.Logging.AddFilter("System", LogLevel.Warning);

builder.Services
    .AddGraphQLServer()
    //.ModifyRequestOptions(o => o.IncludeExceptionDetails = true)
    .AddQueryType<Query>();

builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(typeof(ApplicationAssemblyMarker).Assembly));

builder.Services.Configure<DatabaseOptions>(opt =>
{
    opt.ConnectionString =
        builder.Configuration.GetConnectionString("Default")
        ?? throw new InvalidOperationException("ConnectionStrings:Default is missing");
});

builder.Services.AddDbContext<SupatableDbContext>(opt =>
    opt.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
       .UseSnakeCaseNamingConvention());

builder.Services.AddScoped<IUsersReadRepository, UsersReadRepository>();

var app = builder.Build();

app.UseSerilogRequestLogging();

app.MapGraphQL("/graphql");

app.Run();