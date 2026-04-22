"use client";

import { useState, useTransition }   from "react";
import { useAuth }                   from "@clerk/nextjs";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { updateTaskStatus }          from "@/app/actions/tasks";
import { useRealtimeTasks }          from "@/hooks/use-realtime-task";
import TaskCard                      from "./task-card";
import CreateTaskForm                from "./create-task-form";
import AISuggestionPanel             from "./ai-suggestion-panel";
import type { Task, Project }        from "@/types";
import Link                          from "next/link";

const COLUMNS = [
  { id: "BACKLOG",     label: "Backlog",     color: "#5a5a6a" },
  { id: "TODO",        label: "To Do",       color: "#5eb8f7" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#f5a623" },
  { id: "IN_REVIEW",   label: "In Review",   color: "#7c6af7" },
  { id: "DONE",        label: "Done",        color: "#5ec97c" },
] as const;

interface Props {
  initialTasks: Task[];
  projects:     Project[];
}

export default function KanbanBoard({ initialTasks, projects }: Props) {
  const [tasks, setTasks]             = useState(initialTasks);
  const [, startTransition]           = useTransition();
  const { userId }                    = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // prefill: stores AI suggestion to pre-fill the "Add task" form
  const [prefill, setPrefill] = useState<null | {
    title: string; priority: string; tags: string; projectId: string;
  }>(null);

  useRealtimeTasks(userId ?? "", setTasks);

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    const newStatus = destination.droppableId as Task["status"];
    setTasks((prev) =>
      prev.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t))
    );
    startTransition(() => { updateTaskStatus(draggableId, newStatus); });
  }

  // No projects empty state
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 bg-violet-500/10 rounded-2xl flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect x="4" y="4" width="24" height="24" rx="6" stroke="#7c6af7" strokeWidth="1.5"/>
            <path d="M16 10v12M10 16h12" stroke="#7c6af7" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <p className="text-white font-medium">No projects yet</p>
        <p className="text-gray-500 text-sm">Create a project first before adding tasks</p>
        {/* fixed: was href="/projects" — leads to 404 */}
        <Link href="/dashboard/projects"
          className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm
                     rounded-lg transition-colors">
          Create a Project
        </Link>
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <span className="text-sm text-gray-400">
          {tasks.length} task{tasks.length !== 1 ? "s" : ""}
        </span>
        <AISuggestionPanel
          projects={projects}
          existingTasks={tasks.map((t) => t.title)}
          onUseSuggestion={(s) => {
            // fixed: now actually stores prefill AND opens the TODO column form
            setPrefill({
              title:     s.title,
              priority:  s.priority,
              tags:      s.tags.join(", "),
              projectId: s.projectId,
            });
          }}
        />
      </div>

      <div className="flex gap-4 p-6 overflow-x-auto h-full">
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);

          return (
            <div key={col.id} className="flex flex-col min-w-[272px] max-w-[272px]">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-sm text-gray-400">{col.label}</span>
                <span className="ml-auto text-xs text-gray-600 bg-white/5 px-2 py-0.5 rounded-full">
                  {columnTasks.length}
                </span>
              </div>

              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 min-h-[60px] rounded-xl p-1 transition-colors ${
                      snapshot.isDraggingOver ? "bg-violet-500/10" : ""
                    }`}
                  >
                    {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-6 text-xs text-gray-700 border border-dashed border-white/5 rounded-lg">
                        No tasks
                      </div>
                    )}
                    {columnTasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={provided.draggableProps.style}
                          >
                            <TaskCard
                              task={task}
                              isDragging={snapshot.isDragging}
                              onEdit={setEditingTask}
                              onDeleted={(id) =>
                                setTasks((prev) => prev.filter((t) => t.id !== id))
                              }
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {/* fixed: pass prefill to the TODO column form so AI suggestions pre-fill it */}
              <CreateTaskForm
                projects={projects}
                defaultStatus={col.id}
                prefillData={col.id === "TODO" ? prefill : null}
                onCreated={(newTask) => {
                  setTasks((prev) => [...prev, newTask as Task]);
                  setPrefill(null); // clear prefill after use
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Edit modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                        flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-white/15 rounded-2xl p-6 w-full max-w-md">
            <CreateTaskForm
              projects={projects}
              editTask={editingTask}
              forceOpen={true}
              onUpdated={(updated) => {
                setTasks((prev) =>
                  prev.map((t) => (t.id === editingTask.id ? (updated as Task) : t))
                );
                setEditingTask(null);
              }}
              onCancel={() => setEditingTask(null)}
            />
          </div>
        </div>
      )}
    </DragDropContext>
  );
}