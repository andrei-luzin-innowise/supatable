namespace Supatable.Application.Features.Users;

public sealed record UserRowDto(
    Guid Id,
    string Email,
    string FullName,
    string Role,
    DateTime CreatedAt
);