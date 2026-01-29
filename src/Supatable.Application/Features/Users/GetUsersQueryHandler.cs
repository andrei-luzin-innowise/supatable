using MediatR;

namespace Supatable.Application.Features.Users;

public sealed class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, GetUsersResult>
{
    public Task<GetUsersResult> Handle(GetUsersQuery request, CancellationToken ct)
    {
        var all = new List<UserRowDto>
        {
            new(Guid.Parse("11111111-1111-1111-1111-111111111111"), "john@example.com",  "John Smith",   "Admin",   DateTime.UtcNow.AddDays(-10)),
            new(Guid.Parse("22222222-2222-2222-2222-222222222222"), "alice@example.com", "Alice Johnson","User",    DateTime.UtcNow.AddDays(-3)),
            new(Guid.Parse("33333333-3333-3333-3333-333333333333"), "bob@example.com",   "Bob Stone",    "Manager", DateTime.UtcNow.AddDays(-1)),
        };

        IEnumerable<UserRowDto> filtered = all;

        var role = request.Role?.Trim();
        if (!string.IsNullOrWhiteSpace(role) && role != "All")
            filtered = filtered.Where(x => x.Role.Equals(role, StringComparison.OrdinalIgnoreCase));

        var search = request.Search?.Trim();
        if (!string.IsNullOrWhiteSpace(search))
        {
            filtered = filtered.Where(x =>
                x.Email.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                x.FullName.Contains(search, StringComparison.OrdinalIgnoreCase) ||
                x.Role.Contains(search, StringComparison.OrdinalIgnoreCase));
        }


        var total = filtered.Count();

        var items = filtered
            .Skip(Math.Max(0, request.Offset))
            .Take(request.Limit is < 1 or > 200 ? 50 : request.Limit)
            .ToList();

        return Task.FromResult(new GetUsersResult(items, total));
    }
}