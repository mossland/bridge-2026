"use client";

import { useEffect } from "react";
import { useSocketContext } from "@/contexts/SocketContext";
import { useToast } from "@/contexts/ToastContext";
import { useTranslations } from "next-intl";

export function useWebSocketToast() {
  const { isConnected, onSignalsCollected, onIssuesDetected, onProposalCreated, onProposalVoted, socket } = useSocketContext();
  const toast = useToast();
  const t = useTranslations("toast");

  useEffect(() => {
    // 연결 상태 변경 알림
    if (isConnected) {
      toast.success(t("connected.title"), t("connected.message"), {
        category: "system",
        duration: 3000,
      });
    }
  }, [isConnected]);

  useEffect(() => {
    // 신호 수집 알림
    const unsubSignals = onSignalsCollected((data) => {
      if (data.count > 0) {
        toast.info(
          t("signalsCollected.title"),
          t("signalsCollected.message", { count: data.count }),
          {
            category: "signal",
            duration: 4000,
          }
        );
      }
    });

    // 이슈 탐지 알림
    const unsubIssues = onIssuesDetected((data) => {
      if (data.count > 0) {
        const severity = data.issues[0]?.severity || "medium";
        const toastType = severity === "critical" ? "error" : severity === "high" ? "warning" : "info";

        if (toastType === "error") {
          toast.error(
            t("issuesDetected.title"),
            t("issuesDetected.message", { count: data.count }),
            {
              category: "issue",
              duration: 6000,
            }
          );
        } else if (toastType === "warning") {
          toast.warning(
            t("issuesDetected.title"),
            t("issuesDetected.message", { count: data.count }),
            {
              category: "issue",
              duration: 5000,
            }
          );
        } else {
          toast.info(
            t("issuesDetected.title"),
            t("issuesDetected.message", { count: data.count }),
            {
              category: "issue",
              duration: 4000,
            }
          );
        }
      }
    });

    // 제안 생성 알림
    const unsubProposalCreated = onProposalCreated((data) => {
      toast.success(
        t("proposalCreated.title"),
        t("proposalCreated.message", { title: data.proposal.title }),
        {
          category: "proposal",
          duration: 5000,
        }
      );
    });

    // 투표 알림
    const unsubProposalVoted = onProposalVoted((data) => {
      toast.info(
        t("proposalVoted.title"),
        t("proposalVoted.message", {
          voter: `${data.voter.slice(0, 6)}...${data.voter.slice(-4)}`,
          vote: data.vote
        }),
        {
          category: "vote",
          duration: 4000,
        }
      );
    });

    return () => {
      unsubSignals();
      unsubIssues();
      unsubProposalCreated();
      unsubProposalVoted();
    };
  }, [onSignalsCollected, onIssuesDetected, onProposalCreated, onProposalVoted, toast, t]);

  // 토론 이벤트 리스너 추가
  useEffect(() => {
    if (!socket) return;

    const handleDebateRoundCompleted = (data: { sessionId: string; round: number; totalRounds: number }) => {
      toast.info(
        t("debateRoundCompleted.title"),
        t("debateRoundCompleted.message", { round: data.round, total: data.totalRounds }),
        {
          category: "debate",
          duration: 4000,
        }
      );
    };

    const handleDebateCompleted = (data: { sessionId: string; consensusScore: number }) => {
      const score = Math.round(data.consensusScore * 100);
      toast.success(
        t("debateCompleted.title"),
        t("debateCompleted.message", { score }),
        {
          category: "debate",
          duration: 5000,
        }
      );
    };

    socket.on("debate:round_completed", handleDebateRoundCompleted);
    socket.on("debate:completed", handleDebateCompleted);

    return () => {
      socket.off("debate:round_completed", handleDebateRoundCompleted);
      socket.off("debate:completed", handleDebateCompleted);
    };
  }, [socket, toast, t]);

  return { isConnected };
}
