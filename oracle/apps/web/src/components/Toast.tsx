"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
  Wifi,
  Activity,
  Vote,
  MessageCircle,
} from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";
export type ToastCategory = "system" | "signal" | "issue" | "proposal" | "debate" | "vote";

export interface ToastData {
  id: string;
  type: ToastType;
  category?: ToastCategory;
  title: string;
  message?: string;
  duration?: number; // ms, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
}

const typeStyles: Record<ToastType, { bg: string; icon: React.ElementType; iconColor: string }> = {
  success: {
    bg: "bg-green-50 border-green-200",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
  error: {
    bg: "bg-red-50 border-red-200",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  warning: {
    bg: "bg-yellow-50 border-yellow-200",
    icon: AlertTriangle,
    iconColor: "text-yellow-500",
  },
  info: {
    bg: "bg-blue-50 border-blue-200",
    icon: Info,
    iconColor: "text-blue-500",
  },
};

const categoryIcons: Record<ToastCategory, React.ElementType> = {
  system: Wifi,
  signal: Activity,
  issue: AlertTriangle,
  proposal: MessageCircle,
  debate: MessageCircle,
  vote: Vote,
};

interface ToastItemProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const style = typeStyles[toast.type];
  const Icon = toast.category ? categoryIcons[toast.category] : style.icon;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, 100 - (elapsed / toast.duration!) * 100);
        setProgress(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          handleDismiss();
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  return (
    <div
      className={cn(
        "relative flex items-start space-x-3 p-4 rounded-lg border shadow-lg",
        "transform transition-all duration-300 ease-out",
        isExiting
          ? "translate-x-full opacity-0"
          : "translate-x-0 opacity-100",
        style.bg
      )}
    >
      {/* Icon */}
      <div className={cn("flex-shrink-0 mt-0.5", style.iconColor)}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{toast.title}</p>
        {toast.message && (
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{toast.message}</p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-medium text-moss-600 hover:text-moss-700"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress bar */}
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50 rounded-b-lg overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-100 ease-linear",
              toast.type === "success" && "bg-green-400",
              toast.type === "error" && "bg-red-400",
              toast.type === "warning" && "bg-yellow-400",
              toast.type === "info" && "bg-blue-400"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

const positionStyles: Record<string, string> = {
  "top-right": "top-4 right-4",
  "top-left": "top-4 left-4",
  "bottom-right": "bottom-4 right-4",
  "bottom-left": "bottom-4 left-4",
  "top-center": "top-4 left-1/2 -translate-x-1/2",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
};

export function ToastContainer({
  toasts,
  onDismiss,
  position = "top-right",
}: ToastContainerProps) {
  return (
    <div
      className={cn(
        "fixed z-50 flex flex-col space-y-2 w-full max-w-sm pointer-events-none",
        positionStyles[position]
      )}
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={onDismiss} />
        </div>
      ))}
    </div>
  );
}
