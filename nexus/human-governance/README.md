# Human Governance

Human Governance는 토큰 보유자가 최종 결정을 내리는 거버넌스 인터페이스입니다.

## 개요

이 레이어는 Agentic Consensus에서 생성된 Decision Packet을 바탕으로 인간이 최종 결정을 내리는 거버넌스 시스템입니다. AI는 보조 역할만 하며, 최종 권한은 항상 인간에게 있습니다.

## 주요 기능

- **거버넌스 인터페이스**: 제안 브라우징, Decision Packet 시각화, 투표
- **투표 시스템**: 온체인 투표, 토큰 가중 투표, 위임 메커니즘
- **정책 기반 위임**: 안전 경계 내에서의 자동 위임
- **투명성 레이어**: 모든 결정의 공개 기록 및 에이전트 추론 로그

## 구조

- `frontend/`: React/Next.js 기반 거버넌스 UI
- `contracts/`: Solidity 스마트 컨트랙트 (투표, 위임)
- `api/`: 백엔드 API 서버
- `delegation/`: 정책 기반 위임 시스템

## 개발 상태

현재 설계 단계입니다. 구현 계획은 `docs/implementation/implementation-plan.md`를 참조하세요.

