import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";

// Import database
import {
  signalDb,
  issueDb,
  serializeSignal,
  deserializeSignal,
  serializeIssue,
  deserializeIssue,
} from "./db.js";

// Import ORACLE modules
import {
  SignalRegistry,
  MockAdapter,
  EtherscanAdapter,
  MosslandAdapter,
  GitHubAdapter,
  SocialAdapter,
} from "@oracle/reality-oracle";
import {
  AnomalyDetector,
  ThresholdDetector,
  TrendDetector,
  ProposalGenerator,
} from "@oracle/inference-mining";
import {
  RiskAgent,
  TreasuryAgent,
  CommunityAgent,
  ProductAgent,
  Moderator,
} from "@oracle/agentic-consensus";
import { VotingSystem, DelegationManager } from "@oracle/human-governance";
import { OutcomeTrackerImpl, TrustManager } from "@oracle/proof-of-outcome";

// Initialize services
const signalRegistry = new SignalRegistry();

// Register adapters based on available API keys
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MOSSLAND_API_URL = process.env.MOSSLAND_API_URL || "https://disclosure.moss.land";

// Language setting from environment (default: en)
const SIGNAL_LANGUAGE = (process.env.SIGNAL_LANGUAGE || "en") as "en" | "ko";
console.log(`🌐 Signal language: ${SIGNAL_LANGUAGE}`);

// Always register MockAdapter for demo fallback
const mockAdapter = new MockAdapter({ signalCount: 3, language: SIGNAL_LANGUAGE });
signalRegistry.registerAdapter(mockAdapter);

// Register real data adapters if API keys are available
if (ETHERSCAN_API_KEY) {
  const etherscanAdapter = new EtherscanAdapter({
    apiKey: ETHERSCAN_API_KEY,
    minTransferAmount: 50000, // 50K MOC minimum for alerts
    language: SIGNAL_LANGUAGE,
  });
  signalRegistry.registerAdapter(etherscanAdapter);
  console.log("✅ EtherscanAdapter registered");
}

// MosslandAdapter doesn't require API key
const mosslandAdapter = new MosslandAdapter({
  apiUrl: MOSSLAND_API_URL,
  language: SIGNAL_LANGUAGE,
});
signalRegistry.registerAdapter(mosslandAdapter);
console.log("✅ MosslandAdapter registered");

// GitHubAdapter works without token but with rate limits
const githubAdapter = new GitHubAdapter({
  token: GITHUB_TOKEN,
  organization: "mossland",
  language: SIGNAL_LANGUAGE,
});
signalRegistry.registerAdapter(githubAdapter);
console.log("✅ GitHubAdapter registered");

// SocialAdapter for Medium (always) and Twitter (if token available)
const socialAdapter = new SocialAdapter({
  mediumRssUrl: "https://medium.com/feed/mossland-blog",
  twitterBearerToken: TWITTER_BEARER_TOKEN,
  twitterUsername: "TheMossland",
  language: SIGNAL_LANGUAGE,
});
signalRegistry.registerAdapter(socialAdapter);
console.log("✅ SocialAdapter registered" + (TWITTER_BEARER_TOKEN ? " (with Twitter)" : " (Medium only)"));

const anomalyDetector = new AnomalyDetector({ minSamples: 3 });
const thresholdDetector = new ThresholdDetector({
  rules: [
    // Price alerts - more likely to trigger
    {
      category: "moc_price",
      operator: "gt",
      value: 45,
      priority: "medium",
      message: "MOC price above 45 KRW - monitor closely",
      suggestedActions: ["Monitor market conditions", "Check for unusual trading activity"],
    },
    {
      category: "moc_price",
      operator: "lt",
      value: 55,
      priority: "low",
      message: "MOC price under 55 KRW",
      suggestedActions: ["Monitor price stability", "Review market sentiment"],
    },
    // Token transfer alerts
    {
      category: "moc_transfer",
      operator: "gt",
      value: 100000,
      priority: "high",
      message: "Large MOC transfer detected (>100K)",
      suggestedActions: ["Verify transfer legitimacy", "Check for whale activity"],
    },
    // Gas price alerts
    {
      category: "network_gas",
      operator: "gt",
      value: 30,
      priority: "medium",
      message: "Elevated gas prices detected",
      suggestedActions: ["Consider transaction timing", "Monitor network congestion"],
    },
    // Mock data thresholds - more likely to trigger
    {
      category: "governance_participation",
      operator: "gt",
      value: 30,
      priority: "medium",
      message: "Governance participation increase detected",
      suggestedActions: ["Review active proposals", "Ensure voting system is handling load"],
    },
    {
      category: "token_price",
      operator: "gt",
      value: 50,
      priority: "high",
      message: "Significant token price movement",
      suggestedActions: ["Monitor market conditions", "Review trading volumes"],
    },
    {
      category: "treasury_balance",
      operator: "gt",
      value: 30,
      priority: "medium",
      message: "Treasury activity detected",
      suggestedActions: ["Review recent transactions", "Verify fund allocation"],
    },
    // Medium/Social alerts
    {
      category: "medium_activity",
      operator: "lte",
      value: 2,
      priority: "low",
      message: "Low blog activity this week",
      suggestedActions: ["Consider publishing new content", "Review content strategy"],
    },
  ],
});
const trendDetector = new TrendDetector();
const proposalGenerator = new ProposalGenerator();

// Initialize agents (without API key for now)
const riskAgent = new RiskAgent();
const treasuryAgent = new TreasuryAgent();
const communityAgent = new CommunityAgent();
const productAgent = new ProductAgent();
const moderator = new Moderator();

moderator.registerAgent(riskAgent);
moderator.registerAgent(treasuryAgent);
moderator.registerAgent(communityAgent);
moderator.registerAgent(productAgent);

const votingSystem = new VotingSystem();
const delegationManager = new DelegationManager();
const outcomeTracker = new OutcomeTrackerImpl();
const trustManager = new TrustManager();

// Create Express app
const app: Express = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
});

// Signal endpoints
app.get("/api/signals", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const category = req.query.category as string;

    let rows;
    if (category) {
      rows = signalDb.getByCategory.all(category, limit);
    } else {
      rows = signalDb.getRecent.all(limit);
    }

    const signals = rows.map(deserializeSignal);
    res.json({ signals, count: signals.length });
  } catch (error) {
    console.error("Failed to fetch signals:", error);
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

app.post("/api/signals/collect", async (req, res) => {
  try {
    const signals = await signalRegistry.collectSignals();

    // Save to database
    for (const signal of signals) {
      signalDb.insert.run(serializeSignal(signal));
    }

    res.json({ collected: signals.length, signals });
  } catch (error) {
    console.error("Failed to collect signals:", error);
    res.status(500).json({ error: "Failed to collect signals" });
  }
});

// Issue endpoints
app.get("/api/issues", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const status = req.query.status as string;

    let rows;
    if (status) {
      rows = issueDb.getByStatus.all(status, limit);
    } else {
      rows = issueDb.getActive.all(limit);
    }

    const issues = rows.map(deserializeIssue);
    res.json({ issues, count: issues.length });
  } catch (error) {
    console.error("Failed to fetch issues:", error);
    res.status(500).json({ error: "Failed to fetch issues" });
  }
});

app.post("/api/issues/detect", async (req, res) => {
  try {
    // Get signals from database
    const signalRows = signalDb.getRecent.all(1000);
    const signals = signalRows.map(deserializeSignal);

    // Detect issues
    const detectedIssues = [
      ...anomalyDetector.analyze(signals),
      ...thresholdDetector.analyze(signals),
      ...trendDetector.analyze(signals),
    ];

    // Save new issues to database (avoid duplicates)
    const savedIssues = [];
    for (const issue of detectedIssues) {
      // Check if similar issue already exists
      const existing = issueDb.findSimilar.get(issue.category);
      if (!existing) {
        issueDb.insert.run(serializeIssue(issue));
        savedIssues.push(issue);
      }
    }

    // Return all active issues
    const allIssues = issueDb.getActive.all(50).map(deserializeIssue);
    res.json({
      detected: detectedIssues.length,
      saved: savedIssues.length,
      issues: allIssues,
      count: allIssues.length,
    });
  } catch (error) {
    console.error("Failed to detect issues:", error);
    res.status(500).json({ error: "Failed to detect issues" });
  }
});

app.patch("/api/issues/:id", async (req, res) => {
  try {
    const { status, decisionPacket } = req.body;
    const issue = issueDb.getById.get(req.params.id);

    if (!issue) {
      return res.status(404).json({ error: "Issue not found" });
    }

    issueDb.update.run({
      id: req.params.id,
      status: status || issue.status,
      resolvedAt: status === "resolved" ? new Date().toISOString() : null,
      decisionPacket: decisionPacket ? JSON.stringify(decisionPacket) : issue.decision_packet,
    });

    const updated = issueDb.getById.get(req.params.id);
    res.json({ issue: deserializeIssue(updated) });
  } catch (error) {
    console.error("Failed to update issue:", error);
    res.status(500).json({ error: "Failed to update issue" });
  }
});

// Deliberation endpoints
app.post("/api/deliberate", async (req, res) => {
  try {
    const { issue, context } = req.body;
    if (!issue) {
      return res.status(400).json({ error: "Issue is required" });
    }
    const decisionPacket = await moderator.deliberate(issue, context || {});
    res.json({ decisionPacket });
  } catch (error) {
    res.status(500).json({ error: "Failed to deliberate" });
  }
});

// Proposal endpoints
app.get("/api/proposals", (req, res) => {
  try {
    const status = req.query.status as string | undefined;
    const proposals = votingSystem.listProposals(status as any);
    res.json({ proposals, count: proposals.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch proposals" });
  }
});

app.post("/api/proposals", (req, res) => {
  try {
    const { decisionPacket, proposer, options } = req.body;
    if (!decisionPacket || !proposer) {
      return res.status(400).json({ error: "decisionPacket and proposer are required" });
    }
    const proposal = votingSystem.createProposal(decisionPacket, proposer, options);
    // Auto-activate the proposal for immediate voting
    votingSystem.activateProposal(proposal.id);
    const activatedProposal = votingSystem.getProposal(proposal.id);
    res.status(201).json({ proposal: activatedProposal });
  } catch (error) {
    res.status(500).json({ error: "Failed to create proposal" });
  }
});

app.get("/api/proposals/:id", (req, res) => {
  try {
    const proposal = votingSystem.getProposal(req.params.id);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }
    res.json({ proposal });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch proposal" });
  }
});

app.post("/api/proposals/:id/vote", (req, res) => {
  try {
    const { voter, choice, weight, reason } = req.body;
    if (!voter || !choice || !weight) {
      return res.status(400).json({ error: "voter, choice, and weight are required" });
    }
    const vote = votingSystem.castVote(
      req.params.id,
      voter,
      choice,
      BigInt(weight),
      reason
    );
    // Convert BigInt to string for JSON serialization
    res.status(201).json({
      vote: {
        ...vote,
        weight: vote.weight.toString(),
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to cast vote" });
  }
});

app.post("/api/proposals/:id/tally", (req, res) => {
  try {
    const tally = votingSystem.tallyVotes(req.params.id);
    // Convert BigInt to string for JSON serialization
    const serializable = {
      ...tally,
      forVotes: tally.forVotes.toString(),
      againstVotes: tally.againstVotes.toString(),
      abstainVotes: tally.abstainVotes.toString(),
      totalVotes: tally.totalVotes.toString(),
    };
    res.json({ tally: serializable });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to tally votes" });
  }
});

// Outcome endpoints
app.post("/api/outcomes", async (req, res) => {
  try {
    const { proposalId, actions } = req.body;
    if (!proposalId || !actions) {
      return res.status(400).json({ error: "proposalId and actions are required" });
    }
    const execution = await outcomeTracker.recordExecution(proposalId, actions);
    res.status(201).json({ execution });
  } catch (error) {
    res.status(500).json({ error: "Failed to record outcome" });
  }
});

app.get("/api/outcomes/:executionId/proof", async (req, res) => {
  try {
    const proof = await outcomeTracker.generateProof(req.params.executionId);
    res.json({ proof });
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Failed to generate proof" });
  }
});

// Trust score endpoints
app.get("/api/trust/:entityId", (req, res) => {
  try {
    const score = trustManager.getScore(req.params.entityId);
    if (!score) {
      return res.status(404).json({ error: "Entity not found" });
    }
    res.json({ score });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch trust score" });
  }
});

app.get("/api/trust/leaderboard/:type", (req, res) => {
  try {
    const entityType = req.params.type as "agent" | "proposer" | "delegate";
    const limit = parseInt(req.query.limit as string) || 10;
    const topPerformers = trustManager.getTopPerformers(entityType, limit);
    res.json({ leaderboard: topPerformers });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

// System stats
app.get("/api/stats", (req, res) => {
  try {
    // Get signal stats from database
    const signalCount = signalDb.count.get() as { count: number };
    const categoryStats = signalDb.countByCategory.all() as { category: string; count: number }[];

    // Get issue stats from database
    const issueCount = issueDb.count.get() as { count: number };
    const issueStatusStats = issueDb.countByStatus.all() as { status: string; count: number }[];

    const proposals = votingSystem.listProposals();
    const proofs = outcomeTracker.listProofs();

    res.json({
      signals: {
        total: signalCount.count,
        byCategory: categoryStats,
        adapterCount: signalRegistry.listAdapters().length,
      },
      issues: {
        total: issueCount.count,
        byStatus: issueStatusStats,
      },
      proposals: {
        total: proposals.length,
        active: proposals.filter((p) => p.status === "active").length,
        passed: proposals.filter((p) => p.status === "passed").length,
        rejected: proposals.filter((p) => p.status === "rejected").length,
      },
      outcomes: {
        totalProofs: proofs.length,
        successRate:
          proofs.length > 0
            ? proofs.filter((p) => p.overallSuccess).length / proofs.length
            : 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// Background processing intervals (in seconds, 0 to disable)
const SIGNAL_COLLECT_INTERVAL = parseInt(process.env.SIGNAL_COLLECT_INTERVAL || "60", 10);
const ISSUE_DETECT_INTERVAL = parseInt(process.env.ISSUE_DETECT_INTERVAL || "300", 10); // 5 minutes

// Helper function for background signal collection
async function collectAndSaveSignals() {
  const signals = await signalRegistry.collectSignals();
  for (const signal of signals) {
    signalDb.insert.run(serializeSignal(signal));
  }
  return signals;
}

// Helper function for background issue detection
async function detectAndSaveIssues() {
  const signalRows = signalDb.getRecent.all(1000);
  const signals = signalRows.map(deserializeSignal);

  const detectedIssues = [
    ...anomalyDetector.analyze(signals),
    ...thresholdDetector.analyze(signals),
    ...trendDetector.analyze(signals),
  ];

  let savedCount = 0;
  for (const issue of detectedIssues) {
    const existing = issueDb.findSimilar.get(issue.category);
    if (!existing) {
      issueDb.insert.run(serializeIssue(issue));
      savedCount++;
    }
  }

  return { detected: detectedIssues.length, saved: savedCount };
}

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   ██████  ██████   █████   ██████ ██      ███████         ║
║  ██    ██ ██   ██ ██   ██ ██      ██      ██              ║
║  ██    ██ ██████  ███████ ██      ██      █████           ║
║  ██    ██ ██   ██ ██   ██ ██      ██      ██              ║
║   ██████  ██   ██ ██   ██  ██████ ███████ ███████         ║
║                                                           ║
║   BRIDGE 2026 - Physical AI Governance OS                 ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

🚀 API server running on http://localhost:${PORT}
📡 Endpoints:
   - GET  /health              - Health check
   - GET  /api/signals         - List signals (from DB)
   - POST /api/signals/collect - Collect signals
   - GET  /api/issues          - List issues (from DB)
   - POST /api/issues/detect   - Detect and save issues
   - PATCH /api/issues/:id     - Update issue status
   - POST /api/deliberate      - Agent deliberation
   - GET  /api/proposals       - List proposals
   - POST /api/proposals       - Create proposal
   - POST /api/proposals/:id/vote  - Cast vote
   - POST /api/proposals/:id/tally - Tally votes
   - POST /api/outcomes        - Record outcome
   - GET  /api/outcomes/:id/proof  - Generate proof
   - GET  /api/trust/:entityId - Get trust score
   - GET  /api/stats           - System statistics
  `);

  // Get current DB stats
  const signalCount = signalDb.count.get() as { count: number };
  const issueCount = issueDb.count.get() as { count: number };
  console.log(`📊 Database: ${signalCount.count} signals, ${issueCount.count} issues stored`);

  // Auto signal collection
  if (SIGNAL_COLLECT_INTERVAL > 0) {
    console.log(`\n🔄 Auto signal collection: every ${SIGNAL_COLLECT_INTERVAL}s`);

    // Initial collection on startup
    collectAndSaveSignals().then((signals) => {
      console.log(`   ✅ Initial collection: ${signals.length} signals saved to DB`);
    }).catch((err) => {
      console.error("   ❌ Initial collection failed:", err);
    });

    // Periodic collection
    setInterval(async () => {
      try {
        const signals = await collectAndSaveSignals();
        console.log(`🔄 Collected ${signals.length} signals at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error("❌ Auto-collection failed:", error);
      }
    }, SIGNAL_COLLECT_INTERVAL * 1000);
  }

  // Auto issue detection
  if (ISSUE_DETECT_INTERVAL > 0) {
    console.log(`🔍 Auto issue detection: every ${ISSUE_DETECT_INTERVAL}s`);

    // Initial detection after a short delay
    setTimeout(async () => {
      try {
        const result = await detectAndSaveIssues();
        console.log(`   ✅ Initial detection: ${result.detected} found, ${result.saved} new issues saved`);
      } catch (error) {
        console.error("   ❌ Initial issue detection failed:", error);
      }
    }, 5000);

    // Periodic detection
    setInterval(async () => {
      try {
        const result = await detectAndSaveIssues();
        if (result.saved > 0) {
          console.log(`🔍 Detected ${result.detected} issues, saved ${result.saved} new at ${new Date().toLocaleTimeString()}`);
        }
      } catch (error) {
        console.error("❌ Auto-detection failed:", error);
      }
    }, ISSUE_DETECT_INTERVAL * 1000);
  }
});

export default app;
