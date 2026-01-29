namespace Supatable.Api.GraphQL;

public sealed class UsersInput
{
    public string? Search { get; set; }
    public string? Role { get; set; } = "All";
    public int Offset { get; set; } = 0;
    public int Limit { get; set; } = 50;
}