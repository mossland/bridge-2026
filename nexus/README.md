# Nexus

**Nexus**는 BRIDGE 2026의 핵심 구현 코드를 담는 코드네임입니다. 

"Nexus"는 **연결점**을 의미하며, 5개의 거버넌스 레이어가 만나고 상호작용하는 중심을 나타냅니다.

## 구조

이 폴더는 BRIDGE 2026의 모든 구현 레이어를 포함합니다:

- **reality-oracle/** - 실세계 신호를 검증 가능한 거버넌스 입력으로 변환 ✅ (기본 프레임워크 완료)
- **inference-mining/** - 신호에서 이슈 추출 및 제안 초안 생성 ✅ (기본 구조 완료)
- **agentic-consensus/** - 멀티 에이전트 협의 및 Decision Packet 생성 ✅ (기본 구조 완료)
- **human-governance/** - 인간 거버넌스 인터페이스 및 투표 시스템
- **atomic-actuation/** - 거버넌스 통과 시 온체인/오프체인 실행을 원자적으로 트리거
- **proof-of-outcome/** - 결과 측정, 평가 및 온체인 증명
- **shared/** - 모든 레이어에서 공유하는 타입, 유틸리티, 설정 ✅ (타입 정의 완료)
- **infrastructure/** - 시스템 인프라 컴포넌트 (이벤트 버스, 데이터베이스, 모니터링) ✅ (이벤트 버스, DB 스키마 완료)
- **scripts/** - 유틸리티 스크립트
- **implementation/** - 구현 계획 및 프로젝트 구조 문서

## 거버넌스 루프

```
Reality Oracle → Inference Mining → Agentic Consensus → Human Governance → Atomic Actuation → Proof of Outcome
                                                                                                      ↓
                                                                                              (Feedback Loop)
```

각 레이어는 독립적으로 개발 가능하지만, `shared/`와 `infrastructure/`를 통해 통합됩니다.

## 구현 상태

### ✅ 완료된 작업

1. **공통 타입 정의** (`shared/types/`)
   - Signal, Issue, DecisionPacket, Proposal, Outcome 타입 정의
   - TypeScript로 완전히 타입 안전한 구조

2. **이벤트 버스** (`infrastructure/event-bus/`)
   - 이벤트 발행/구독 시스템
   - 레이어 간 비동기 통신 지원

3. **Reality Oracle 기본 프레임워크** (`reality-oracle/`)
   - 신호 수집기 기본 클래스
   - 신호 정규화 엔진
   - 암호화 서명 및 해시 체인
   - 메인 Reality Oracle 서비스

4. **Inference Mining 기본 구조** (`inference-mining/`)
   - 통계적 이상 탐지 (Z-score, IQR)
   - 시계열 트렌드 분석
   - 이슈 클러스터링
   - 메인 Inference Mining 서비스

5. **데이터베이스 스키마** (`infrastructure/database/`)
   - PostgreSQL 스키마 정의
   - 모든 주요 엔티티 테이블
   - 인덱스 및 제약조건
   - 마이그레이션 파일

6. **Agentic Consensus 기본 구조** (`agentic-consensus/`)
   - 4개 전문 에이전트 (Risk, Treasury, Community, Product)
   - 멀티 라운드 협의 엔진
   - 모더레이터 및 Decision Packet 생성
   - 합의 점수 계산

### 📋 다음 단계

- Moderator Agent 구현
- Human Governance 구현 (Agora 연동, Delegation)
- Atomic Actuation 구현
- Proof of Outcome 구현
- 구체적인 수집기 구현 (온체인, 체크인, 공개 API 등)
- LLM 통합 (Gemini API, 제안 초안 생성)
- BridgeLog 스마트 컨트랙트

## 시작하기

### 의존성 설치

각 모듈은 독립적인 패키지로 관리됩니다. 루트에서:

```bash
# 공통 타입 빌드
cd shared && npm install && npm run build

# 이벤트 버스 빌드
cd ../infrastructure/event-bus && npm install && npm run build

# Reality Oracle 빌드
cd ../../reality-oracle && npm install && npm run build
```

### 사용 예제

```typescript
import { realityOracle } from '@bridge-2026/reality-oracle';
import { eventSubscriber, EventType } from '@bridge-2026/event-bus';

// 이벤트 구독
eventSubscriber.subscribe(EventType.SIGNAL_COLLECTED, (event) => {
  console.log('Signal collected:', event.data);
});

// Reality Oracle 시작
await realityOracle.startCollectors();
```

## 상세 문서

각 레이어의 상세한 설명은 각 폴더의 README.md를 참조하세요.

전체 구현 계획은 `implementation/implementation-plan.md`를 참조하세요.
