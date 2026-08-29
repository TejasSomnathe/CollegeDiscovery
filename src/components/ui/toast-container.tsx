"use client";

import { useEffect, useState } from "react";
import { CheckCircleIcon, XCircleIcon, AlertTriangleIcon, InfoIcon, XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "warning" | "info";
}

const ICONS = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  warning: AlertTriangleIcon,
  info: InfoIcon,
};

const COLORS = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { detail } = e as CustomEvent<Toast>;
      setToasts((prev) => [...prev, detail]);
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== detail.id));
      }, 4000);
    };
    window.addEventListener("campus-toast", handler);
    return () => window.removeEventListener("campus-toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type];
        return (
          <div
            key={toast.id}
            className={cn(
              "flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium",
              COLORS[toast.type]
            )}
          >
            <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-current opacity-60 hover:opacity-100"
            >
              <XIcon className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
