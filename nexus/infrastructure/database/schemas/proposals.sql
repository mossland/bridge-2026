-- Proposals Table
-- Human Governance에서 생성된 제안을 저장합니다.

CREATE TABLE IF NOT EXISTS proposals (
    id UUID PRIMARY KEY,
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

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);
CREATE INDEX IF NOT EXISTS idx_proposals_type ON proposals(type);
CREATE INDEX IF NOT EXISTS idx_proposals_decision_packet_id ON proposals(decision_packet_id);
CREATE INDEX IF NOT EXISTS idx_proposals_issue_id ON proposals(issue_id);
CREATE INDEX IF NOT EXISTS idx_proposals_voting_start_time ON proposals(voting_start_time);
CREATE INDEX IF NOT EXISTS idx_proposals_voting_end_time ON proposals(voting_end_time);
CREATE INDEX IF NOT EXISTS idx_proposals_created_at ON proposals(created_at);

-- Votes Table
-- 투표 정보를 저장합니다.

CREATE TABLE IF NOT EXISTS votes (
    id UUID PRIMARY KEY,
    proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
    voter_address TEXT NOT NULL,
    choice VARCHAR(10) NOT NULL CHECK (choice IN ('yes', 'no', 'abstain')),
    weight NUMERIC NOT NULL CHECK (weight >= 0),
    voted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    tx_hash TEXT,
    UNIQUE(proposal_id, voter_address)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_votes_proposal_id ON votes(proposal_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_address ON votes(voter_address);
CREATE INDEX IF NOT EXISTS idx_votes_voted_at ON votes(voted_at);
CREATE INDEX IF NOT EXISTS idx_votes_tx_hash ON votes(tx_hash);

-- Proposal Results Table
-- 제안 결과를 저장합니다.

CREATE TABLE IF NOT EXISTS proposal_results (
    proposal_id UUID PRIMARY KEY REFERENCES proposals(id) ON DELETE CASCADE,
    total_votes INTEGER NOT NULL DEFAULT 0,
    yes_votes INTEGER NOT NULL DEFAULT 0,
    no_votes INTEGER NOT NULL DEFAULT 0,
    abstain_votes INTEGER NOT NULL DEFAULT 0,
    total_weight NUMERIC NOT NULL DEFAULT 0,
    yes_weight NUMERIC NOT NULL DEFAULT 0,
    no_weight NUMERIC NOT NULL DEFAULT 0,
    abstain_weight NUMERIC NOT NULL DEFAULT 0,
    passed BOOLEAN NOT NULL,
    participation_rate FLOAT NOT NULL CHECK (participation_rate >= 0 AND participation_rate <= 1),
    calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);




