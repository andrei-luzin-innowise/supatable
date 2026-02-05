import React, { useMemo, useState } from "react";

export type UsersQueryInput = {
    search: string;
    role: string; // "All" | "Admin" | ...
    offset: number;
    limit: number;
};

export type UserRow = {
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
};

export type UsersResponse = {
    items: UserRow[];
    totalCount: number;
};

const USERS_QUERY = `
  query Users($input: UsersInput!) {
    users(input: $input) {
      totalCount
      items {
        id
        email
        fullName
        role
        createdAt
      }
    }
  }
`;

async function fetchUsersFromBE(input: UsersQueryInput): Promise<UsersResponse> {
    const res = await fetch("/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
            query: USERS_QUERY,
            variables: { input },
        }),
    });

    const json: any = await res.json();

    if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${JSON.stringify(json)}`);
    }

    if (json.errors?.length) {
        throw new Error(json.errors[0]?.message ?? "GraphQL error");
    }

    const data = json.data?.users;
    return {
        items: data?.items ?? [],
        totalCount: data?.totalCount ?? 0,
    };
}

function useUsers(input: UsersQueryInput) {
    const [rows, setRows] = useState<UserRow[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchUsersFromBE(input);

                if (cancelled) return;
                setRows(data.items);
                setTotalCount(data.totalCount);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [input.search, input.role, input.offset, input.limit]);

    return { rows, totalCount, loading, error };
}

function formatDate(iso: string) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleString();
}

function Pill({
                  children,
                  tone = "neutral",
              }: {
    children: React.ReactNode;
    tone?: "neutral" | "blue" | "green";
}) {
    const cls =
        tone === "blue"
            ? "border-sky-700/40 bg-sky-950/30 text-sky-200"
            : tone === "green"
                ? "border-emerald-700/40 bg-emerald-950/30 text-emerald-200"
                : "border-zinc-700/60 bg-zinc-950/40 text-zinc-200";

    return (
        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] leading-none ${cls}`}>
      {children}
    </span>
    );
}

function Icon({ name }: { name: "fields" | "filter" | "search" }) {
    const common = "h-4 w-4 text-zinc-400";
    switch (name) {
        case "search":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.3-4.3" />
                </svg>
            );
        case "filter":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9v7l4 2v-9l8-9Z" />
                </svg>
            );
        case "fields":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            );
    }
}

export default function TablePage() {
    const [query, setQuery] = useState<UsersQueryInput>({
        search: "",
        role: "All",
        offset: 0,
        limit: 50,
    });

    const [draftSearch, setDraftSearch] = useState("");

    // debounce search -> write into query.search + reset pagination
    React.useEffect(() => {
        const t = window.setTimeout(() => {
            setQuery((q) => ({ ...q, search: draftSearch, offset: 0 }));
        }, 250);

        return () => window.clearTimeout(t);
    }, [draftSearch]);

    const { rows, totalCount, loading, error } = useUsers(query);

    const hasFilter = query.search.trim().length > 0 || query.role !== "All";

    const [sort, setSort] = useState<{ key: keyof UserRow; dir: "asc" | "desc" }>({
        key: "createdAt",
        dir: "desc",
    });

    const columns = useMemo(
        () =>
            [
                { key: "id", title: "Id" },
                { key: "email", title: "Email" },
                { key: "fullName", title: "Full name" },
                { key: "role", title: "Role" },
                { key: "createdAt", title: "Created" },
            ] as const,
        []
    );

    const sortedRows = useMemo(() => {
        const copy = [...rows];

        const cmp = (a: UserRow, b: UserRow) => {
            const k = sort.key;

            if (k === "createdAt") {
                const av = Date.parse(a.createdAt);
                const bv = Date.parse(b.createdAt);
                return (av - bv) * (sort.dir === "asc" ? 1 : -1);
            }

            const av = String(a[k] ?? "");
            const bv = String(b[k] ?? "");
            return av.localeCompare(bv) * (sort.dir === "asc" ? 1 : -1);
        };

        copy.sort(cmp);
        return copy;
    }, [rows, sort.key, sort.dir]);

    function handleSortClick(key: keyof UserRow) {
        setSort((s) =>
            s.key === key
                ? { key, dir: s.dir === "asc" ? "desc" : "asc" }
                : { key, dir: "asc" }
        );
    }

    function renderSortIcon(key: keyof UserRow) {
        if (sort.key !== key) return "A↕";
        return sort.dir === "asc" ? "A↑" : "A↓";
    }

    return (
        <div className="min-h-screen bg-[#0B0F19] text-zinc-100">
            <div className="mx-auto max-w-[1200px] px-4 py-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold tracking-tight">users</h1>
                            <Pill tone="neutral">read-only</Pill>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">Prisma-like data table (filters - GraphQL variables).</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        {loading ? (
                            <Pill tone="blue">Loading…</Pill>
                        ) : (
                            <Pill tone="neutral">
                                Showing <span className="text-zinc-200">{rows.length}</span>
                                <span className="text-zinc-500">&nbsp;/ {totalCount}</span>
                            </Pill>
                        )}
                    </div>
                </div>

                {/* Toolbar */}
                <div className="mt-4 rounded-xl border border-zinc-800/70 bg-[#0E1424]">
                    <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">

                            {/* Search */}
                            <div className="relative w-full md:max-w-md">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                    <Icon name="search" />
                                </div>

                                <input
                                    value={draftSearch}
                                    onChange={(e) => setDraftSearch(e.target.value)}
                                    placeholder="Search…"
                                    className="w-full rounded-lg border border-zinc-800/80 bg-[#0B0F19] py-2 pl-10 pr-3 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-zinc-600"
                                />
                            </div>

                            {/* Role */}
                            <select
                                value={query.role}
                                onChange={(e) => setQuery((q) => ({ ...q, role: e.target.value, offset: 0 }))}
                                className="w-full rounded-lg border border-zinc-800/80 bg-[#0B0F19] px-3 py-2 text-xs text-zinc-100 outline-none focus:border-zinc-600 md:w-56"
                                title="Role"
                            >
                                <option value="All">role: All</option>
                                <option value="Admin">role: Admin</option>
                                <option value="Manager">role: Manager</option>
                                <option value="User">role: User</option>
                            </select>

                            {hasFilter && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setDraftSearch("");
                                        setQuery({ search: "", role: "All", offset: 0, limit: 50 });
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-[#0B0F19] px-3 py-2 text-xs text-zinc-200 hover:border-zinc-700"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {hasFilter && (
                        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-800/70 px-3 py-2 text-[11px] text-zinc-400">
                            <span className="text-zinc-500">Active:</span>
                            {query.search.trim() && <Pill>search: “{query.search.trim()}”</Pill>}
                            {query.role !== "All" && <Pill>role: {query.role}</Pill>}
                        </div>
                    )}
                </div>

                {/* Table */}
                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800/70 bg-[#0E1424]">
                    <div className="overflow-x-hidden">
                        <table className="w-full table-fixed border-separate border-spacing-0 text-xs">
                            <thead className="sticky top-0 z-10 bg-[#0E1424]">
                            <tr>
                                <th className="w-[260px] whitespace-nowrap border-b border-zinc-800/70 px-4 py-3 text-left font-medium text-zinc-300">
                                    <div className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-100"
                                         onClick={() => handleSortClick("id")}>
                                        <span className="lowercase">id</span>
                                        <span className="text-[10px] text-zinc-500">{renderSortIcon("id")}</span>
                                    </div>
                                </th>

                                <th className="w-[320px] whitespace-nowrap border-b border-zinc-800/70 px-4 py-3 text-left font-medium text-zinc-300">
                                    <div className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-100"
                                         onClick={() => handleSortClick("email")}>
                                        <span className="lowercase">email</span>
                                        <span className="text-[10px] text-zinc-500">{renderSortIcon("email")}</span>
                                    </div>
                                </th>

                                <th className="w-[280px] whitespace-nowrap border-b border-zinc-800/70 px-4 py-3 text-left font-medium text-zinc-300">
                                    <div className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-100"
                                         onClick={() => handleSortClick("fullName")}>
                                        <span className="lowercase">full name</span>
                                        <span className="text-[10px] text-zinc-500">{renderSortIcon("fullName")}</span>
                                    </div>
                                </th>

                                <th className="w-[140px] whitespace-nowrap border-b border-zinc-800/70 px-4 py-3 text-left font-medium text-zinc-300">
                                    <div className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-100"
                                         onClick={() => handleSortClick("role")}>
                                        <span className="lowercase">role</span>
                                        <span className="text-[10px] text-zinc-500">{renderSortIcon("role")}</span>
                                    </div>
                                </th>

                                <th className="w-[220px] whitespace-nowrap border-b border-zinc-800/70 px-4 py-3 text-left font-medium text-zinc-300">
                                    <div className="flex items-center gap-2 cursor-pointer select-none hover:text-zinc-100"
                                         onClick={() => handleSortClick("createdAt")}>
                                        <span className="lowercase">created</span>
                                        <span className="text-[10px] text-zinc-500">{renderSortIcon("createdAt")}</span>
                                    </div>
                                </th>
                            </tr>
                            </thead>

                            <tbody className="[&>tr:last-child>td]:border-b-0">
                            {error && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-6 text-sm text-red-300">
                                        Error: {error}
                                    </td>
                                </tr>
                            )}

                            {!error && loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                                        Loading…
                                    </td>
                                </tr>
                            )}

                            {!error && !loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-10 text-center text-zinc-400">
                                        No results
                                    </td>
                                </tr>
                            )}

                            {sortedRows.map((r) => (
                                <tr key={r.id} className="group hover:bg-[#0B0F19]/70">
                                    <td className="border-b border-zinc-800/60 px-4 py-3 font-mono text-[11px] text-zinc-400">
                                        <div className="truncate">{r.id}</div>
                                    </td>

                                    <td className="border-b border-zinc-800/60 px-4 py-3 font-mono text-[11px] text-zinc-100">
                                        <div className="truncate">{r.email}</div>
                                    </td>

                                    <td className="border-b border-zinc-800/60 px-4 py-3 text-zinc-100">
                                        <div className="truncate">{r.fullName}</div>
                                    </td>

                                    <td className="border-b border-zinc-800/60 px-4 py-3">
                                      <span className="inline-flex items-center rounded-md border border-zinc-700/70 bg-[#0B0F19] px-2 py-1 font-mono text-[11px] text-zinc-200">
                                        {r.role}
                                      </span>
                                    </td>

                                    <td className="border-b border-zinc-800/60 px-4 py-3 font-mono text-[11px] text-zinc-500">
                                        <div className="truncate">{formatDate(r.createdAt)}</div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex items-center justify-between border-t border-zinc-800/70 px-4 py-3 text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2"></div>
                        <div className="font-mono">{loading ? "fetching…" : "ready"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
