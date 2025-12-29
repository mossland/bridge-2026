# BRIDGE 2026 Oracle - 개발 진행 현황

> Physical AI Governance OS for MOC Token Holders

## 프로젝트 개요

BRIDGE 2026은 Mossland의 MOC 토큰 홀더를 위한 Physical AI 거버넌스 운영체제입니다.

**핵심 플로우:** Reality Signals → Agents Deliberate → Humans Decide → Outcomes Proven

---

## 구현 완료 (Completed)

### 1. 5-Layer 아키텍처

#### Layer 0: Reality Oracle (신호 수집)
- [x] SignalRegistry - 어댑터 관리 및 신호 수집 통합
- [x] **EtherscanAdapter** - MOC 토큰 전송, 가스 가격 모니터링
- [x] **MosslandAdapter** - 공시 정보, MOC 시세 수집
- [x] **GitHubAdapter** - 커밋 활동, 이슈/PR 모니터링
- [x] **SocialAdapter** - Medium 블로그, Twitter 활동 수집
- [x] **MockAdapter** - 데모용 시뮬레이션 데이터
- [x] 다국어 신호 생성 (한국어/영어)

#### Layer 1: Inference Mining (이슈 탐지)
- [x] **AnomalyDetector** - 통계적 이상 탐지 (Z-score 기반)
- [x] **ThresholdDetector** - 규칙 기반 임계값 알림
- [x] **TrendDetector** - 시계열 추세 분석
  - [x] MetricConfig 시스템 - 카테고리별 트렌드 해석
  - [x] TrendDirection (increasing/decreasing/stable)
  - [x] IssueKind (issue vs insight) 구분
- [x] ProposalGenerator - 제안서 초안 생성

#### Layer 2: Agentic Consensus (에이전트 심의)
- [x] **4개 전문 에이전트**
  - RiskAgent - 보안, 취약점, 네트워크 분석
  - TreasuryAgent - 재무, 토큰 가격, TVL 분석
  - CommunityAgent - 커뮤니티 참여, 소셜 분석
  - ProductAgent - 개발 활동, 제품 로드맵 분석
- [x] **Moderator** - 의견 종합 및 Decision Packet 생성
- [x] AGENT_CATEGORY_MAPPING - 에이전트별 전문 분야 매핑
- [x] ConsensusScore 계산 (agreement 40% + confidence 30% + direction 30%)
- [x] ProposalType 결정 (action vs investigation)
- [x] **Multi-LLM 지원**
  - Anthropic Claude (claude-sonnet-4-20250514)
  - OpenAI GPT-4
  - 환경변수 기반 설정
- [x] **에이전트 토론 시스템**
  - Multi-round 토론 (기본 3라운드)
  - 에이전트 간 반박/지지/양보 메시지
  - 라운드별 합의 변화 추적
  - 입장 변경 기록 및 이유 문서화
  - 조기 종료 (높은 합의 도달 시)
  - 실시간 WebSocket 업데이트
- [x] **에이전트 학습 시스템**
  - 과거 결정 히스토리 DB 저장
  - 에이전트별 성과 추적 (정확도, 신뢰도)
  - 심의 시 히스토리컬 컨텍스트 제공
  - 카테고리별 성공률 분석
  - 결과 피드백 루프 (실행 후 학습)
  - 에이전트 신뢰도 점수 자동 업데이트

#### Layer 3: Human Governance (인간 거버넌스)
- [x] **VotingSystem**
  - 제안 생성/활성화
  - MOC 토큰 가중치 투표
  - 정족수 및 통과 기준 검증
  - 투표 집계 및 확정
  - 제안 실행
- [x] **DelegationManager**
  - 위임 정책 생성/조회/삭제
  - 조건부 자동 위임 (카테고리, 금액, 위험도)
  - 만료 시간 관리

#### Layer 4: Proof of Outcome (결과 증명)
- [x] **OutcomeTracker** - 실행 기록 및 KPI 추적
- [x] **TrustManager** - 신뢰도 점수 계산
  - 정확도, 일관성, 적시성 평가
  - 엔티티별 (에이전트, 제안자, 위임자) 점수
- [x] 증명 해시 생성

#### 블록체인 연동
- [x] **BlockchainService** - 온체인 상호작용 서비스
  - viem 기반 Ethereum 클라이언트
  - OracleGovernance 컨트랙트 연동
  - MOC 토큰 잔액 조회 (ERC-20)
- [x] **MOC 홀더 투표 검증**
  - 투표 시 MOC 잔액 자동 확인
  - MOC 잔액 = 투표 가중치
  - 비홀더 투표 차단
- [x] **온체인 투표 기록** (환경변수 설정 시)
  - 제안 온체인 생성
  - 투표 온체인 기록
  - 결과 온체인 확정

### 2. API 서버 (Express)

| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/health` | 헬스체크 |
| GET | `/api/signals` | 신호 목록 (DB) |
| POST | `/api/signals/collect` | 신호 수집 |
| GET | `/api/issues` | 이슈 목록 (DB) |
| POST | `/api/issues/detect` | 이슈 탐지 |
| PATCH | `/api/issues/:id` | 이슈 상태 업데이트 |
| POST | `/api/deliberate` | 에이전트 심의 |
| POST | `/api/debate` | 멀티라운드 토론 |
| GET | `/api/debate/:id` | 토론 세션 조회 |
| GET | `/api/debates` | 토론 목록 |
| GET | `/api/proposals` | 제안 목록 |
| POST | `/api/proposals` | 제안 생성 |
| POST | `/api/proposals/:id/vote` | 투표 |
| POST | `/api/proposals/:id/tally` | 집계 |
| POST | `/api/proposals/:id/finalize` | 확정 |
| POST | `/api/proposals/:id/execute` | 실행 |
| GET | `/api/delegations` | 위임 목록 |
| POST | `/api/delegations` | 위임 생성 |
| POST | `/api/outcomes` | 결과 기록 |
| GET | `/api/outcomes/:id/proof` | 증명 생성 |
| GET | `/api/trust/:entityId` | 신뢰 점수 |
| GET | `/api/stats` | 시스템 통계 |
| GET | `/api/blockchain/status` | 블록체인 연동 상태 |
| GET | `/api/blockchain/moc/:address` | MOC 잔액 조회 |
| GET | `/api/blockchain/verify-voter/:address` | 투표 자격 검증 |

### 3. Web Frontend (Next.js)

| 페이지 | 경로 | 기능 |
|--------|------|------|
| Dashboard | `/` | 거버넌스 현황, MOC 잔액, 시스템 상태 |
| Signals | `/signals` | 실시간 신호 스트림, 소스/카테고리 필터, 검색 |
| Issues | `/issues` | AI 탐지 이슈, 심의 시작, Decision Packet |
| Proposals | `/proposals` | 제안 목록, MOC 가중치 투표, 실행 |
| Delegation | `/delegation` | 에이전트 위임 설정, 정책 관리 |
| Outcomes | `/outcomes` | 실행 결과, KPI 측정, 신뢰도 점수 |

### 4. UI/UX 기능

- [x] **다국어 지원** (i18n) - 한국어/영어
- [x] **지갑 연동** - RainbowKit + wagmi
- [x] MOC 토큰 잔액 표시
- [x] 투표권 (Voting Power) 표시
- [x] **심의 프로그레스 UI** - 단계별 진행상황 표시
- [x] **Decision Packet 독립 스크롤**
- [x] **제안서 상세 정보**
  - 목적 (이슈 컨텍스트)
  - 에이전트 합의 점수
  - 에이전트별 의견 (입장, 근거, 권고)
  - 목표 및 KPI
  - 대안
  - 리스크 및 완화 방안
- [x] **WebSocket 실시간 업데이트**
  - 연결 상태 표시 (Live/Offline 인디케이터)
  - 실시간 신호 수집 알림
  - 실시간 이슈 탐지 알림
  - 제안 생성/투표 실시간 반영
  - 시스템 통계 실시간 업데이트
- [x] **토스트 알림 시스템**
  - ToastProvider Context 기반 전역 상태 관리
  - 4가지 타입 (success, error, warning, info)
  - 6가지 카테고리 (system, signal, issue, proposal, debate, vote)
  - 프로그레스 바 및 자동 dismiss
  - WebSocket 이벤트 자동 알림
  - 다국어 지원 (한국어/영어)
- [x] **모바일 반응형 최적화**
  - 햄버거 메뉴 (모바일 내비게이션)
  - 반응형 그리드 레이아웃
  - 터치 친화적 버튼 크기
  - 모바일 우선 타이포그래피

### 5. 데이터 지속성

- [x] **SQLite 데이터베이스**
  - signals 테이블 - 수집된 신호 저장
  - issues 테이블 - 탐지된 이슈 저장
  - kind, direction 컬럼 추가 (마이그레이션)
- [x] 자동 신호 수집 (60초 간격)
- [x] 자동 이슈 탐지 (300초 간격)

### 6. 테스트

- [x] E2E 테스트 (16개 테스트 케이스)
  - 신호 수집 및 조회
  - 이슈 탐지 및 상태 변경
  - 제안 생성 및 투표
  - 위임 정책 관리
  - 결과 기록 및 증명

---

## 개발 히스토리

| 커밋 | 작업 내용 |
|------|----------|
| (pending) | MOC 홀더 투표 검증 및 블록체인 연동 서비스 |
| `f00f544` | 에이전트 학습 시스템 및 피드백 루프 구현 |
| `3d0850a` | 모바일 반응형 최적화 |
| `eb726e1` | 토스트 알림 시스템 고도화 |
| `99b96c4` | 에이전트 심의 시스템 고도화 및 UI/UX 개선 |
| `1550793` | 신호 페이지 검색 및 카테고리 필터 추가 |
| `af55754` | 위임 시스템 완성 및 E2E 테스트 추가 |
| `0ab4a76` | Outcomes 시스템 및 신뢰도 점수 고도화 |
| `972f729` | 투표 UI 연동 및 제안 실행 시스템 구현 |
| `ca5c84b` | 전체 시스템 개선, i18n, 데이터 지속성, E2E 테스트 |

---

## 향후 계획 (Roadmap)

### 단기 (Short-term)

#### 블록체인 연동 강화
- [x] ~~실제 MOC 토큰 컨트랙트 연동~~ (완료)
- [x] ~~온체인 투표 구현~~ (완료)
- [x] ~~투표 결과 온체인 기록~~ (완료)
- [ ] 실행 트랜잭션 생성 (스마트 컨트랙트 배포 필요)

#### 에이전트 고도화
- [x] ~~에이전트별 학습 데이터 수집~~ (완료)
- [x] ~~과거 결정 기반 컨텍스트 제공~~ (완료)
- [x] ~~에이전트 간 토론 기능~~ (완료)
- [x] ~~반대 의견 상세 분석~~ (완료)

#### UI/UX 개선
- [x] ~~실시간 WebSocket 업데이트~~ (완료)
- [x] ~~투표 현황 실시간 반영~~ (완료)
- [x] ~~토스트 알림 시스템 고도화~~ (완료)
- [x] ~~모바일 반응형 최적화~~ (완료)

### 중기 (Mid-term)

#### 스마트 컨트랙트
- [ ] BridgeGovernance 컨트랙트 배포
- [ ] 제안 온체인 등록
- [ ] 투표 온체인 기록
- [ ] 실행 자동화 (Timelock)

#### 신호 어댑터 확장
- [ ] Discord 커뮤니티 활동
- [ ] Telegram 그룹 모니터링
- [ ] DeFi 프로토콜 TVL
- [ ] NFT 마켓플레이스 활동

#### 고급 분석
- [ ] ML 기반 이상 탐지
- [ ] 시계열 예측 모델
- [ ] 감성 분석 고도화
- [ ] 크로스체인 신호 수집

### 장기 (Long-term)

#### 탈중앙화
- [ ] IPFS 기반 Decision Packet 저장
- [ ] 다중 LLM 노드 운영
- [ ] 에이전트 탈중앙화
- [ ] 커뮤니티 운영 전환

#### 생태계 확장
- [ ] 타 DAO 연동
- [ ] 크로스체인 거버넌스
- [ ] SDK 공개
- [ ] 플러그인 시스템

---

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | Next.js 14, TailwindCSS, wagmi, RainbowKit, next-intl |
| Backend | Express, TypeScript, SQLite (better-sqlite3) |
| Blockchain | Ethereum, viem, Solidity |
| AI/LLM | Anthropic Claude, OpenAI GPT-4 |
| Testing | Jest, Supertest |

---

## 실행 방법

```bash
# 의존성 설치
cd oracle && pnpm install

# API 서버 (port 4000)
pnpm --filter @oracle/api dev

# Web 프론트엔드 (port 4001)
pnpm --filter @oracle/web dev

# E2E 테스트 (API 서버 실행 필요)
pnpm --filter @oracle/api test

# 빌드
pnpm build
```

---

## 환경 변수

```bash
# API (.env)
PORT=4000
ETHERSCAN_API_KEY=...
GITHUB_TOKEN=...
TWITTER_BEARER_TOKEN=...
ANTHROPIC_API_KEY=...        # 또는 OPENAI_API_KEY
LLM_PROVIDER=anthropic       # 또는 openai
LLM_MODEL=claude-sonnet-4-20250514
SIGNAL_LANGUAGE=ko           # en 또는 ko
SIGNAL_COLLECT_INTERVAL=60
ISSUE_DETECT_INTERVAL=300

# 블록체인 연동 (선택사항)
MAINNET_RPC_URL=...          # MOC 잔액 조회용 Ethereum Mainnet RPC
RPC_URL=...                  # 거버넌스 컨트랙트 배포 네트워크 RPC
GOVERNANCE_CONTRACT_ADDRESS=... # OracleGovernance 컨트랙트 주소
ORACLE_PRIVATE_KEY=...       # 오라클 서명 계정 (0x 포함)
CHAIN_ID=1                   # 1: mainnet, 11155111: sepolia, 31337: hardhat

# Web (.env.local)
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_WALLET_CONNECT_ID=...
```

---

## 주요 파일

| 파일 | 설명 |
|------|------|
| `apps/api/src/index.ts` | API 엔드포인트 |
| `apps/api/src/db.ts` | SQLite 데이터베이스 |
| `apps/api/src/learning.ts` | 에이전트 학습 서비스 |
| `apps/api/src/blockchain.ts` | 블록체인 연동 서비스 |
| `apps/web/src/app/*/page.tsx` | 각 페이지 UI |
| `apps/web/src/lib/api.ts` | API 클라이언트 |
| `apps/web/src/components/Toast.tsx` | 토스트 알림 컴포넌트 |
| `apps/web/src/contexts/ToastContext.tsx` | 토스트 전역 상태 관리 |
| `apps/web/src/hooks/useWebSocketToast.ts` | WebSocket-토스트 연동 훅 |
| `apps/web/messages/*.json` | i18n 번역 |
| `packages/core/src/types/` | 공유 타입 정의 |
| `packages/agentic-consensus/src/` | 에이전트 및 Moderator |
| `packages/inference-mining/src/` | 이슈 탐지 |

---

## 라이선스

BUSL 1.1
