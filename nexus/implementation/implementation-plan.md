# BRIDGE 2026 구현 계획

## 프로젝트 아이덴티티

**BRIDGE 2026 — Physical AI Expansion**

부제: **"Where agents propose, people decide, reality updates."**

BRIDGE는 연도별로 기능이 확장되는 헤리티지 브랜드로, 2026은 "Physical AI Expansion"을 메인 테마로 합니다.

## 프로젝트 개요

BRIDGE 2026은 **Reality → Agents → Humans → Proof**의 거버넌스 루프를 구현하는 Physical AI 거버넌스 OS입니다.

**핵심 비전**: "Mossland는 '이끼(모스)'처럼 현실의 틈을 데이터로 덮고(Reality Oracle), 그 데이터 위에서 에이전트들이 문제를 정의하며(Inference Mining), 커뮤니티가 합의해(Agentic Consensus), 현실/프로덕트에 반영하고(Atomic Actuation), 결과를 증명(Proof of Outcome)하는 '자가진화형 생태계'가 된다."

핵심 원칙:
- **Human Sovereignty**: AI는 보조, 인간이 최종 결정
- **Auditability First**: 모든 단계가 검사 가능해야 함
- **Gradual Automation**: 자동화 전에 위임(delegation) 우선
- **Reality Grounding**: 측정 가능한 신호로부터 거버넌스 시작
- **Reversibility**: 롤백과 반대 의견이 일급 개념

---

## 아키텍처 레이어별 구현 계획

### 1. Reality Oracle (현실 오라클)

**목적**: 실세계 또는 시스템 레벨 신호를 검증 가능한 거버넌스 입력으로 변환

#### 구현 범위 (MVP v0)

**필수 신호 소스:**

1. **온체인/Agora 이벤트 수집**
   - 거버넌스 활동 모니터링
   - 제안 폭주, 참여율 급락, 특정 주소 쏠림, 투표 지연 등

2. **커뮤니티 체크인 (Proof-of-Presence)**
   - 오프라인 이벤트/파트너 매장/캠페인에서 QR/NFC 체크인
   - 참여 데이터(시간·장소·횟수)가 Reality Signal

3. **신호 표준화 + 해시 앵커**
   - 온체인 1회/일 배치도 가능
   - 서명/출처 검증 + 위변조 방지

**확장 신호 소스 (MVP 이후):**

4. **Field Report Oracle (현장 리포트)**
   - 유저가 사진/영상/설문으로 "현실 상태" 제출

5. **City Pulse Oracle (도시 오픈데이터)**
   - 날씨/미세먼지/유동인구/교통 등 공개 API

6. **오픈소스 개발 신호 (GitHub)**
   - PR/이슈/릴리즈/빌드 실패율을 신호화

- **신호 정규화 엔진 (Signal Normalization Engine)**
  - 다양한 소스의 신호를 표준 형식으로 변환
  - 타임스탬프, 출처, 신뢰도 점수 첨부
  - 메타데이터 추출 및 태깅

- **증명 및 감사 레이어 (Attestation & Audit Layer)**
  - 신호의 무결성 검증
  - 암호화 서명 및 해시 체인
  - 감사 로그 생성 및 저장

#### 기술 스택 제안
- **데이터 수집**: Python (asyncio, aiohttp)
- **블록체인 연동**: ethers.js (이더리움 메인넷 + L2, ERC-20 환경)
- **데이터베이스**: PostgreSQL (신호 저장), Redis (실시간 캐싱), ClickHouse (시계열)
- **증명**: 암호화 라이브러리 (cryptography, secp256k1)
- **Account Abstraction**: 가스리스/소셜 로그인 옵션

#### 구현 단계
1. **Phase 1**: 기본 신호 수집기 프레임워크
2. **Phase 2**: 온체인 거버넌스 활동 모니터링
3. **Phase 3**: 커뮤니티 참여 증명 시스템
4. **Phase 4**: 공개 데이터셋 어댑터
5. **Phase 5**: 증명 및 감사 레이어 완성

---

### 2. Inference Mining (추론 마이닝)

**목적**: 원시 신호에서 이슈를 추출하고 거버넌스 관련 제안 초안 생성

#### 구현 범위
- **이상 탐지 엔진 (Anomaly Detection Engine)**
  - 통계적 이상치 탐지
  - 패턴 변화 감지
  - 임계값 기반 알림

- **트렌드 분석 (Trend Analysis)**
  - 시계열 분석
  - 다변량 분석
  - 예측 모델링

- **이슈 그룹화 (Issue Grouping)**
  - 유사 신호 클러스터링
  - 주제 모델링 (Topic Modeling)
  - 우선순위 점수 계산

- **제안 초안 생성 (Proposal Draft Generation)**
  - 구조화된 문제 진술 생성
  - 컨텍스트 및 증거 수집
  - 템플릿 기반 제안서 생성

#### 기술 스택 제안
- **ML/AI**: Python (scikit-learn, pandas, numpy)
- **LLM 통합**: OpenAI API, Anthropic API, 또는 로컬 모델 (Llama, Mistral)
- **시계열 분석**: Prophet, ARIMA
- **클러스터링**: K-means, DBSCAN, HDBSCAN
- **자연어 처리**: spaCy, transformers

#### 구현 단계
1. **Phase 1**: 기본 이상 탐지 알고리즘
2. **Phase 2**: 트렌드 분석 모듈
3. **Phase 3**: 이슈 그룹화 및 우선순위화
4. **Phase 4**: LLM 기반 제안 초안 생성
5. **Phase 5**: 피드백 루프 및 개선

---

### 3. Agentic Consensus (에이전트 합의)

**목적**: 여러 AI 에이전트가 이슈에 대해 협의하고 Decision Packet 생성

#### 구현 범위
- **에이전트 시스템 (Agent System) - 5개 에이전트**
  - **Risk & Security Agent**: 리스크/악성/거버넌스 공격 관점
  - **Treasury Agent**: 예산/재무 영향
  - **Community Agent**: 커뮤니티 반응/공정성
  - **Product Agent**: 구현 가능성/개발 난이도
  - **Moderator Agent**: 토론 규칙 집행 + 최종 Decision Packet 작성

- **토론 프로토콜 (Deliberation Protocol)**
  1. **Evidence Round**: 각 에이전트가 "근거 신호 3개" 반드시 인용
  2. **Proposal Round**: 각 에이전트가 실행안 1개 제시(비용/KPI 포함)
  3. **Critique Round**: 서로의 안을 공격(리스크/부작용/대체안)
  4. **Synthesis Round (Moderator)**: 최종 DecisionPacket + 반대의견 기록

- **협의 엔진 (Deliberation Engine)**
  - 멀티 에이전트 대화 프레임워크
  - 의견 교환 및 반박 메커니즘
  - 합의 도달 알고리즘

- **모더레이터 (Moderator)**
  - 에이전트 의견 종합
  - Decision Packet 생성
  - 불확실성 표시
  - 반대 의견 포함

- **Decision Packet 구조**
  ```typescript
  interface DecisionPacket {
    recommendation: string;
    alternatives: Alternative[];
    risks: Risk[];
    kpis: KPI[];
    dissentingOpinions: Opinion[];
    confidence: number;
    agentReasoning: AgentReasoning[];
  }
  ```

#### 기술 스택 제안
- **에이전트 프레임워크**: LangChain, AutoGen, CrewAI
- **LLM**: GPT-4, Claude, 또는 로컬 모델
- **대화 관리**: 커스텀 프롬프트 체인, ReAct 패턴
- **데이터 구조**: JSON Schema, Pydantic 모델

#### 구현 단계
1. **Phase 1**: 단일 에이전트 기본 프레임워크
2. **Phase 2**: 4개 전문 에이전트 구현
3. **Phase 3**: 멀티 에이전트 협의 시스템
4. **Phase 4**: 모더레이터 및 Decision Packet 생성
5. **Phase 5**: 불확실성 처리 및 반대 의견 통합

---

### 4. Human Governance (인간 거버넌스)

**목적**: 토큰 보유자가 최종 결정을 내리는 거버넌스 인터페이스

#### 구현 범위
- **거버넌스 인터페이스 (Governance Interface)**
  - **Reality Feed 탭**: "오늘의 신호(Reality Signals)" 카드 스트림, 이상징후 하이라이트
  - **Issue → Decision Packet 뷰**: 이슈 설명, 에이전트 토론 로그, "제안서 초안 보기 → Agora Proposal로 전송" 버튼
  - **Delegation Console**: 위임 대상 에이전트 선택, 정책 설정, 위임 내역·투표 리포트
  - **Proof of Outcome 리포트**: 투표 통과 후 KPI 변화, 결과 증명 해시/레퍼런스

- **Agora 연동 (Proposal Draft → Human Vote)**
  - Agora에 "AI Assisted Proposal" 타입 추가(또는 태그/템플릿)
  - 사용자에게 요약/리스크/대안 표시

- **투표 시스템 (Voting System)**
  - 온체인 투표 (스마트 컨트랙트, 이더리움 메인넷 + L2)
  - 토큰 가중 투표 (ERC-20)
  - Account Abstraction 지원 (가스리스/소셜 로그인 옵션)

- **정책 기반 위임 (Policy-based Delegation) v0**
  - **안전장치**: 무제한 자동투표 금지
  - 카테고리 제한
  - 예산 상한
  - 긴급안건 제외
  - 거부권/대기시간

- **투명성 레이어 (Transparency Layer)**
  - 모든 결정의 공개 기록
  - 에이전트 추론 로그
  - 투표 결과 및 통계

#### 기술 스택 제안
- **프론트엔드**: Next.js (모듈형) + 기존 Agora UI에 마이크로프런트로 붙이기
- **UI 컴포넌트**: Tailwind CSS, shadcn/ui
- **블록체인**: Solidity (스마트 컨트랙트), Hardhat/Foundry
  - 이더리움 메인넷 + L2 (ERC-20 환경)
  - Account Abstraction 지원
- **백엔드 API**: NestJS 또는 FastAPI
- **데이터베이스**: PostgreSQL (거버넌스 기록)
- **Stream**: Kafka 또는 Redis Streams
- **Agent Orchestration**: LangGraph류 "그래프형 워크플로"
- **LLM**: Gemini API (Agora에서 이미 계획/추진)

#### 구현 단계
1. **Phase 1**: 기본 거버넌스 UI 프레임워크
2. **Phase 2**: Decision Packet 시각화
3. **Phase 3**: 온체인 투표 스마트 컨트랙트
4. **Phase 4**: 위임 메커니즘 구현
5. **Phase 5**: 정책 기반 자동 위임
6. **Phase 6**: 투명성 대시보드

---

### 5. Proof of Outcome (결과 증명)

**목적**: 실행 후 거버넌스 결정을 평가하고 결과를 기록

#### 구현 범위 (MVP v0)
- **KPI 추적 시스템 (KPI Tracking System)**
  - KPI 3종만 측정 (참여율, 토론량, 실행 완료 여부 등)
  - 실시간 메트릭 수집
  - 목표 대비 성과 측정

- **결과 평가 엔진 (Outcome Evaluation Engine)**
  - 자동 평가 알고리즘
  - 결과 리포트 자동 생성
  - 성공/실패 판정

- **신뢰도 및 평판 시스템 (Trust & Reputation System)**
  - 에이전트 성능 추적
  - 위임 신뢰도 계산
  - 평판 업데이트 (Proof of Outcome 기반)
  - 지속적으로 성과가 낮으면 평판 하락, 위임 추천에서 제외

- **온체인 증명 (On-chain Proof)**
  - BridgeLog 컨트랙트에 `outcomeProofCID` 저장
  - IPFS/Arweave CID로 원본 데이터 참조
  - 감사 가능성(auditability) 확보

#### 기술 스택 제안
- **메트릭 수집**: Prometheus, Grafana
- **평가 엔진**: Python (pandas, numpy)
- **블록체인**: IPFS (대용량 데이터), 온체인 해시 저장
- **데이터베이스**: Time-series DB (InfluxDB 또는 TimescaleDB)

#### 구현 단계
1. **Phase 1**: KPI 정의 및 추적 시스템
2. **Phase 2**: 결과 평가 엔진
3. **Phase 3**: 신뢰도 계산 알고리즘
4. **Phase 4**: 온체인 증명 메커니즘
5. **Phase 5**: 거버넌스 학습 루프 통합

---

## 전체 시스템 통합

### 데이터 흐름
```
Reality Oracle → Signal DB → Inference Mining → Issue DB
    ↓
Agentic Consensus → Decision Packet → Human Governance
    ↓
Execution → Proof of Outcome → Feedback Loop → Reality Oracle
```

### 핵심 컴포넌트
1. **이벤트 버스**: 레이어 간 비동기 통신
2. **상태 관리**: 분산 상태 동기화
3. **API 게이트웨이**: 통합 API 인터페이스
4. **인증/인가**: 보안 및 권한 관리
5. **로깅 및 모니터링**: 전체 시스템 가시성

---

## 프로젝트 구조 제안

```
bridge-2026/
├── nexus/
│   └── implementation/
│       └── implementation-plan.md (이 파일)
├── nexus/
│   ├── reality-oracle/
│   │   ├── collectors/          # 신호 수집기
│   │   ├── normalizers/         # 신호 정규화
│   │   ├── attestation/         # 증명 레이어
│   │   └── adapters/            # 외부 데이터 소스 어댑터
│   ├── inference-mining/
│   │   ├── anomaly-detection/   # 이상 탐지
│   │   ├── trend-analysis/      # 트렌드 분석
│   │   ├── issue-grouping/      # 이슈 그룹화
│   │   └── proposal-drafting/   # 제안 초안 생성
│   ├── agentic-consensus/
│   │   ├── agents/              # 개별 에이전트
│   │   ├── deliberation/        # 협의 엔진
│   │   ├── moderator/           # 모더레이터
│   │   └── decision-packet/     # Decision Packet 생성
│   ├── human-governance/
│   │   ├── frontend/            # 거버넌스 UI
│   │   ├── contracts/           # 스마트 컨트랙트
│   │   ├── api/                 # 백엔드 API
│   │   └── delegation/          # 위임 시스템
│   ├── proof-of-outcome/
│   │   ├── kpi-tracking/        # KPI 추적
│   │   ├── evaluation/          # 결과 평가
│   │   ├── reputation/          # 신뢰도 시스템
│   │   └── on-chain-proof/      # 온체인 증명
│   ├── shared/
│   │   ├── types/               # 공통 타입 정의
│   │   ├── utils/               # 유틸리티
│   │   └── config/              # 설정 관리
│   ├── infrastructure/
│   │   ├── event-bus/           # 이벤트 버스
│   │   ├── database/            # 데이터베이스 스키마
│   │   └── monitoring/          # 모니터링 설정
│   └── scripts/                 # 유틸리티 스크립트
```

---

## 구현 로드맵

### 2026 H1: MVP 런칭 ("Reality→Governance 루프" 완성)

**기초 인프라**
- [x] 프로젝트 구조 설정
- [x] 기본 데이터 모델 정의
- [x] 이벤트 버스 구현
- [x] 데이터베이스 스키마 설계

**Reality Oracle v0**
- [x] 기본 신호 수집기 프레임워크
- [ ] 온체인/Agora 이벤트 수집
- [ ] 커뮤니티 체크인 (Proof-of-Presence)
- [x] 신호 정규화 및 증명 레이어

**Inference Mining v0**
- [x] 이상 탐지 엔진 (Z-score, IQR)
- [x] 트렌드 분석 모듈
- [x] 이슈 그룹화 시스템
- [ ] LLM 기반 제안 초안 생성 (Gemini API)

**Agentic Consensus v0**
- [x] 기본 에이전트 프레임워크
- [x] 4개 전문 에이전트 구현 (Risk, Treasury, Community, Product)
- [ ] Moderator Agent 구현
- [x] 멀티 라운드 협의 시스템
- [x] Decision Packet 생성
- [ ] 토론 프로토콜 (Evidence/Proposal/Critique/Synthesis Round)

**Human Governance v0**
- [ ] Agora 연동 (AI Assisted Proposal 타입)
- [ ] Reality Feed UI
- [ ] Issue → Decision Packet 뷰
- [ ] 온체인 투표 스마트 컨트랙트 (이더리움 + L2)
- [ ] 정책 기반 위임 (Delegation) v0

**Atomic Actuation v0**
- [ ] 온체인 실행 (멀티시그/타임락)
- [ ] 오프체인 실행 (GitHub, 캠페인, 공지)
- [ ] BridgeLog 컨트랙트 (앵커링)

**Proof of Outcome v0**
- [ ] KPI 추적 시스템 (3종)
- [ ] 결과 평가 엔진
- [ ] 에이전트 평판 시스템
- [ ] 온체인 증명 (BridgeLog)

**성공 기준 (KR)**
- AI Assisted Proposal 10개 생성 / 3개 이상 실제 투표 진행
- 체크인 오라클 참여 지갑 1,000+
- "제안 작성 시간"/"읽기 시간" 30% 감소

### 2026 H2: 안전한 자동화

- [ ] Policy-based Delegation 고도화
- [ ] 저위험 카테고리에서 "에이전트 대리투표" 파일럿
- [ ] Atomic Actuation: 오프체인 자동 실행 확대
- [ ] Field Report Oracle 추가
- [ ] City Pulse Oracle 추가
- [ ] GitHub 신호 오라클 추가

### 2027+: Digital Twin 확장

- [ ] Reality Oracle에 "빌딩/시설 센서" 커넥터 추가
- [ ] Atomic Actuation에 "BMS/에너지 최적화 API" 어댑터 추가
- [ ] MossNode Mini (소형 IoT) 파일럿

### 2028+: Humanoid/로봇 확장 (Physical AI 본게임)

- [ ] Reality Oracle: 로봇 센서/상태
- [ ] Atomic Actuation: 로봇 태스크 할당/안전정책 적용
- [ ] Proof of Outcome: 작업 성공률/안전 KPI로 자동 검증

---

## 기술적 고려사항

### 보안
- 모든 신호의 암호화 및 서명
- 스마트 컨트랙트 보안 감사
- API 인증 및 권한 관리
- 민감 정보 암호화 저장

### 확장성
- 마이크로서비스 아키텍처
- 수평 확장 가능한 컴포넌트
- 비동기 처리 (이벤트 기반)
- 캐싱 전략

### 가용성
- 분산 시스템 설계
- 장애 복구 메커니즘
- 백업 및 복구 전략
- 모니터링 및 알림

### 감사 가능성
- 모든 단계의 불변 로그
- 검색 가능한 감사 추적
- 투명한 의사결정 기록
- 공개 검증 가능한 증명

---

## 다음 단계

1. **프로젝트 구조 생성**: 위에서 제안한 폴더 구조 생성
2. **기술 스택 결정**: 각 레이어의 구체적인 기술 스택 확정
3. **데이터 모델 설계**: 공통 데이터 모델 및 스키마 정의
4. **프로토타입 개발**: 각 레이어의 MVP 구현
5. **통합 테스트**: 레이어 간 통합 및 테스트

---

## 참고사항

이 구현 계획은 **개념적 설계**를 기반으로 작성되었습니다. 실제 구현 시:
- 기술적 제약사항 고려
- 보안 요구사항 우선
- 점진적 개발 및 반복적 개선
- 커뮤니티 피드백 수렴

**Human Sovereignty** 원칙을 항상 유지하며, AI는 보조 역할만 수행하고 최종 결정은 항상 인간이 내리도록 설계해야 합니다.

