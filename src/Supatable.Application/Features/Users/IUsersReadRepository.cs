namespace Supatable.Application.Features.Users;

public interface IUsersReadRepository
{
    Task<GetUsersResult> GetUsersAsync(GetUsersQuery query, CancellationToken ct);
}