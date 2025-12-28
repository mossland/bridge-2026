# BRIDGE 2026 Backend API Server

모스코인 홀더를 위한 DAO 백엔드 API 서버입니다.

## 개요

NestJS 기반의 RESTful API 서버로, 프론트엔드와 거버넌스 레이어를 연결합니다.

## 기술 스택

- **NestJS**: Node.js 프레임워크
- **TypeScript**: 타입 안전성
- **TypeORM**: 데이터베이스 ORM (예정)
- **Ethers.js**: 블록체인 상호작용

## 주요 API 엔드포인트

### Health Check
- `GET /health` - 서버 상태 확인

### Signals
- `GET /api/signals` - 신호 목록 조회
- `POST /api/signals/collect` - 신호 수집 트리거

### Proposals
- `GET /api/proposals` - 제안 목록 조회
- `GET /api/proposals/:id` - 제안 상세 조회
- `POST /api/proposals/:id/vote` - 투표
- `POST /api/proposals/:id/tally` - 투표 집계

### Delegation
- `GET /api/delegation/policies` - 위임 정책 목록
- `POST /api/delegation/policies` - 위임 정책 생성
- `DELETE /api/delegation/policies/:id` - 위임 정책 삭제

### Outcomes
- `GET /api/outcomes` - 결과 목록 조회
- `GET /api/outcomes/:id` - 결과 상세 조회

## 시작하기

### 환경 변수 설정

`.env` 파일을 생성하고 다음을 설정하세요:

```env
PORT=3001
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
MOSS_COIN_ADDRESS=0x8bbfe65e31b348cd823c62e02ad8c19a84d
FRONTEND_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/bridge2026
```

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run start:dev

# 프로덕션 빌드
npm run build
npm run start:prod
```

## 개발 상태

현재 기본 구조가 구현되었습니다:
- ✅ NestJS 프로젝트 설정
- ✅ 주요 API 엔드포인트 구현
- ✅ Moss Coin 잔액 조회 (투표 가중치 계산)
- 🚧 실제 데이터베이스 연동 (예정)
- 🚧 실제 블록체인 트랜잭션 (예정)

