# Integration Examples

전체 거버넌스 루프를 통합하는 예제입니다.

## Governance Loop

`governance-loop.ts`는 전체 거버넌스 루프를 실행하는 예제입니다:

1. **Reality Oracle**: 신호 수집
2. **Inference Mining**: 이슈 추출
3. **Agentic Consensus**: 에이전트 협의
4. **Human Governance**: Proposal 생성 및 투표
5. **Atomic Actuation**: 실행
6. **Proof of Outcome**: 결과 측정

## 사용 방법

```typescript
import { runGovernanceLoop } from './governance-loop';

// 전체 루프 실행
await runGovernanceLoop();
```

## 실행 전 준비

1. 환경 변수 설정:
   - `RPC_URL`: 이더리움 RPC URL
   - `GEMINI_API_KEY`: Gemini API 키 (선택)

2. 의존성 설치 및 빌드:
   ```bash
   # 각 모듈 빌드
   cd shared && npm install && npm run build
   cd ../infrastructure/event-bus && npm install && npm run build
   # ... (나머지 모듈)
   ```

3. 실행:
   ```bash
   ts-node nexus/integration/governance-loop.ts
   ```




