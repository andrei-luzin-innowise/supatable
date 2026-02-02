using MediatR;
using Supatable.Application.Features.Users;

namespace Supatable.Api.GraphQL;

public sealed class Query
{
    public string Ping() => "pong";

    public Task<GetUsersResult> Users(
        UsersInput input,
        [Service] IMediator mediator,
        [Service] ILogger<Query> logger,
        CancellationToken ct)
    {
        try
        {
            return mediator.Send(
                new GetUsersQuery(
                    input.Search,
                    input.Role,
                    input.Offset,
                    input.Limit),
                ct);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error while executing users query with input {@Input}", input);
            throw;
        }
    }
}