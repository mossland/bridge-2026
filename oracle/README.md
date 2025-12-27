# BRIDGE 2026 — Physical AI Expansion

> **"Where agents propose, people decide, reality updates."**

BRIDGE 2026은 **모스랜드(Mossland)** 의 차세대 거버넌스 프레임워크입니다. 현실 신호가 자동으로 의제화되고, AI 에이전트들이 토론/합의안을 만들며, MOC 홀더가 승인/위임으로 실행하는 **Reality Ops** 시스템입니다.

## 핵심 비전

**기존 DAO**: 사람이 제안 → 사람 토론 → 투표

**BRIDGE 2026**: 현실 신호 → AI 의제화 → 에이전트 토론 → 사람 승인/위임 → 실행 → 결과증명

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    BRIDGE 2026 Governance Loop                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   Reality         Inference        Agentic          Human               │
│   Oracle    ───▶  Mining     ───▶  Consensus  ───▶  Governance          │
│   (신호수집)       (이슈발굴)        (에이전트토론)    (MOC 홀더투표)       │
│      │                                                   │              │
│      │                                                   ▼              │
│      │                                            Atomic Actuation      │
│      │                                            (실행)                │
│      │                                                   │              │
│      └───────────────────  Proof of Outcome  ◀───────────┘              │
│                            (결과증명/평판)                               │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## 모스코인 (MOC)

| 속성 | 값 |
|------|------|
| 네트워크 | Ethereum Mainnet |
| 표준 | ERC-20 |
| 컨트랙트 | `0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab` |

MOC 홀더의 3가지 역할:
1. **Direct Voter** - 직접 투표/토론 참여
2. **Delegator** - 정책 기반으로 에이전트에게 위임
3. **Oracle Contributor** - 현실 신호 제공 (체크인/리포트)

## Quick Start

```bash
# 의존성 설치
pnpm install

# 전체 빌드
pnpm build

# 웹 개발 서버
pnpm --filter @oracle/web dev

# API 서버
pnpm --filter @oracle/api dev
```

## 2026 H1 MVP 범위

### 포함

| 레이어 | 기능 |
|--------|------|
| Reality Oracle v0 | 온체인 이벤트, Agora 활동, Proof-of-Presence 체크인 |
| Inference Mining v0 | 규칙 기반 트리거 + LLM 이슈 요약, 제안 초안 생성 |
| Agentic Consensus v0 | 5 에이전트 토론, Decision Packet 생성 |
| Human Governance | MOC 토큰 가중치 투표, AI Assisted Proposal |
| Delegation v0 | 정책 기반 위임 (카테고리/상한/거부권) |
| Proof of Outcome v0 | KPI 측정, 에이전트 평판 업데이트 |

### 제외 (2027+)

- 에이전트의 트레저리 직접 집행
- 완전 자동화 DAO
- 빌딩 BMS/로봇 제어

## 프로젝트 구조

```
oracle/
├── packages/
│   ├── core/                 # 공유 타입 및 유틸리티
│   ├── reality-oracle/       # L0: 신호 수집 어댑터
│   ├── inference-mining/     # L1: 이슈 탐지기
│   ├── agentic-consensus/    # L2: AI 에이전트 + Moderator
│   ├── human-governance/     # L3: 투표 + 위임
│   ├── proof-of-outcome/     # L4: 결과 추적
│   └── contracts/            # Solidity 컨트랙트
├── apps/
│   ├── web/                  # Next.js 웹 프론트엔드
│   └── api/                  # Express REST API
```

## 웹 UI 구성

| 페이지 | 설명 |
|--------|------|
| Reality Feed | 실시간 신호 스트림, 이상징후 하이라이트 |
| Issues | 탐지된 이슈, 에이전트 토론 로그, Decision Packet |
| Proposals | AI Assisted Proposal 목록, 투표 |
| Delegation | 위임 설정, 정책 관리, 투표 리포트 |
| Outcomes | 실행 결과, KPI 변화, 증명 |

## 5-레이어 아키텍처

### L0. Reality Oracle (Signal → Verified Data)

현실 세계 신호를 검증 가능한 데이터로 변환:
- 온체인 이벤트 (MOC 전송, 거버넌스 활동)
- Agora 텔레메트리 (참여율, 제안 패턴)
- Proof-of-Presence (QR/NFC 체크인)
- 공개 API (도시 데이터, 환경 신호)

### L1. Inference Mining (Data → Issues)

신호에서 이슈를 발굴:
- 이상 탐지 (참여율 급락, 이상 투표 패턴)
- 임계값 알림 (예산 소진, 에러율)
- 추세 분석 (장기 패턴 변화)
- 자동 제안 초안 생성

### L2. Agentic Consensus (Issues → Decision Packet)

5개 에이전트가 구조화된 토론:

| 에이전트 | 관점 |
|----------|------|
| Risk & Security | 보안/악성/거버넌스 공격 |
| Treasury | 예산/재무 영향 |
| Community | 커뮤니티 반응/공정성 |
| Product | 구현 가능성/개발 난이도 |
| Moderator | 토론 정리 + Decision Packet 작성 |

토론 프로토콜:
1. **Evidence Round**: 근거 신호 인용
2. **Proposal Round**: 실행안 제시 (비용/KPI)
3. **Critique Round**: 상호 비판
4. **Synthesis Round**: 최종 합의안

### L3. Human Governance (Decision → Vote)

- MOC 토큰 가중치 투표
- Policy-based Delegation (정책 기반 위임)
- 위임 조건: 카테고리 제한, 예산 상한, 긴급안건 제외, 거부권

### L4. Proof of Outcome (Execute → Verify)

- KPI 측정 (참여율, 토론량, 실행 완료)
- 결과 증명 생성
- 에이전트/위임자 평판 업데이트

## 기술 스택

- **Frontend**: Next.js 14, TailwindCSS, wagmi, viem
- **Backend**: Node.js, Express, TypeScript
- **Blockchain**: Ethereum, ERC-20 (MOC)
- **AI**: Claude API (하이브리드)
- **Monorepo**: pnpm + Turborepo

## 성공 기준 (2026 H1)

- AI Assisted Proposal 10개 생성 / 3개 이상 투표 진행
- 체크인 오라클 참여 지갑 1,000+
- 제안 작성/읽기 시간 30% 감소

## 스크린샷

- 아래 화면들은 2026 H1 MVP 기준 UI 프로토타입이며, 모든 수치·이벤트·KPI는 목업(Mock) 데이터입니다.
1. Dashboard — Governance at a Glance
<img width="1111" height="968" alt="1" src="https://github.com/user-attachments/assets/47a80621-bd27-4190-99af-c1ea26a98308" />

2. Reality Feed — Signal → Issue Entry Point
<img width="1111" height="968" alt="2" src="https://github.com/user-attachments/assets/1d2abbb7-cfad-4cba-acc4-9cc3fce8ad09" />

3. Issues — AI-Detected Governance Problems
<img width="1111" height="968" alt="3" src="https://github.com/user-attachments/assets/045686bc-3f73-4683-a167-b02ae899834c" />

4. Proposals — AI Assisted Governance
<img width="1111" height="968" alt="4" src="https://github.com/user-attachments/assets/f009b10e-ee33-4c17-b325-4e2f03a1f1ee" />

5. Delegation — Policy-Based Trust
<img width="1111" height="968" alt="5" src="https://github.com/user-attachments/assets/b6e182e2-f558-4d48-8a9c-fd4838623f0c" />

6. Outcomes — Proof of Outcome
<img width="1111" height="968" alt="6" src="https://github.com/user-attachments/assets/8f99d790-a64f-442b-af72-17271d7551bb" />


## 라이선스

Business Source License (BUSL 1.1)
