# Database Schema

BRIDGE 2026의 데이터베이스 스키마 정의입니다.

## 데이터베이스

PostgreSQL을 사용합니다.

## 스키마 구조

### 주요 테이블

1. **signals** - Reality Oracle에서 수집된 신호
2. **issues** - Inference Mining에서 추출된 이슈
3. **decision_packets** - Agentic Consensus에서 생성된 Decision Packet
4. **proposals** - Human Governance에서 생성된 제안
5. **votes** - 투표 정보
6. **outcomes** - Proof of Outcome에서 측정된 결과
7. **reputation** - 에이전트 신뢰도 및 평판
8. **events** - 이벤트 버스의 이벤트 로그

## 마이그레이션

마이그레이션 파일은 `migrations/` 디렉토리에 있습니다.

### 초기 스키마 생성

```bash
psql -U postgres -d bridge2026 -f migrations/001_initial_schema.sql
```

## 인덱스 전략

- **B-tree 인덱스**: 일반적인 검색 및 정렬용
- **GIN 인덱스**: JSONB 필드의 효율적인 검색용
- **복합 인덱스**: 자주 함께 사용되는 필드 조합

## 확장 기능

- `uuid-ossp`: UUID 생성용
- `pg_trgm`: 텍스트 검색 및 유사도 계산용


