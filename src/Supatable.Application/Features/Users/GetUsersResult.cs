namespace Supatable.Application.Features.Users;

public sealed record GetUsersResult(
    IReadOnlyList<UserRowDto> Items,
    int TotalCount
);