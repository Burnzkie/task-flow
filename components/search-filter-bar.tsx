"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect }        from "react";
import { useDebounce }                             from "@/hooks/use-debounce";

const PRIORITIES = ["HIGH", "MEDIUM", "LOW"] as const;
const STATUSES   = ["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"] as const;

const STATUS_LABELS: Record<string, string> = {
  BACKLOG: "Backlog", TODO: "To Do", IN_PROGRESS: "In Progress",
  IN_REVIEW: "In Review", DONE: "Done",
};

export default function SearchFilterBar() {
  const router       = useRouter();
  const pathname     = usePathname();
  const searchParams = useSearchParams();

  const [query,    setQuery]    = useState(searchParams.get("q") ?? "");
  const [priority, setPriority] = useState(searchParams.get("priority") ?? "");
  const [status,   setStatus]   = useState(searchParams.get("status") ?? "");

  const debouncedQuery = useDebounce(query, 300);

  const updateURL = useCallback(
    (q: string, pri: string, st: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (q)   params.set("q", q);          else params.delete("q");
      if (pri) params.set("priority", pri);  else params.delete("priority");
      if (st)  params.set("status", st);     else params.delete("status");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  // fixed: added updateURL to dependency array
  useEffect(() => {
    updateURL(debouncedQuery, priority, status);
  }, [debouncedQuery, priority, status, updateURL]);

  const hasFilters = query || priority || status;

  return (
    <div className="flex items-center gap-2 px-6 py-3 border-b border-white/10 flex-wrap">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10
                      rounded-lg px-3 py-1.5 flex-1 min-w-[200px] max-w-xs">
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <circle cx="5.5" cy="5.5" r="4" stroke="#666" strokeWidth="1.3"/>
          <path d="M9 9l2.5 2.5" stroke="#666" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tasks..."
          className="bg-transparent text-sm text-white placeholder-gray-600 outline-none w-full"
        />
        {query && (
          <button onClick={() => setQuery("")} className="text-gray-600 hover:text-gray-300 text-xs">
            ✕
          </button>
        )}
      </div>

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5
                   text-sm text-gray-400 outline-none cursor-pointer"
      >
        <option value="">All Priorities</option>
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p[0] + p.slice(1).toLowerCase()}</option>
        ))}
      </select>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5
                   text-sm text-gray-400 outline-none cursor-pointer"
      >
        <option value="">All Statuses</option>
        {STATUSES.map((s) => (
          <option key={s} value={s}>{STATUS_LABELS[s]}</option>
        ))}
      </select>

      {hasFilters && (
        <button
          onClick={() => { setQuery(""); setPriority(""); setStatus(""); }}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2"
        >
          Clear all
        </button>
      )}

      {hasFilters && (
        <span className="text-xs bg-violet-500/20 text-violet-300 px-2 py-1 rounded-full">
          {[query, priority, status].filter(Boolean).length} active
        </span>
      )}
    </div>
  );
}