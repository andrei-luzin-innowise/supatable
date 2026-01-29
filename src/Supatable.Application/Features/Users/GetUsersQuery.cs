using MediatR;

namespace Supatable.Application.Features.Users;

public sealed record GetUsersQuery(
    string? Search,
    string? Role,
    int Offset,
    int Limit
) : IRequest<GetUsersResult>;