# BRIDGE 2026 MVP 스펙

## 프로젝트 아이덴티티

**BRIDGE 2026 — Physical AI Expansion**

부제: **"Where agents propose, people decide, reality updates."**

BRIDGE는 연도별로 기능이 확장되는 헤리티지 브랜드로, 2026은 "Physical AI Expansion"을 메인 테마로 합니다.

---

## 핵심 비전

**"Mossland는 '이끼(모스)'처럼 현실의 틈을 데이터로 덮고(Reality Oracle), 그 데이터 위에서 에이전트들이 문제를 정의하며(Inference Mining), 커뮤니티가 합의해(Agentic Consensus), 현실/프로덕트에 반영하고(Atomic Actuation), 결과를 증명(Proof of Outcome)하는 '자가진화형 생태계'가 된다."**

---

## MVP 목표

**"Reality Signal이 자동으로 의제가 되고, 에이전트 합의안이 Agora 투표로 이어지며, 실행/결과증명이 다시 시스템 학습(평판/보상)으로 돌아오는 루프를 '실서비스'로 만든다."**

---

## MVP 범위

### 포함 (2026 MVP에서 반드시)

#### 1. Reality Oracle v0

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

**선택적 신호 소스 (MVP 이후 확장):**

4. **Field Report Oracle (현장 리포트)**
   - 유저가 사진/영상/설문으로 "현실 상태" 제출
   - AI가 중복/스팸/품질 평가 후 의제 승격

5. **City Pulse Oracle (도시 오픈데이터)**
   - 날씨/미세먼지/유동인구/교통 등 공개 API

6. **오픈소스 개발 신호 (GitHub)**
   - PR/이슈/릴리즈/빌드 실패율을 신호화

#### 2. Inference Mining v0

- 규칙 기반 트리거 (Anomaly rules)
- LLM 기반 이슈 요약
- 이슈 → "제안 초안 자동 생성"

#### 3. Agentic Consensus v0

**5개 에이전트 구성:**

1. **Risk & Security Agent**: 리스크/악성/거버넌스 공격 관점
2. **Treasury Agent**: 예산/재무 영향
3. **Community Agent**: 커뮤니티 반응/공정성
4. **Product Agent**: 구현 가능성/개발 난이도
5. **Moderator Agent**: 토론 규칙 집행 + 최종 Decision Packet 작성

**토론 프로토콜:**

1. **Evidence Round**: 각 에이전트가 "근거 신호 3개" 반드시 인용
2. **Proposal Round**: 각 에이전트가 실행안 1개 제시(비용/KPI 포함)
3. **Critique Round**: 서로의 안을 공격(리스크/부작용/대체안)
4. **Synthesis Round (Moderator)**: 최종 DecisionPacket + 반대의견 기록

#### 4. Agora 연동 (Proposal Draft → Human Vote)

- Agora에 "AI Assisted Proposal" 타입 추가(또는 태그/템플릿)
- 사용자에게 요약/리스크/대안 표시

#### 5. Delegation (위임) v0

**정책 기반 위임만 지원 (무제한 자동투표 금지):**

- 카테고리 제한
- 예산 상한
- 긴급안건 제외
- 거부권/대기시간

#### 6. Atomic Actuation v0

**온체인 실행:**
- 파라미터 변경/트레저리 집행(멀티시그/타임락)

**오프체인 실행:**
- GitHub 이슈 생성
- 캠페인 배포
- 공지 자동 작성

#### 7. Proof of Outcome v0

- KPI 3종만 측정 (참여율, 토론량, 실행 완료 여부 등)
- 결과 리포트 자동 생성
- 에이전트 평판 업데이트

### 제외 (2026 MVP에서 의도적으로 안 함)

- ❌ "에이전트가 트레저리를 직접 집행" (절대 금지: 단계적 확장)
- ❌ "완전 자동화 DAO (Full Auto)" (2027+)
- ❌ "빌딩 BMS/로봇 제어" (2027~ 이후 어댑터로 확장)

---

## 기술 스택 (2026 MVP)

### 전제: ERC-20 전환 이후의 UX/생태계

- **이더리움 메인넷 + L2 (선택)**
- **Account Abstraction (가스리스/소셜 로그인) 옵션**

### 권장 구성

- **Frontend**: Next.js (모듈형) + 기존 Agora UI에 마이크로프런트로 붙이기
- **Backend**: NestJS 또는 FastAPI (에이전트 오케스트레이션은 Python이 유리)
- **Stream**: Kafka 또는 Redis Streams
- **DB**: Postgres + (시계열이면) ClickHouse
- **On-chain**: 간단 앵커 컨트랙트 + (추후) Delegation Vault
- **Agent Orchestration**: LangGraph류 "그래프형 워크플로"
- **LLM**: Gemini API (Agora에서 이미 계획/추진)

---

## 데이터 모델 (핵심 오브젝트)

### RealitySignal

```typescript
{
  signal_id: string;
  source_type: 'onchain' | 'checkin' | 'public_api' | 'telemetry' | 'github';
  timestamp: number;
  payload: JSON;
  attestation: {
    signature: string;
    device/user: string;
    confidence: number;
  };
  tags: string[]; // governance, growth, security...
}
```

### Issue

```typescript
{
  issue_id: string;
  title: string;
  severity: 'S1' | 'S2' | 'S3' | 'S4';
  evidence_signals: string[];
  hypothesis: string;
  suggested_actions: string[];
  auto_generated_proposal_draft: Partial<Proposal>;
}
```

### DecisionPacket

```typescript
{
  issue_id: string;
  recommendation: string;
  alternatives: Alternative[];
  budget_impact: number;
  risk_assessment: Risk[];
  kpi_targets: KPI[];
  rollback_plan: string;
  consensus_confidence: number;
  dissenting_opinions: Opinion[];
}
```

### DelegationPolicy

```typescript
{
  wallet: string;
  agent_id: string;
  scope: {
    categories?: string[];
    tags?: string[];
  };
  max_budget_per_month?: number;
  no_vote_on_emergency: boolean;
  cooldown_window_hours: number;
  veto_enabled: boolean;
}
```

### ProofOfOutcome

```typescript
{
  proposal_id: string;
  kpi_before: Record<string, number>;
  kpi_after: Record<string, number>;
  execution_status: 'success' | 'partial' | 'failure';
  proof_anchor: string; // tx hash / CID
}
```

---

## 성공 기준 (KR 예시)

### 2026 H1 MVP 런칭

- ✅ AI Assisted Proposal 10개 생성 / 3개 이상 실제 투표 진행
- ✅ 체크인 오라클 참여 지갑 1,000+
- ✅ "제안 작성 시간"/"읽기 시간" 30% 감소 (체감 지표)

---

## 단계별 로드맵

### 2026 H1: MVP 런칭

- Reality Oracle v0 (온체인+체크인)
- Inference Mining v0
- Agentic Consensus v0
- Agora 연동 (초안 생성/투표)
- Proof of Outcome v0

### 2026 H2: 안전한 자동화

- Policy-based Delegation 고도화
- 저위험 카테고리에서 "에이전트 대리투표" 파일럿
- Atomic Actuation: 오프체인 자동 실행 확대

### 2027+: Digital Twin 확장

- Reality Oracle에 "빌딩/시설 센서" 커넥터 추가
- Atomic Actuation에 "BMS/에너지 최적화 API" 어댑터 추가

### 2028+: Humanoid/로봇 확장

- Reality Oracle: 로봇 센서/상태
- Atomic Actuation: 로봇 태스크 할당/안전정책 적용
- Proof of Outcome: 작업 성공률/안전 KPI로 자동 검증

---

## 참여 인센티브 (MVP)

1. **Signal Mining Reward**: 유효 신호 제출/운영(체크인/노드)에 소액 보상
2. **Deliberation Reward**: 토론에 "유효한 반론/근거" 남기면 보상 (평판 기반 스팸 방지)

---

## 온체인 최소 컨트랙트

**BridgeLog (가칭):**

- `dailySignalsRoot` (머클루트)
- `decisionPacketCID` (IPFS/Arweave CID)
- `outcomeProofCID`

→ "온체인에 모든 원본 데이터를 올리기"가 아니라, **감사 가능성(auditability)**만 확보









