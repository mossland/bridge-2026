"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { config } from "@/lib/config";
import { SocketProvider } from "@/contexts/SocketContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { WebSocketToastHandler } from "@/components/WebSocketToastHandler";
import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <SocketProvider>
          <ToastProvider position="top-right" maxToasts={5}>
            <WebSocketToastHandler />
            {mounted ? (
              <RainbowKitProvider
                theme={darkTheme({
                  accentColor: "#16a34a",
                  accentColorForeground: "white",
                })}
              >
                {children}
              </RainbowKitProvider>
            ) : (
              children
            )}
          </ToastProvider>
        </SocketProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
