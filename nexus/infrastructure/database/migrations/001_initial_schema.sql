-- Migration: 001_initial_schema
-- Description: 초기 데이터베이스 스키마 생성
-- Created: 2026-01-01

BEGIN;

-- Signals
CREATE TABLE IF NOT EXISTS signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metadata JSONB NOT NULL,
    data JSONB NOT NULL,
    attestation JSONB NOT NULL,
    audit_log_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_created_at ON signals(created_at);
CREATE INDEX IF NOT EXISTS idx_signals_metadata_source ON signals((metadata->>'source'));
CREATE INDEX IF NOT EXISTS idx_signals_metadata_type ON signals((metadata->>'type'));
CREATE INDEX IF NOT EXISTS idx_signals_data_gin ON signals USING GIN(data);

-- Issues
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    status VARCHAR(50) NOT NULL,
    evidence JSONB NOT NULL,
    categories TEXT[] DEFAULT '{}',
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    related_issue_ids UUID[] DEFAULT '{}',
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
CREATE INDEX IF NOT EXISTS idx_issues_detected_at ON issues(detected_at);

-- Decision Packets
CREATE TABLE IF NOT EXISTS decision_packets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    recommendation TEXT NOT NULL,
    recommendation_details TEXT NOT NULL,
    alternatives JSONB NOT NULL,
    risks JSONB NOT NULL,
    kpis JSONB NOT NULL,
    dissenting_opinions JSONB NOT NULL,
    agent_reasoning JSONB NOT NULL,
    overall_confidence FLOAT NOT NULL CHECK (overall_confidence >= 0 AND overall_confidence <= 1),
    uncertainty_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    moderator JSONB NOT NULL,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_decision_packets_issue_id ON decision_packets(issue_id);
CREATE INDEX IF NOT EXISTS idx_decision_packets_created_at ON decision_packets(created_at);

-- Proposals
CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('governance', 'treasury', 'technical', 'policy')),
    status VARCHAR(50) NOT NULL CHECK (status IN ('draft', 'pending', 'active', 'passed', 'rejected', 'executed', 'cancelled')),
    decision_packet_id UUID NOT NULL REFERENCES decision_packets(id) ON DELETE CASCADE,
    issue_id UUID NOT NULL REFERENCES issues(id) ON DELETE CASCADE,
    actions JSONB NOT NULL,
    voting_start_time TIMESTAMP WITH TIME ZONE,
    voting_end_time TIMESTAMP WITH TIME ZONE,
    min_participation_rate FLOAT CHECK (min_participation_rate >= 0 AND min_participation_rate <= 1),
    passing_threshold FLOAT CHECK (passing_threshold >= 0 AND passing_threshold <= 1),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_decision_packet_id ON proposals(decision_packet_id);

-- Votes
CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    voter_address TEXT NOT NULL,
    choice VARCHAR(10) NOT NULL CHECK (choice IN ('yes', 'no', 'abstain')),
    weight NUMERIC NOT NULL CHECK (weight >= 0),
    voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    tx_hash TEXT,
    UNIQUE(proposal_id, voter_address)
);

CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_address ON votes(voter_address);

-- Outcomes
CREATE TABLE IF NOT EXISTS outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    decision_packet_id UUID NOT NULL REFERENCES decision_packets(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'success', 'partial_success', 'failure', 'cancelled')),
    kpi_measurements JSONB NOT NULL,
    evaluation JSONB,
    execution_start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    execution_end_time TIMESTAMP WITH TIME ZONE,
    on_chain_proof_hash TEXT,
    ipfs_ref TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_outcomes_proposal_id ON outcomes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_outcomes_status ON outcomes(status);

-- Events
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    source TEXT NOT NULL,
    data JSONB NOT NULL,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp);

COMMIT;









