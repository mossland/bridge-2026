# Human Governance

Human Governance는 토큰 보유자가 최종 결정을 내리는 거버넌스 인터페이스입니다.

## 개요

이 레이어는 Agentic Consensus에서 생성된 Decision Packet을 바탕으로 인간이 최종 결정을 내리는 거버넌스 시스템입니다. AI는 보조 역할만 하며, 최종 권한은 항상 인간에게 있습니다.

## 주요 기능

- **거버넌스 서비스**: Decision Packet → Proposal 변환, 투표 관리
- **Agora 연동**: AI Assisted Proposal을 Agora에 전송
- **투표 시스템**: 온체인 투표, 토큰 가중 투표 (이더리움 + L2, ERC-20)
- **정책 기반 위임**: 안전장치가 포함된 자동 위임 시스템
- **투명성 레이어**: 모든 결정의 공개 기록 및 에이전트 추론 로그

## 구조

- `governance-service.ts`: 메인 거버넌스 서비스
- `agora-integration.ts`: Agora 플랫폼 연동
- `delegation/`: 정책 기반 위임 시스템
  - `delegation-manager.ts`: 위임 정책 관리
  - `policy-engine.ts`: 정책 평가 엔진
- `frontend/`: React/Next.js 기반 거버넌스 UI (예정)
- `contracts/`: Solidity 스마트 컨트랙트 (예정)

## 사용 예제

```typescript
import { governanceService, agoraIntegration } from '@bridge-2026/human-governance';
import type { DecisionPacket } from '@bridge-2026/shared';

// Decision Packet을 Proposal로 변환
const proposal = await governanceService.createProposalFromDecisionPacket(decisionPacket, {
  votingDurationDays: 7,
  minParticipationRate: 0.1,
  passingThreshold: 0.5,
});

// Agora에 전송
await agoraIntegration.convertToAgoraProposal(decisionPacket);

// 투표
await governanceService.castVote(proposal.id, voterAddress, 'yes', 1000);

// 결과 계산
const result = await governanceService.calculateProposalResult(proposal.id);
```

## 개발 상태

현재 기본 구조가 구현되었습니다:
- ✅ 거버넌스 서비스 (Proposal 생성, 투표 관리)
- ✅ Agora 연동
- ✅ 정책 기반 위임 시스템
- 🚧 프론트엔드 UI (예정)
- 🚧 스마트 컨트랙트 (예정)

