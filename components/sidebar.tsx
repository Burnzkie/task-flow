"use client";

import { useState, useTransition } from "react"; 
import { createProject }           from "@/app/actions/projects";
import { showToast }               from "@/components/toast";
import { UserButton }              from "@clerk/nextjs";
import Link                        from "next/link";
import type { Project }            from "@/types";

const COLORS = [
  "#7c6af7", "#5eb8f7", "#5ec97c",
  "#f5a623", "#f76a6a", "#f472b6",
];

interface Props { 
  initialProjects: Project[];
}

export default function Sidebar({ initialProjects }: Props) {
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
    <aside className="w-56 border-r border-white/10 flex flex-col p-4 gap-1">
      {/* Logo */}
      <div className="flex items-center gap-2 p-2 mb-4">
        <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-sm font-bold">
          T
        </div>
        <span className="font-semibold">TaskFlow</span>
      </div>

      {/* Nav links */}
      <Link href="/dashboard"           className="nav-item">Dashboard</Link>
      <Link href="/dashboard/tasks"     className="nav-item">All Tasks</Link>
      <Link href="/dashboard/projects"  className="nav-item">Projects</Link>
      <Link href="/dashboard/analytics" className="nav-item">Analytics</Link>

      {/* Projects section */}
      <div className="mt-4 mb-1 flex items-center justify-between px-2">
        <span className="text-xs text-gray-500 uppercase tracking-wider">Projects</span>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-gray-600 hover:text-violet-400 transition-colors text-lg leading-none"
          title="New project"
        >
          +
        </button>
      </div>

      {/* Inline create form */}
      {showForm && (
        <div className="mx-1 mb-2 bg-gray-800/80 border border-white/10 rounded-xl p-3 flex flex-col gap-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name..."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter")  handleCreate();
              if (e.key === "Escape") setShowForm(false);
            }}
            className="bg-transparent text-xs text-white placeholder-gray-600
                       outline-none border-b border-white/10 pb-1"
          />
          <div className="flex gap-1.5 flex-wrap">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-4 h-4 rounded-full transition-all ${
                  color === c ? "ring-1 ring-white ring-offset-1 ring-offset-gray-800 scale-110" : ""
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleCreate}
              disabled={isPending || !name.trim()}
              className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-[10px]
                         py-1 rounded-lg transition-colors disabled:opacity-50"
            >
              {isPending ? "..." : "Create"}
            </button>
            <button
              onClick={() => { setShowForm(false); setName(""); }}
              className="px-2 text-[10px] text-gray-600 hover:text-gray-400 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Project list */}
      <div className="flex-1 overflow-y-auto">
        {projects.length === 0 ? (
          <p className="text-xs text-gray-700 px-2 py-1">No projects yet</p>
        ) : (
          projects.map((p) => (
            <Link key={p.id} href={`/dashboard?project=${p.id}`} className="nav-item">
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
              <span className="truncate">{p.name}</span>
            </Link>
          ))
        )}
      </div>

      {/* User */}
      <div className="pt-4 border-t border-white/10">
        <UserButton afterSignOutUrl="/sign-in" /> 
      </div>
    </aside>
  );
}