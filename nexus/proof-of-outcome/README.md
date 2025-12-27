# Proof of Outcome

Proof of Outcome은 실행 후 거버넌스 결정을 평가하고 결과를 기록하는 레이어입니다.

## 개요

이 레이어는 Human Governance에서 내려진 결정의 실행 결과를 측정하고 평가하며, 온체인에 증명을 기록합니다. 이를 통해 거버넌스 시스템이 학습하고 개선할 수 있습니다.

## 주요 기능

- **KPI 추적**: 사전 정의된 KPI 모니터링 및 목표 대비 성과 측정 (MVP: 3종)
- **결과 평가**: 자동/수동 평가를 통한 성공/실패 판정
- **신뢰도 시스템**: 에이전트 성능 추적 및 위임 신뢰도 계산
- **온체인 증명**: BridgeLog 컨트랙트에 결과 증명 기록 (IPFS/Arweave CID)

## 구조

- `kpi-tracking/`: KPI 정의 및 추적
  - `kpi-tracker.ts`: KPI 측정 및 추적
- `evaluation/`: 결과 평가 엔진
  - `evaluator.ts`: 자동/수동 평가
- `reputation/`: 신뢰도 및 평판 시스템
  - `reputation-manager.ts`: 에이전트 평판 관리
- `proof-of-outcome.ts`: 메인 서비스

## 사용 예제

```typescript
import { proofOfOutcome, kpiTracker, reputationManager } from '@bridge-2026/proof-of-outcome';
import type { Proposal, DecisionPacket } from '@bridge-2026/shared';

// 결과 생성
const outcome = await proofOfOutcome.createOutcome(proposal, decisionPacket, Date.now());

// KPI 측정
kpiTracker.measureKPI('participation_rate', 0.75, 'governance-api', 0.7);

// 결과 평가
const evaluation = outcomeEvaluator.evaluateOutcome(outcome);

// 평판 업데이트
reputationManager.updateReputation('risk_security', true, 0.8);
```

## 개발 상태

현재 기본 구조가 구현되었습니다:
- ✅ KPI 추적 시스템
- ✅ 결과 평가 엔진
- ✅ 신뢰도 및 평판 시스템
- 🚧 온체인 증명 (BridgeLog 연동 예정)

