import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "..", "data", "oracle.db");

// Ensure data directory exists
import fs from "fs";
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  -- Signals table
  CREATE TABLE IF NOT EXISTS signals (
    id TEXT PRIMARY KEY,
    original_id TEXT NOT NULL,
    source TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    value REAL NOT NULL,
    unit TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  -- Create index for faster queries
  CREATE INDEX IF NOT EXISTS idx_signals_timestamp ON signals(timestamp DESC);
  CREATE INDEX IF NOT EXISTS idx_signals_category ON signals(category);
  CREATE INDEX IF NOT EXISTS idx_signals_severity ON signals(severity);

  -- Issues table
  CREATE TABLE IF NOT EXISTS issues (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'detected',
    detected_at TEXT NOT NULL,
    resolved_at TEXT,
    signal_ids TEXT,
    evidence TEXT,
    suggested_actions TEXT,
    decision_packet TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
  CREATE INDEX IF NOT EXISTS idx_issues_priority ON issues(priority);
  CREATE INDEX IF NOT EXISTS idx_issues_detected_at ON issues(detected_at DESC);

  -- Proposals table (for future use)
  CREATE TABLE IF NOT EXISTS proposals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    proposer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    voting_starts TEXT,
    voting_ends TEXT,
    issue_id TEXT,
    decision_packet TEXT,
    tally TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (issue_id) REFERENCES issues(id)
  );
`);

console.log(`📦 Database initialized at ${DB_PATH}`);

// Signal operations
export const signalDb = {
  insert: db.prepare(`
    INSERT OR REPLACE INTO signals (id, original_id, source, timestamp, category, severity, value, unit, description, metadata)
    VALUES (@id, @originalId, @source, @timestamp, @category, @severity, @value, @unit, @description, @metadata)
  `),

  getById: db.prepare(`SELECT * FROM signals WHERE id = ?`),

  getRecent: db.prepare(`
    SELECT * FROM signals ORDER BY timestamp DESC LIMIT ?
  `),

  getByCategory: db.prepare(`
    SELECT * FROM signals WHERE category = ? ORDER BY timestamp DESC LIMIT ?
  `),

  getBySeverity: db.prepare(`
    SELECT * FROM signals WHERE severity = ? ORDER BY timestamp DESC LIMIT ?
  `),

  getByTimeRange: db.prepare(`
    SELECT * FROM signals WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC
  `),

  count: db.prepare(`SELECT COUNT(*) as count FROM signals`),

  countByCategory: db.prepare(`
    SELECT category, COUNT(*) as count FROM signals GROUP BY category
  `),

  deleteOld: db.prepare(`
    DELETE FROM signals WHERE timestamp < ?
  `),

  clear: db.prepare(`DELETE FROM signals`),
};

// Issue operations
export const issueDb = {
  insert: db.prepare(`
    INSERT INTO issues (id, title, description, category, priority, status, detected_at, signal_ids, evidence, suggested_actions)
    VALUES (@id, @title, @description, @category, @priority, @status, @detectedAt, @signalIds, @evidence, @suggestedActions)
  `),

  update: db.prepare(`
    UPDATE issues SET
      status = @status,
      resolved_at = @resolvedAt,
      decision_packet = @decisionPacket,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = @id
  `),

  getById: db.prepare(`SELECT * FROM issues WHERE id = ?`),

  getRecent: db.prepare(`
    SELECT * FROM issues ORDER BY detected_at DESC LIMIT ?
  `),

  getByStatus: db.prepare(`
    SELECT * FROM issues WHERE status = ? ORDER BY detected_at DESC LIMIT ?
  `),

  getByPriority: db.prepare(`
    SELECT * FROM issues WHERE priority = ? ORDER BY detected_at DESC LIMIT ?
  `),

  getActive: db.prepare(`
    SELECT * FROM issues WHERE status IN ('detected', 'deliberating', 'proposed')
    ORDER BY
      CASE priority
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'medium' THEN 3
        WHEN 'low' THEN 4
      END,
      detected_at DESC
    LIMIT ?
  `),

  count: db.prepare(`SELECT COUNT(*) as count FROM issues`),

  countByStatus: db.prepare(`
    SELECT status, COUNT(*) as count FROM issues GROUP BY status
  `),

  // Check if similar issue already exists (to avoid duplicates)
  findSimilar: db.prepare(`
    SELECT * FROM issues
    WHERE category = ?
      AND status IN ('detected', 'deliberating', 'proposed')
      AND detected_at > datetime('now', '-1 hour')
    LIMIT 1
  `),

  clear: db.prepare(`DELETE FROM issues`),
};

// Helper to serialize/deserialize JSON fields
export function serializeSignal(signal: any) {
  return {
    id: signal.id,
    originalId: signal.originalId,
    source: signal.source,
    timestamp: signal.timestamp instanceof Date ? signal.timestamp.toISOString() : signal.timestamp,
    category: signal.category,
    severity: signal.severity,
    value: signal.value,
    unit: signal.unit,
    description: signal.description,
    metadata: signal.metadata ? JSON.stringify(signal.metadata) : null,
  };
}

export function deserializeSignal(row: any) {
  return {
    id: row.id,
    originalId: row.original_id,
    source: row.source,
    timestamp: new Date(row.timestamp),
    category: row.category,
    severity: row.severity,
    value: row.value,
    unit: row.unit,
    description: row.description,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
  };
}

export function serializeIssue(issue: any) {
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    priority: issue.priority,
    status: issue.status,
    detectedAt: issue.detectedAt instanceof Date ? issue.detectedAt.toISOString() : issue.detectedAt,
    signalIds: JSON.stringify(issue.signals?.map((s: any) => s.id) || []),
    evidence: JSON.stringify(issue.evidence || []),
    suggestedActions: JSON.stringify(issue.suggestedActions || []),
  };
}

export function deserializeIssue(row: any) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    detectedAt: row.detected_at,
    resolvedAt: row.resolved_at,
    signalIds: row.signal_ids ? JSON.parse(row.signal_ids) : [],
    evidence: row.evidence ? JSON.parse(row.evidence) : [],
    suggestedActions: row.suggested_actions ? JSON.parse(row.suggested_actions) : [],
    decisionPacket: row.decision_packet ? JSON.parse(row.decision_packet) : null,
  };
}

export default db;
