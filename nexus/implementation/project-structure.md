# BRIDGE 2026 프로젝트 구조

이 문서는 BRIDGE 2026 프로젝트의 상세한 폴더 구조와 각 디렉토리의 역할을 설명합니다.

## 전체 구조

```
bridge-2026/
├── README.md
├── CLAUDE.md
├── LICENSE
├── docs/
│   ├── implementation/
│   │   ├── implementation-plan.md
│   │   └── project-structure.md
│   ├── architecture/
│   │   └── (아키텍처 다이어그램 및 문서)
│   └── api/
│       └── (API 문서)
├── nexus/
│   ├── reality-oracle/
│   │   ├── README.md
│   │   ├── package.json / requirements.txt
│   │   ├── nexus/
│   │   │   ├── collectors/
│   │   │   │   ├── onchain/
│   │   │   │   │   ├── governance-monitor.ts
│   │   │   │   │   └── transaction-tracker.ts
│   │   │   │   ├── community/
│   │   │   │   │   ├── participation-tracker.ts
│   │   │   │   │   └── engagement-metrics.ts
│   │   │   │   ├── public-data/
│   │   │   │   │   ├── city-data-adapter.ts
│   │   │   │   │   └── environment-adapter.ts
│   │   │   │   └── telemetry/
│   │   │   │       └── product-metrics.ts
│   │   │   ├── normalizers/
│   │   │   │   ├── signal-normalizer.ts
│   │   │   │   ├── format-converter.ts
│   │   │   │   └── metadata-enricher.ts
│   │   │   ├── attestation/
│   │   │   │   ├── signature-service.ts
│   │   │   │   ├── hash-chain.ts
│   │   │   │   └── audit-logger.ts
│   │   │   └── adapters/
│   │   │       ├── base-adapter.ts
│   │   │       └── (외부 소스별 어댑터)
│   │   ├── tests/
│   │   └── config/
│   │       └── config.example.yaml
│   ├── inference-mining/
│   │   ├── README.md
│   │   ├── requirements.txt
│   │   ├── nexus/
│   │   │   ├── anomaly-detection/
│   │   │   │   ├── statistical-detector.py
│   │   │   │   ├── pattern-detector.py
│   │   │   │   └── threshold-alert.py
│   │   │   ├── trend-analysis/
│   │   │   │   ├── time-series.py
│   │   │   │   ├── multivariate.py
│   │   │   │   └── forecasting.py
│   │   │   ├── issue-grouping/
│   │   │   │   ├── clustering.py
│   │   │   │   ├── topic-modeling.py
│   │   │   │   └── priority-scorer.py
│   │   │   ├── proposal-drafting/
│   │   │   │   ├── llm-client.py
│   │   │   │   ├── template-engine.py
│   │   │   │   └── draft-generator.py
│   │   │   └── models/
│   │   │       └── (ML 모델 파일)
│   │   ├── tests/
│   │   └── config/
│   ├── agentic-consensus/
│   │   ├── README.md
│   │   ├── package.json
│   │   ├── nexus/
│   │   │   ├── agents/
│   │   │   │   ├── base-agent.ts
│   │   │   │   ├── risk-security-agent.ts
│   │   │   │   ├── treasury-agent.ts
│   │   │   │   ├── community-agent.ts
│   │   │   │   └── product-feasibility-agent.ts
│   │   │   ├── deliberation/
│   │   │   │   ├── deliberation-engine.ts
│   │   │   │   ├── conversation-manager.ts
│   │   │   │   └── consensus-algorithm.ts
│   │   │   ├── moderator/
│   │   │   │   ├── moderator.ts
│   │   │   │   ├── packet-synthesizer.ts
│   │   │   │   └── uncertainty-handler.ts
│   │   │   ├── decision-packet/
│   │   │   │   ├── packet-builder.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── validator.ts
│   │   │   └── llm/
│   │   │       ├── llm-client.ts
│   │   │       └── prompt-templates.ts
│   │   ├── tests/
│   │   └── config/
│   ├── human-governance/
│   │   ├── README.md
│   │   ├── frontend/
│   │   │   ├── package.json
│   │   │   ├── nexus/
│   │   │   │   ├── components/
│   │   │   │   │   ├── proposals/
│   │   │   │   │   ├── decision-packet/
│   │   │   │   │   ├── voting/
│   │   │   │   │   └── delegation/
│   │   │   │   ├── pages/
│   │   │   │   ├── hooks/
│   │   │   │   ├── utils/
│   │   │   │   └── types/
│   │   │   └── public/
│   │   ├── contracts/
│   │   │   ├── contracts/
│   │   │   │   ├── Governance.sol
│   │   │   │   ├── Voting.sol
│   │   │   │   └── Delegation.sol
│   │   │   ├── scripts/
│   │   │   ├── test/
│   │   │   └── hardhat.config.js
│   │   ├── api/
│   │   │   ├── package.json
│   │   │   ├── nexus/
│   │   │   │   ├── routes/
│   │   │   │   ├── controllers/
│   │   │   │   ├── services/
│   │   │   │   └── middleware/
│   │   │   └── tests/
│   │   └── delegation/
│   │       ├── policy-engine.ts
│   │       └── delegation-manager.ts
│   ├── proof-of-outcome/
│   │   ├── README.md
│   │   ├── requirements.txt
│   │   ├── nexus/
│   │   │   ├── kpi-tracking/
│   │   │   │   ├── kpi-definition.ts
│   │   │   │   ├── metric-collector.ts
│   │   │   │   └── goal-tracker.ts
│   │   │   ├── evaluation/
│   │   │   │   ├── evaluator.ts
│   │   │   │   ├── success-criteria.ts
│   │   │   │   └── manual-review.ts
│   │   │   ├── reputation/
│   │   │   │   ├── agent-performance.ts
│   │   │   │   ├── trust-calculator.ts
│   │   │   │   └── historical-analysis.ts
│   │   │   └── on-chain-proof/
│   │   │       ├── proof-generator.ts
│   │   │       ├── ipfs-uploader.ts
│   │   │       └── contract-interaction.ts
│   │   ├── tests/
│   │   └── config/
│   ├── shared/
│   │   ├── types/
│   │   │   ├── signal.ts
│   │   │   ├── issue.ts
│   │   │   ├── decision-packet.ts
│   │   │   ├── proposal.ts
│   │   │   └── outcome.ts
│   │   ├── utils/
│   │   │   ├── crypto.ts
│   │   │   ├── validation.ts
│   │   │   └── formatting.ts
│   │   └── config/
│   │       └── constants.ts
│   ├── infrastructure/
│   │   ├── event-bus/
│   │   │   ├── event-types.ts
│   │   │   ├── publisher.ts
│   │   │   └── subscriber.ts
│   │   ├── database/
│   │   │   ├── migrations/
│   │   │   ├── schemas/
│   │   │   └── seeds/
│   │   └── monitoring/
│   │       ├── prometheus/
│   │       └── grafana/
│   └── scripts/
│       ├── setup.sh
│       ├── deploy.sh
│       └── test.sh
```

## 각 디렉토리 상세 설명

### `/docs/implementation/`
구현 계획 및 프로젝트 구조 문서

### `/nexus/reality-oracle/`
**역할**: 실세계 신호를 검증 가능한 거버넌스 입력으로 변환

- `collectors/`: 다양한 소스에서 신호 수집
- `normalizers/`: 신호 정규화 및 표준화
- `attestation/`: 신호 증명 및 무결성 검증
- `adapters/`: 외부 데이터 소스 연동

### `/nexus/inference-mining/`
**역할**: 신호에서 이슈 추출 및 제안 초안 생성

- `anomaly-detection/`: 이상 탐지 알고리즘
- `trend-analysis/`: 트렌드 및 패턴 분석
- `issue-grouping/`: 이슈 클러스터링 및 우선순위화
- `proposal-drafting/`: LLM 기반 제안 초안 생성

### `/nexus/agentic-consensus/`
**역할**: 멀티 에이전트 협의 및 Decision Packet 생성

- `agents/`: 전문 에이전트 구현 (Risk, Treasury, Community, Product)
- `deliberation/`: 멀티 에이전트 협의 엔진
- `moderator/`: 의견 종합 및 Decision Packet 생성
- `decision-packet/`: Decision Packet 구조 및 검증

### `/nexus/human-governance/`
**역할**: 인간 거버넌스 인터페이스 및 투표 시스템

- `frontend/`: React/Next.js 기반 거버넌스 UI
- `contracts/`: Solidity 스마트 컨트랙트 (투표, 위임)
- `api/`: 백엔드 API 서버
- `delegation/`: 정책 기반 위임 시스템

### `/nexus/proof-of-outcome/`
**역할**: 결과 측정, 평가 및 온체인 증명

- `kpi-tracking/`: KPI 정의 및 추적
- `evaluation/`: 결과 평가 엔진
- `reputation/`: 신뢰도 및 평판 시스템
- `on-chain-proof/`: 온체인 증명 생성

### `/nexus/shared/`
**역할**: 모든 레이어에서 공유하는 타입, 유틸리티, 설정

- `types/`: TypeScript 타입 정의
- `utils/`: 공통 유틸리티 함수
- `config/`: 공통 설정 및 상수

### `/nexus/infrastructure/`
**역할**: 시스템 인프라 컴포넌트

- `event-bus/`: 레이어 간 이벤트 통신
- `database/`: 데이터베이스 스키마 및 마이그레이션
- `monitoring/`: 모니터링 및 로깅 설정

## 기술 스택 요약

| 레이어 | 주요 기술 |
|--------|----------|
| Reality Oracle | TypeScript/Node.js, Web3, PostgreSQL, Redis |
| Inference Mining | Python, scikit-learn, LLM APIs |
| Agentic Consensus | TypeScript, LangChain/AutoGen, LLM APIs |
| Human Governance | React/Next.js, Solidity, Node.js/Express |
| Proof of Outcome | Python/TypeScript, Prometheus, IPFS |
| Shared | TypeScript |
| Infrastructure | Event Bus, PostgreSQL, Monitoring Stack |

## 개발 환경 설정

각 레이어는 독립적으로 개발 가능하지만, 공통 타입과 이벤트 버스를 통해 통합됩니다.

1. **공통 의존성 설치**: `shared/` 타입 정의
2. **레이어별 개발**: 각 레이어는 독립적인 프로젝트
3. **통합 테스트**: 전체 시스템 통합 테스트

## 다음 단계

1. 이 구조에 따라 폴더 생성
2. 각 레이어의 기본 파일 및 설정 생성
3. 공통 타입 정의 (`nexus/shared/types/`)
4. 이벤트 버스 구현 (`nexus/infrastructure/event-bus/`)
5. 데이터베이스 스키마 설계 (`nexus/infrastructure/database/`)

