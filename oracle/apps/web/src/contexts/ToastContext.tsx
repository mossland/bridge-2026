"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { ToastContainer, ToastData, ToastType, ToastCategory } from "@/components/Toast";

interface ToastContextValue {
  toasts: ToastData[];
  addToast: (toast: Omit<ToastData, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  // 편의 메서드
  success: (title: string, message?: string, options?: ToastOptions) => string;
  error: (title: string, message?: string, options?: ToastOptions) => string;
  warning: (title: string, message?: string, options?: ToastOptions) => string;
  info: (title: string, message?: string, options?: ToastOptions) => string;
}

interface ToastOptions {
  category?: ToastCategory;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 5000; // 5초

interface ToastProviderProps {
  children: React.ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = "top-right",
  maxToasts = 5
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const addToast = useCallback((toast: Omit<ToastData, "id">): string => {
    const id = crypto.randomUUID();
    const newToast: ToastData = {
      ...toast,
      id,
      duration: toast.duration ?? DEFAULT_DURATION,
    };

    setToasts((prev) => {
      const updated = [newToast, ...prev];
      // 최대 개수 제한
      if (updated.length > maxToasts) {
        return updated.slice(0, maxToasts);
      }
      return updated;
    });

    return id;
  }, [maxToasts]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const createToastHelper = useCallback(
    (type: ToastType) =>
      (title: string, message?: string, options?: ToastOptions): string => {
        return addToast({
          type,
          title,
          message,
          category: options?.category,
          duration: options?.duration,
          action: options?.action,
        });
      },
    [addToast]
  );

  const success = useCallback(
    (title: string, message?: string, options?: ToastOptions) =>
      createToastHelper("success")(title, message, options),
    [createToastHelper]
  );

  const error = useCallback(
    (title: string, message?: string, options?: ToastOptions) =>
      createToastHelper("error")(title, message, options),
    [createToastHelper]
  );

  const warning = useCallback(
    (title: string, message?: string, options?: ToastOptions) =>
      createToastHelper("warning")(title, message, options),
    [createToastHelper]
  );

  const info = useCallback(
    (title: string, message?: string, options?: ToastOptions) =>
      createToastHelper("info")(title, message, options),
    [createToastHelper]
  );

  const value: ToastContextValue = {
    toasts,
    addToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer
        toasts={toasts}
        onDismiss={removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
