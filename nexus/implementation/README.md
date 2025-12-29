# Implementation Documentation

이 디렉토리는 BRIDGE 2026의 구현 계획 및 스펙 문서를 포함합니다.

## 문서 목록

- **implementation-plan.md**: 전체 구현 계획 및 아키텍처 레이어별 상세 설계
- **mvp-spec.md**: 2026 MVP 스펙 (범위, 데이터 모델, 성공 기준)
- **delegation-policy.md**: 정책 기반 위임 시스템 설계
- **project-structure.md**: 프로젝트 폴더 구조 상세 설명

## 주요 내용

### MVP 범위

2026 H1 MVP는 다음을 포함합니다:
- Reality Oracle v0 (온체인 + 체크인)
- Inference Mining v0
- Agentic Consensus v0 (5개 에이전트)
- Human Governance v0 (Agora 연동, Delegation)
- Atomic Actuation v0
- Proof of Outcome v0

### 기술 스택

- **Frontend**: Next.js + Agora UI 통합
- **Backend**: NestJS/FastAPI
- **Blockchain**: 이더리움 메인넷 + L2, ERC-20
- **LLM**: Gemini API
- **Agent Orchestration**: LangGraph

### 로드맵

- **2026 H1**: MVP 런칭
- **2026 H2**: 안전한 자동화
- **2027+**: Digital Twin 확장
- **2028+**: Humanoid/로봇 확장




