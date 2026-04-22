"use client";

import { useState, useTransition } from "react";
import { createProject }           from "@/app/actions/projects";
import { showToast }               from "@/components/toast";
import type { Project }            from "@/types";

const COLORS = [
  "#7c6af7", "#5eb8f7", "#5ec97c", "#f5a623",
  "#f76a6a", "#f472b6", "#34d399", "#60a5fa",
];

interface Props {
  initialProjects: Project[];
}

export default function ProjectsClient({ initialProjects }: Props) {
  const [projects,  setProjects]     = useState(initialProjects);
  const [showForm,  setShowForm]     = useState(false);
  const [name,      setName]         = useState("");
  const [color,     setColor]        = useState(COLORS[0]);
  const [isPending, startTransition] = useTransition();

  function handleCreate() {
    if (!name.trim()) return;
    startTransition(async () => {
      try {
        const p = await createProject({ name: name.trim(), color });
        setProjects((prev) => [...prev, p as Project]);
        setName("");
        setColor(COLORS[0]);
        setShowForm(false);
        showToast("Project created!");
      } catch {
        showToast("Failed to create project", "error");
      }
    });
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <h1 className="text-lg font-semibold">Projects</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm
                     rounded-lg transition-colors"
        >
          + New Project
        </button>
      </div>

      <div className="p-6 flex flex-col gap-4">
        {/* Create form */}
        {showForm && (
          <div className="bg-gray-800/60 border border-white/10 rounded-xl p-5 flex flex-col gap-4">
            <p className="text-sm font-medium text-white">New project</p>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Project name..."
              autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              className="bg-gray-700 border border-white/10 rounded-lg px-3 py-2
                         text-sm text-white outline-none placeholder-gray-600
                         focus:border-violet-500 transition-colors"
            />
            <div>
              <p className="text-xs text-gray-500 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-all ${
                      color === c ? "ring-2 ring-white ring-offset-2 ring-offset-gray-800 scale-110" : ""
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                disabled={isPending || !name.trim()}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm
                           rounded-lg transition-colors disabled:opacity-50"
              >
                {isPending ? "Creating..." : "Create Project"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-300 text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {projects.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="4" y="4" width="24" height="24" rx="6" stroke="#7c6af7" strokeWidth="1.5"/>
                <path d="M16 10v12M10 16h12" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p className="text-gray-400 text-sm">No projects yet</p>
            <p className="text-gray-600 text-xs">Create your first project to start adding tasks</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm
                         rounded-lg transition-colors mt-2"
            >
              + Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p.id}
                className="bg-gray-800/60 border border-white/10 rounded-xl p-5
                           hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                       style={{ background: p.color + "33" }}>
                    <div className="w-4 h-4 rounded-full" style={{ background: p.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-gray-500">
                      {(p as any)._count?.tasks ?? 0} tasks
                    </p>
                  </div>
                </div>
                <a href={`/dashboard?project=${p.id}`}
                   className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  View board →
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}