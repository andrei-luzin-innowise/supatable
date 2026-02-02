using Dapper;
using Microsoft.Extensions.Options;
using Npgsql;
using Supatable.Application.Features.Users;

namespace Supatable.Infrastructure.Persistence.Dapper;

public sealed class UsersReadRepository : IUsersReadRepository
{
    private readonly string _cs;

    public UsersReadRepository(IOptions<DatabaseOptions> options)
    {
        _cs = options.Value.ConnectionString;
        
        if (string.IsNullOrWhiteSpace(_cs))
            throw new InvalidOperationException("DatabaseOptions.ConnectionString is missing");
    }

    public async Task<GetUsersResult> GetUsersAsync(GetUsersQuery request, CancellationToken ct)
    {
        await using var conn = new NpgsqlConnection(_cs);
        await conn.OpenAsync(ct);

        var where = new List<string>();
        var p = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(request.Role) && request.Role != "All")
        {
            where.Add("role = @role");
            p.Add("role", request.Role);
        }

        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            where.Add("(email ILIKE @q OR full_name ILIKE @q OR role ILIKE @q)");
            p.Add("q", $"%{request.Search}%");
        }

        var whereSql = where.Count == 0 ? "" : "WHERE " + string.Join(" AND ", where);

        var offset = Math.Max(0, request.Offset);
        var limit = request.Limit is < 1 or > 200 ? 50 : request.Limit;

        p.Add("offset", offset);
        p.Add("limit", limit);

        var totalSql = $@"
SELECT COUNT(*)
FROM users
{whereSql};";

        var itemsSql = $@"
SELECT id, email, full_name AS FullName, role, created_at AS CreatedAt
FROM users
{whereSql}
ORDER BY created_at DESC
OFFSET @offset
LIMIT @limit;";

        var total = await conn.ExecuteScalarAsync<int>(new CommandDefinition(totalSql, p, cancellationToken: ct));
        var items = (await conn.QueryAsync<UserRowDto>(new CommandDefinition(itemsSql, p, cancellationToken: ct)))
            .AsList();

        return new GetUsersResult(items, total);
    }
}
