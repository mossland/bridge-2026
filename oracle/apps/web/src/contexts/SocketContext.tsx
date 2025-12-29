"use client";

import React, { createContext, useContext, ReactNode } from "react";
import {
  useSocket,
  SocketStats,
  SignalsCollectedEvent,
  IssuesDetectedEvent,
  ProposalCreatedEvent,
  ProposalVotedEvent,
} from "@/hooks/useSocket";
import { Socket } from "socket.io-client";

interface SocketContextType {
  isConnected: boolean;
  stats: SocketStats | null;
  socket: Socket | null;
  onSignalsCollected: (handler: (data: SignalsCollectedEvent) => void) => () => void;
  onIssuesDetected: (handler: (data: IssuesDetectedEvent) => void) => () => void;
  onProposalCreated: (handler: (data: ProposalCreatedEvent) => void) => () => void;
  onProposalVoted: (handler: (data: ProposalVotedEvent) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketData = useSocket();

  return (
    <SocketContext.Provider value={socketData}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
}
