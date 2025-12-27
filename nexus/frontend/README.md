# BRIDGE 2026 Frontend

모스코인 홀더를 위한 DAO 웹 인터페이스입니다.

## 개요

BRIDGE 2026의 주요 사용자 인터페이스로, 모스코인(ERC-20) 홀더가 거버넌스에 참여할 수 있는 웹 애플리케이션입니다.

## 기술 스택

- **Next.js 14**: React 프레임워크
- **TypeScript**: 타입 안전성
- **Tailwind CSS**: 스타일링
- **Wagmi + RainbowKit**: Web3 연결
- **Ethers.js**: 블록체인 상호작용
- **React Query**: 데이터 페칭

## 주요 기능

### 1. Reality Feed
- 실시간 신호 모니터링
- 이상 징후 하이라이트
- 신호 소스별 필터링

### 2. Proposals
- AI Assisted Proposal 목록
- Decision Packet 시각화
- 투표 인터페이스
- 투표 결과 확인

### 3. Delegation
- 위임 정책 설정
- 에이전트 선택
- 위임 내역 및 리포트

### 4. Outcomes
- 결과 리포트
- KPI 추적
- 에이전트 평판

## Moss Coin

- **Contract Address**: `0x8bbfe65e31b348cd823c62e02ad8c19a84d`
- **Type**: ERC-20
- **Purpose**: 거버넌스 토큰

## 시작하기

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음을 설정하세요:

```env
NEXT_PUBLIC_MOSS_COIN_ADDRESS=0x8bbfe65e31b348cd823c62e02ad8c19a84d
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

## 프로젝트 구조

```
src/
├── app/              # Next.js App Router
│   ├── page.tsx      # 홈 페이지
│   ├── reality-feed/ # Reality Feed 페이지
│   ├── proposals/    # Proposals 페이지
│   ├── delegation/   # Delegation 페이지
│   └── outcomes/     # Outcomes 페이지
├── components/       # React 컴포넌트
├── hooks/            # Custom hooks
├── lib/              # 유틸리티 함수
└── config/           # 설정 파일
```

## 개발 상태

현재 기본 구조가 구현되었습니다:
- ✅ Next.js 14 프로젝트 설정
- ✅ Tailwind CSS 설정
- ✅ Wagmi + RainbowKit 연동
- ✅ 기본 페이지 구조
- 🚧 실제 데이터 연동 (예정)
- 🚧 컴포넌트 구현 (예정)

