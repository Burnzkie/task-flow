"use client";

import { useEffect, useState } from "react";

interface Toast {
  id:      number;
  message: string;
  type:    "success" | "error" | "info";
}

let toastId = 0;
const listeners: ((toasts: Toast[]) => void)[] = [];
let currentToasts: Toast[] = [];

export function showToast(message: string, type: Toast["type"] = "success") {
  const toast = { id: ++toastId, message, type };
  currentToasts = [...currentToasts, toast];
  listeners.forEach((l) => l(currentToasts));
  setTimeout(() => {
    currentToasts = currentToasts.filter((t) => t.id !== toast.id);
    listeners.forEach((l) => l(currentToasts));
  }, 3000);
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]); // fixed: was "toast"

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      const i = listeners.indexOf(setToasts);
      if (i > -1) listeners.splice(i, 1);
    };
  }, []);

  const colors = {
    success: "border-green-500/30 bg-green-500/10 text-green-300",
    error:   "border-red-500/30 bg-red-500/10 text-red-300",
    info:    "border-violet-500/30 bg-violet-500/10 text-violet-300",
  };

  const dots = {
    success: "bg-green-400",
    error:   "bg-red-400",
    info:    "bg-violet-400",
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[100]">
      {toasts.map((t) => ( // fixed: was "toast"
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm
                      shadow-xl animate-in slide-in-from-bottom-2 duration-300
                      ${colors[t.type]}`}
        >
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dots[t.type]}`} />
          {t.message}
        </div>
      ))}
    </div>
  );
}