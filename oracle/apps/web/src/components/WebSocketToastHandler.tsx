"use client";

import { useWebSocketToast } from "@/hooks/useWebSocketToast";

/**
 * WebSocket 이벤트를 토스트 알림으로 표시하는 컴포넌트
 * Providers 내부에서 사용해야 함
 */
export function WebSocketToastHandler() {
  // 이 훅이 WebSocket 이벤트를 감지하고 토스트를 표시함
  useWebSocketToast();

  // 렌더링할 UI 없음
  return null;
}
