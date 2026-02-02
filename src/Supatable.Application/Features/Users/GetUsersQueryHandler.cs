using MediatR;

namespace Supatable.Application.Features.Users;

public sealed class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, GetUsersResult>
{
    private readonly IUsersReadRepository _repo;

    public GetUsersQueryHandler(IUsersReadRepository repo) => _repo = repo;

    public Task<GetUsersResult> Handle(GetUsersQuery request, CancellationToken ct)
        => _repo.GetUsersAsync(request, ct);
}