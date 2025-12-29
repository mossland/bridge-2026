"use client";

import { useSocketContext } from "@/contexts/SocketContext";
import { Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function RealtimeIndicator() {
  const { isConnected, stats } = useSocketContext();

  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          "flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium transition-colors",
          isConnected
            ? "bg-green-100 text-green-700"
            : "bg-red-100 text-red-700"
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3 h-3" />
            <span>Live</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span>Offline</span>
          </>
        )}
      </div>
      {isConnected && stats && (
        <div className="hidden md:flex items-center space-x-3 text-xs text-gray-500">
          <span>{stats.signals.toLocaleString()} signals</span>
          <span>{stats.issues} issues</span>
          <span>{stats.activeProposals} active</span>
        </div>
      )}
    </div>
  );
}
