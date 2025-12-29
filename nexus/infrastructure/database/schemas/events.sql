-- Events Table
-- 이벤트 버스의 이벤트를 저장합니다 (감사 및 재생용).

CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_source ON events(source);
CREATE INDEX IF NOT EXISTS idx_events_data_gin ON events USING GIN(data);

-- 이벤트 타입별 파티셔닝을 위한 함수 (선택사항)
-- CREATE INDEX IF NOT EXISTS idx_events_type_timestamp ON events(type, timestamp);




