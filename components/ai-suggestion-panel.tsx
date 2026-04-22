"use client";

import { useState } from "react";
import type { Project } from "@/types";

interface Suggestion {
  title:    string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  tags:     string[];
}

interface Props {
  projects:        Project[];
  existingTasks:   string[];   // ← now receives real task titles
  onUseSuggestion: (suggestion: Suggestion & { projectId: string }) => void;
}

const PRIORITY_COLORS = {
  HIGH:   "bg-red-500/20 text-red-400",
  MEDIUM: "bg-amber-500/20 text-amber-400",
  LOW:    "bg-green-500/20 text-green-400",
};

export default function AISuggestionPanel({ projects, existingTasks, onUseSuggestion }: Props) {
  const [open,            setOpen]            = useState(false);
  const [loading,         setLoading]         = useState(false);
  const [suggestions,     setSuggestions]     = useState<Suggestion[]>([]);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id ?? "");
  const [error,           setError]           = useState("");

  async function fetchSuggestions() {
    setLoading(true);
    setError("");
    const project = projects.find((p) => p.id === selectedProject);
    try {
      const res = await fetch("/api/ai/suggest", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName:   project?.name ?? "My Project",
          existingTasks, // ← passes real tasks now
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSuggestions(data.suggestions);
    } catch {
      setError("Failed to get suggestions. Check your API key.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setOpen((o) => !o); if (!open && !suggestions.length) fetchSuggestions(); }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/20 hover:bg-violet-500/30
                   text-violet-300 text-sm rounded-lg transition-colors border border-violet-500/30"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M5 5.5C5 4.1 6 3 7.5 3S10 4.1 10 5.5c0 1-0.7 1.8-1.5 2.2V9H7V7.3"
                stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          <circle cx="7.5" cy="11" r="0.6" fill="currentColor"/>
        </svg>
        AI Suggest
      </button>

      {open && (
        <div className="absolute top-10 right-0 w-80 bg-gray-900 border border-white/15
                        rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div>
              <p className="text-sm font-medium text-white">AI task suggestions</p>
              <p className="text-xs text-gray-500 mt-0.5">Based on your {existingTasks.length} existing tasks</p>
            </div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs text-gray-400 outline-none"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="p-3 max-h-96 overflow-y-auto">
            {loading && (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-500">Analyzing your tasks…</p>
              </div>
            )}
            {error && <div className="text-xs text-red-400 text-center py-4">{error}</div>}
            {!loading && !error && suggestions.map((s, i) => (
              <div key={i}
                className="group flex flex-col gap-2 p-3 rounded-lg hover:bg-white/5
                           transition-colors cursor-pointer border border-transparent
                           hover:border-white/10 mb-2"
                onClick={() => { onUseSuggestion({ ...s, projectId: selectedProject }); setOpen(false); }}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm text-gray-200 leading-snug flex-1">{s.title}</p>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 ${PRIORITY_COLORS[s.priority]}`}>
                    {s.priority}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1 flex-wrap">
                    {s.tags.map((tag) => (
                      <span key={tag} className="text-[10px] bg-white/5 text-gray-500 px-1.5 py-0.5 rounded">{tag}</span>
                    ))}
                  </div>
                  <span className="text-[10px] text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Use this →
                  </span>
                </div>
              </div>
            ))}
          </div>

          {!loading && (
            <div className="p-3 border-t border-white/10">
              <button onClick={fetchSuggestions}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition-colors py-1.5">
                ↺ Regenerate
              </button>
            </div>
          )}
        </div>
      )}

      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  );
}