# Agentic Consensus

Agentic Consensus는 여러 AI 에이전트가 이슈에 대해 협의하고 Decision Packet을 생성하는 레이어입니다.

## 개요

이 레이어는 Inference Mining에서 식별된 이슈에 대해 다양한 관점의 AI 에이전트들이 협의하고, 모더레이터가 이를 종합하여 Decision Packet을 생성합니다.

## 주요 기능

- **멀티 에이전트 시스템**: 5개 전문 에이전트
  - Risk & Security Agent: 리스크/악성/거버넌스 공격 관점
  - Treasury Agent: 예산/재무 영향
  - Community Agent: 커뮤니티 반응/공정성
  - Product Agent: 구현 가능성/개발 난이도
  - Moderator Agent: 토론 규칙 집행 + 최종 Decision Packet 작성
- **협의 엔진**: 멀티 라운드 협의 시스템
- **토론 프로토콜**: Evidence/Proposal/Critique/Synthesis Round
- **Decision Packet 생성**: 추천, 대안, 위험, KPI, 반대 의견을 포함한 종합 패킷

## 구조

- `agents/`: 개별 전문 에이전트
  - `risk-security-agent.ts`: 위험 및 보안 관점
  - `treasury-agent.ts`: 재무 및 자원 할당 관점
  - `community-agent.ts`: 커뮤니티 영향 관점
  - `product-feasibility-agent.ts`: 제품 실현 가능성 관점
- `deliberation/`: 멀티 에이전트 협의 엔진
- `moderator/`: 의견 종합 및 Decision Packet 생성
- `decision-packet/`: Decision Packet 구조 및 검증

## 사용 예제

```typescript
import { agenticConsensus } from '@bridge-2026/agentic-consensus';
import type { Issue } from '@bridge-2026/shared';

// 이슈 처리
const issue: Issue = { /* ... */ };
const decisionPacket = await agenticConsensus.processIssue(issue, {
  availableBudget: 1000000,
  sentiment: 'neutral',
});

console.log(decisionPacket.recommendation);
console.log(decisionPacket.overallConfidence);
```

## 개발 상태

현재 기본 구조가 구현되었습니다:
- ✅ 5개 전문 에이전트 구현 (Risk, Treasury, Community, Product, Moderator)
- ✅ 협의 엔진 (멀티 라운드 협의)
- ✅ 모더레이터 및 Decision Packet 생성
- 🚧 토론 프로토콜 (Evidence/Proposal/Critique/Synthesis Round) - 구현 예정
- 🚧 LLM 통합 (Gemini API, 향후 개선 예정)
