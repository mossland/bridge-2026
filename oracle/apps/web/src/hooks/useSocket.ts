"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

// 빈 문자열이면 현재 도메인 사용 (상대 경로)
const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export interface SocketStats {
  signals: number;
  issues: number;
  proposals: number;
  activeProposals: number;
}

export interface SignalsCollectedEvent {
  count: number;
  total: number;
  signals: any[];
}

export interface IssuesDetectedEvent {
  newCount: number;
  totalCount: number;
  issues: any[];
}

export interface ProposalCreatedEvent {
  proposal: any;
  totalCount: number;
  activeCount: number;
}

export interface ProposalVotedEvent {
  proposalId: string;
  vote: any;
  tally: {
    forVotes: string;
    againstVotes: string;
    abstainVotes: string;
    totalVotes: string;
    participationRate: number;
  };
}

type SocketEventHandler<T> = (data: T) => void;

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [stats, setStats] = useState<SocketStats | null>(null);
  const socketRef = useRef<Socket | null>(null);

  // Event handlers storage
  const handlersRef = useRef<{
    signalsCollected: SocketEventHandler<SignalsCollectedEvent>[];
    issuesDetected: SocketEventHandler<IssuesDetectedEvent>[];
    proposalCreated: SocketEventHandler<ProposalCreatedEvent>[];
    proposalVoted: SocketEventHandler<ProposalVotedEvent>[];
  }>({
    signalsCollected: [],
    issuesDetected: [],
    proposalCreated: [],
    proposalVoted: [],
  });

  useEffect(() => {
    // Initialize socket connection
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("🔌 Socket connection error:", error);
    });

    // Stats update on connection
    socket.on("stats:update", (data: SocketStats) => {
      setStats(data);
    });

    // Signal events
    socket.on("signals:collected", (data: SignalsCollectedEvent) => {
      setStats((prev) => prev ? { ...prev, signals: data.total } : prev);
      handlersRef.current.signalsCollected.forEach((handler) => handler(data));
    });

    // Issue events
    socket.on("issues:detected", (data: IssuesDetectedEvent) => {
      setStats((prev) => prev ? { ...prev, issues: data.totalCount } : prev);
      handlersRef.current.issuesDetected.forEach((handler) => handler(data));
    });

    // Proposal events
    socket.on("proposals:created", (data: ProposalCreatedEvent) => {
      setStats((prev) => prev ? {
        ...prev,
        proposals: data.totalCount,
        activeProposals: data.activeCount,
      } : prev);
      handlersRef.current.proposalCreated.forEach((handler) => handler(data));
    });

    // Vote events
    socket.on("proposals:voted", (data: ProposalVotedEvent) => {
      handlersRef.current.proposalVoted.forEach((handler) => handler(data));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Subscribe to signal collection events
  const onSignalsCollected = useCallback((handler: SocketEventHandler<SignalsCollectedEvent>) => {
    handlersRef.current.signalsCollected.push(handler);
    return () => {
      handlersRef.current.signalsCollected = handlersRef.current.signalsCollected.filter(
        (h) => h !== handler
      );
    };
  }, []);

  // Subscribe to issue detection events
  const onIssuesDetected = useCallback((handler: SocketEventHandler<IssuesDetectedEvent>) => {
    handlersRef.current.issuesDetected.push(handler);
    return () => {
      handlersRef.current.issuesDetected = handlersRef.current.issuesDetected.filter(
        (h) => h !== handler
      );
    };
  }, []);

  // Subscribe to proposal creation events
  const onProposalCreated = useCallback((handler: SocketEventHandler<ProposalCreatedEvent>) => {
    handlersRef.current.proposalCreated.push(handler);
    return () => {
      handlersRef.current.proposalCreated = handlersRef.current.proposalCreated.filter(
        (h) => h !== handler
      );
    };
  }, []);

  // Subscribe to vote events
  const onProposalVoted = useCallback((handler: SocketEventHandler<ProposalVotedEvent>) => {
    handlersRef.current.proposalVoted.push(handler);
    return () => {
      handlersRef.current.proposalVoted = handlersRef.current.proposalVoted.filter(
        (h) => h !== handler
      );
    };
  }, []);

  return {
    isConnected,
    stats,
    socket: socketRef.current,
    onSignalsCollected,
    onIssuesDetected,
    onProposalCreated,
    onProposalVoted,
  };
}
