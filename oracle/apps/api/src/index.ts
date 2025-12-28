import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";

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

// Always register MockAdapter for demo fallback
const mockAdapter = new MockAdapter({ signalCount: 3 });
signalRegistry.registerAdapter(mockAdapter);

// Register real data adapters if API keys are available
if (ETHERSCAN_API_KEY) {
  const etherscanAdapter = new EtherscanAdapter({
    apiKey: ETHERSCAN_API_KEY,
    minTransferAmount: 50000, // 50K MOC minimum for alerts
  });
  signalRegistry.registerAdapter(etherscanAdapter);
  console.log("✅ EtherscanAdapter registered");
}

// MosslandAdapter doesn't require API key
const mosslandAdapter = new MosslandAdapter({
  apiUrl: MOSSLAND_API_URL,
  language: "ko",
});
signalRegistry.registerAdapter(mosslandAdapter);
console.log("✅ MosslandAdapter registered");

// GitHubAdapter works without token but with rate limits
const githubAdapter = new GitHubAdapter({
  token: GITHUB_TOKEN,
  organization: "mossland",
});
signalRegistry.registerAdapter(githubAdapter);
console.log("✅ GitHubAdapter registered");

// SocialAdapter for Medium (always) and Twitter (if token available)
const socialAdapter = new SocialAdapter({
  mediumRssUrl: "https://medium.com/feed/mossland-blog",
  twitterBearerToken: TWITTER_BEARER_TOKEN,
  twitterUsername: "TheMossland",
});
signalRegistry.registerAdapter(socialAdapter);
console.log("✅ SocialAdapter registered" + (TWITTER_BEARER_TOKEN ? " (with Twitter)" : " (Medium only)"));

const anomalyDetector = new AnomalyDetector();
const thresholdDetector = new ThresholdDetector({ rules: [] });
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
    const signals = signalRegistry.getRecentSignals(100);
    res.json({ signals, count: signals.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch signals" });
  }
});

app.post("/api/signals/collect", async (req, res) => {
  try {
    const signals = await signalRegistry.collectSignals();
    res.json({ collected: signals.length, signals });
  } catch (error) {
    res.status(500).json({ error: "Failed to collect signals" });
  }
});

// Issue detection endpoints
app.post("/api/issues/detect", async (req, res) => {
  try {
    const signals = signalRegistry.getRecentSignals(1000);
    const issues = [
      ...anomalyDetector.analyze(signals),
      ...thresholdDetector.analyze(signals),
      ...trendDetector.analyze(signals),
    ];
    res.json({ issues, count: issues.length });
  } catch (error) {
    res.status(500).json({ error: "Failed to detect issues" });
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
    res.status(201).json({ proposal });
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
    res.status(201).json({ vote });
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
    const signalStats = signalRegistry.stats();
    const proposals = votingSystem.listProposals();
    const proofs = outcomeTracker.listProofs();

    res.json({
      signals: signalStats,
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

// Auto signal collection interval (in seconds, 0 to disable)
const SIGNAL_COLLECT_INTERVAL = parseInt(process.env.SIGNAL_COLLECT_INTERVAL || "60", 10);

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
   - GET  /api/signals         - List signals
   - POST /api/signals/collect - Collect signals
   - POST /api/issues/detect   - Detect issues
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

  // Auto signal collection
  if (SIGNAL_COLLECT_INTERVAL > 0) {
    console.log(`\n🔄 Auto signal collection enabled: every ${SIGNAL_COLLECT_INTERVAL} seconds`);

    // Initial collection on startup
    signalRegistry.collectSignals().then((signals) => {
      console.log(`   ✅ Initial collection: ${signals.length} signals`);
    }).catch((err) => {
      console.error("   ❌ Initial collection failed:", err);
    });

    // Periodic collection
    setInterval(async () => {
      try {
        const signals = await signalRegistry.collectSignals();
        console.log(`🔄 Auto-collected ${signals.length} signals at ${new Date().toLocaleTimeString()}`);
      } catch (error) {
        console.error("❌ Auto-collection failed:", error);
      }
    }, SIGNAL_COLLECT_INTERVAL * 1000);
  } else {
    console.log("\n⏸️  Auto signal collection disabled (set SIGNAL_COLLECT_INTERVAL to enable)");
  }
});

export default app;
