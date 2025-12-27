-- BRIDGE 2026 Database Schema
-- 모든 스키마를 초기화합니다.

-- 확장 기능 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 텍스트 검색용

-- 스키마 파일들 실행
\i signals.sql
\i issues.sql
\i decision-packets.sql
\i proposals.sql
\i outcomes.sql
\i events.sql

-- 초기 데이터 (필요한 경우)
-- 예: 기본 설정, 시스템 사용자 등

