"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SocketProvider } from "@/contexts/SocketContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { WebSocketToastHandler } from "@/components/WebSocketToastHandler";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <SocketProvider>
        <ToastProvider position="top-right" maxToasts={5}>
          <WebSocketToastHandler />
          {children}
        </ToastProvider>
      </SocketProvider>
    </QueryClientProvider>
  );
}
