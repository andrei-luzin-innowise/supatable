import React, {useMemo, useState} from "react";

/**
 * Данные, которые придут с BE (пока заглушка).
 * Потом это станет результатом useQuery(Apollo) или fetchGraphQL().
 */
type UserRow = {
    id: string;
    email: string;
    fullName: string;
    role: "Admin" | "User" | "Manager";
    createdAt: string; // ISO
};

type TableQuery = {
    search: string; // общий поиск
    role: "All" | UserRow["role"];
};

function delay(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

// --- Mock BE ---
async function fetchUsersFromBE(query: TableQuery): Promise<UserRow[]> {
    // имитируем сеть
    await delay(250);

    const all: UserRow[] = [
        {id: "1", email: "john@example.com", fullName: "John Smith", role: "Admin", createdAt: "2025-11-01T10:00:00Z"},
        {
            id: "2",
            email: "alice@example.com",
            fullName: "Alice Johnson",
            role: "User",
            createdAt: "2025-11-07T12:30:00Z"
        },
        {id: "3", email: "bob@example.com", fullName: "Bob Stone", role: "Manager", createdAt: "2025-12-10T09:15:00Z"},
        {id: "4", email: "kate@example.com", fullName: "Kate Brown", role: "User", createdAt: "2026-01-05T18:40:00Z"},
    ];

    const s = query.search.trim().toLowerCase();

    return all.filter((x) => {
        const matchesRole = query.role === "All" ? true : x.role === query.role;
        const matchesSearch =
            s.length === 0
                ? true
                : x.email.toLowerCase().includes(s) ||
                x.fullName.toLowerCase().includes(s) ||
                x.role.toLowerCase().includes(s);

        return matchesRole && matchesSearch;
    });
}

// Хук-обёртка над "BE" (потом заменишь на useQuery)
function useUsers(query: TableQuery) {
    const [rows, setRows] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                setLoading(true);
                setError(null);

                const data = await fetchUsersFromBE(query);
                if (!cancelled) setRows(data);
            } catch (e) {
                if (!cancelled) setError(e instanceof Error ? e.message : "Unknown error");
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [query.search, query.role]);

    return {rows, loading, error};
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

function Icon({name}: { name: "fields" | "filter" | "search" | "plus" }) {
    // мини-иконки (без библиотек)
    const common = "h-4 w-4 text-zinc-400";
    switch (name) {
        case "search":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7"/>
                    <path d="M21 21l-4.3-4.3"/>
                </svg>
            );
        case "filter":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 3H2l8 9v7l4 2v-9l8-9Z"/>
                </svg>
            );
        case "fields":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
            );
        case "plus":
            return (
                <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                </svg>
            );
    }
}

export default function TablePage() {
    // Это то, что позже улетит в GraphQL variables: { search, role, ... }
    const [query, setQuery] = useState<TableQuery>({search: "", role: "All"});

    // небольшой debounce, чтобы не стрелять запросом на каждый чих
    const [draftSearch, setDraftSearch] = useState("");
    React.useEffect(() => {
        const t = window.setTimeout(() => {
            setQuery((q) => ({...q, search: draftSearch}));
        }, 250);
        return () => window.clearTimeout(t);
    }, [draftSearch]);

    const {rows, loading, error} = useUsers(query);

    const hasFilter = query.search.trim().length > 0 || query.role !== "All";

    const columns = useMemo(
        () => [
            {key: "email", title: "Email"},
            {key: "fullName", title: "Full name"},
            {key: "role", title: "Role"},
            {key: "createdAt", title: "Created"},
        ] as const,
        []
    );

    return (
        <div className="min-h-screen bg-[#0B0F19] text-zinc-100">
            <div className="mx-auto max-w-[1200px] px-4 py-6">
                {/* Top header row (таблички как вкладки/модели — тут просто заголовок) */}
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg font-semibold tracking-tight">users</h1>
                            <Pill tone="neutral">read-only</Pill>
                        </div>
                        <div className="mt-1 text-xs text-zinc-400">
                            Prisma-like data table (filters will map to GraphQL variables).
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        {loading ? (
                            <Pill tone="blue">Loading…</Pill>
                        ) : (
                            <Pill tone="neutral">
                                Showing <span className="text-zinc-200">{rows.length}</span>
                            </Pill>
                        )}
                    </div>
                </div>

                {/* Toolbar (Fields / Filters / Search / Add record) */}
                <div className="mt-4 rounded-xl border border-zinc-800/70 bg-[#0E1424]">
                    <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-[#0B0F19] px-3 py-2 text-xs text-zinc-200 hover:border-zinc-700"
                                title="Fields (stub)"
                            >
                                <Icon name="fields"/>
                                Fields
                                <span className="text-zinc-500">All</span>
                            </button>

                            <button
                                type="button"
                                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-[#0B0F19] px-3 py-2 text-xs text-zinc-200 hover:border-zinc-700"
                                title="Filters (stub)"
                            >
                                <Icon name="filter"/>
                                Filters
                                <span className="text-zinc-500">—</span>
                            </button>

                            {/* Search input */}
                            <div className="relative w-full md:max-w-md">
                                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                                    <Icon name="search"/>
                                </div>

                                <input
                                    value={draftSearch}
                                    onChange={(e) => setDraftSearch(e.target.value)}
                                    placeholder="Search…"
                                    className="w-full rounded-lg border border-zinc-800/80 bg-[#0B0F19] py-2 pl-10 pr-3 text-xs text-zinc-100 placeholder:text-zinc-500 outline-none  focus:border-zinc-600"
                                />
                            </div>


                            {/* Role filter (как быстрый dropdown) */}
                            <select
                                value={query.role}
                                onChange={(e) => setQuery((q) => ({...q, role: e.target.value as TableQuery["role"]}))}
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
                                        setQuery({search: "", role: "All"});
                                    }}
                                    className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/80 bg-[#0B0F19] px-3 py-2 text-xs text-zinc-200 hover:border-zinc-700"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {hasFilter && (
                        <div
                            className="flex flex-wrap items-center gap-2 border-t border-zinc-800/70 px-3 py-2 text-[11px] text-zinc-400">
                            <span className="text-zinc-500">Active:</span>
                            {query.search.trim() && <Pill>search: “{query.search.trim()}”</Pill>}
                            {query.role !== "All" && <Pill>role: {query.role}</Pill>}
                        </div>
                    )}
                </div>

                {/* Table container */}
                <div className="mt-4 overflow-hidden rounded-xl border border-zinc-800/70 bg-[#0E1424]">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border-separate border-spacing-0 text-xs">
                            {/* Sticky header like Prisma */}
                            <thead className="sticky top-0 z-10 bg-[#0E1424]">
                            <tr>
                                {columns.map((c) => (
                                    <th
                                        key={c.key}
                                        className="whitespace-nowrap border-b border-zinc-800/70 px-4 py-3 text-left font-medium text-zinc-300"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="lowercase">{c.title}</span>
                                            <span className="text-[10px] text-zinc-500">A↕</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody className="[&>tr:last-child>td]:border-b-0">
                            {error && (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-6 text-sm text-red-300">
                                        Error: {error}
                                    </td>
                                </tr>
                            )}

                            {!error && loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-10 text-center text-zinc-400">
                                        Loading…
                                    </td>
                                </tr>
                            )}

                            {!error && !loading && rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-4 py-10 text-center text-zinc-400">
                                        No results
                                    </td>
                                </tr>
                            )}

                            {rows.map((r) => (
                                <tr key={r.id} className="group hover:bg-[#0B0F19]/70">
                                    <td className="border-b border-zinc-800/60 px-4 py-3 font-mono text-[11px] text-zinc-400">
                                        {r.id}
                                    </td>
                                    <td className="border-b border-zinc-800/60 px-4 py-3 font-mono text-[11px] text-zinc-100">
                                        {r.email}
                                    </td>
                                    <td className="border-b border-zinc-800/60 px-4 py-3 text-zinc-100">
                                        {r.fullName}
                                    </td>
                                    <td className="border-b border-zinc-800/60 px-4 py-3">
                      <span
                          className="inline-flex items-center rounded-md border border-zinc-700/70 bg-[#0B0F19] px-2 py-1 font-mono text-[11px] text-zinc-200">
                        {r.role}
                      </span>
                                    </td>
                                    <td className="border-b border-zinc-800/60 px-4 py-3 font-mono text-[11px] text-zinc-500">
                                        {formatDate(r.createdAt)}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Bottom bar */}
                    <div
                        className="flex items-center justify-between border-t border-zinc-800/70 px-4 py-3 text-[11px] text-zinc-500">
                        <div className="flex items-center gap-2">
                            <span className="text-zinc-600">Tip:</span>
                            <span>header is sticky, rows highlight on hover (Prisma-ish)</span>
                        </div>
                        <div className="font-mono">{loading ? "fetching…" : "ready"}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
