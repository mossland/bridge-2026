# Utilities

BRIDGE 2026의 공통 유틸리티 함수들입니다.

## Error Handling

커스텀 에러 타입들:

- `BridgeError`: 기본 에러 클래스
- `RealityOracleError`: Reality Oracle 관련 에러
- `InferenceMiningError`: Inference Mining 관련 에러
- `AgenticConsensusError`: Agentic Consensus 관련 에러
- `HumanGovernanceError`: Human Governance 관련 에러
- `AtomicActuationError`: Atomic Actuation 관련 에러
- `ProofOfOutcomeError`: Proof of Outcome 관련 에러

## Logger

로깅 시스템:

```typescript
import { getLogger, LogLevel } from '@bridge-2026/shared/utils';

const logger = getLogger();

logger.debug('Debug message', { metadata: 'value' });
logger.info('Info message');
logger.warn('Warning message');
logger.error('Error message', error);
```

## Validation

데이터 검증 함수들:

- `isValidEmail`: 이메일 검증
- `isValidWalletAddress`: 지갑 주소 검증
- `isValidURL`: URL 검증
- `isInRange`: 숫자 범위 검증
- `isValidLength`: 문자열 길이 검증
- `validateRequired`: 필수 필드 검증
- `validateType`: 타입 검증
- `isValidUUID`: UUID 검증
- `isValidIPFSCID`: IPFS CID 검증

## Format

데이터 포맷팅 함수들:

- `formatCurrency`: 통화 형식
- `formatPercent`: 퍼센트 형식
- `formatDate`: 날짜 포맷팅
- `formatRelativeTime`: 상대 시간 포맷팅
- `formatWalletAddress`: 지갑 주소 축약
- `formatCompactNumber`: 큰 숫자 축약
- `formatBytes`: 바이트 포맷팅
- `formatDuration`: 시간 포맷팅




