# ORACLE

> **Physical AI Governance OS** - Where reality signals become proposals, agents deliberate, humans decide, and outcomes are proven on-chain.

ORACLE is the implementation of [BRIDGE 2026](../README.md), Mossland's next-generation governance framework.

## Overview

Traditional DAOs: **Humans propose → Humans discuss → Humans vote**

ORACLE: **Reality signals → AI deliberation → Human decision → Outcome proof**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORACLE Governance Loop                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐              │
│  │   Reality    │───▶│  Inference   │───▶│   Agentic    │              │
│  │   Oracle     │    │   Mining     │    │  Consensus   │              │
│  │  (Layer 1)   │    │  (Layer 2)   │    │  (Layer 3)   │              │
│  └──────────────┘    └──────────────┘    └──────────────┘              │
│         │                                       │                       │
│         │            ┌──────────────┐           │                       │
│         │            │    Human     │◀──────────┘                       │
│         │            │  Governance  │                                   │
│         │            │  (Layer 4)   │                                   │
│         │            └──────────────┘                                   │
│         │                   │                                           │
│         │            ┌──────────────┐                                   │
│         └────────────│   Proof of   │◀──────────┘                       │
│                      │   Outcome    │                                   │
│                      │  (Layer 5)   │                                   │
│                      └──────────────┘                                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Architecture

| Layer | Package | Description |
|-------|---------|-------------|
| 1 | `@oracle/reality-oracle` | Signal collection from on-chain events, APIs, telemetry |
| 2 | `@oracle/inference-mining` | Issue detection (anomaly, threshold, trend analysis) |
| 3 | `@oracle/agentic-consensus` | AI agent deliberation (Risk, Treasury, Community, Product) |
| 4 | `@oracle/human-governance` | Voting system with policy-based delegation |
| 5 | `@oracle/proof-of-outcome` | Outcome tracking, KPI measurement, trust scores |
| - | `@oracle/contracts` | Solidity smart contracts (EVM) |
| - | `@oracle/api` | REST API server |

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 9.0

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Start API server (development)
pnpm --filter @oracle/api dev
```

### Smart Contracts

```bash
# Compile contracts
pnpm --filter @oracle/contracts build

# Run tests
pnpm --filter @oracle/contracts test

# Deploy to local network
pnpm --filter @oracle/contracts deploy:local
```

## Project Structure

```
oracle/
├── packages/
│   ├── core/                 # Shared types and utilities
│   ├── reality-oracle/       # Layer 1: Signal adapters
│   ├── inference-mining/     # Layer 2: Issue detectors
│   ├── agentic-consensus/    # Layer 3: AI agents + Moderator
│   ├── human-governance/     # Layer 4: Voting + Delegation
│   ├── proof-of-outcome/     # Layer 5: Outcome tracking
│   └── contracts/            # Solidity smart contracts
├── apps/
│   └── api/                  # Express REST API
├── package.json              # Root workspace config
├── pnpm-workspace.yaml       # pnpm workspace definition
└── turbo.json                # Turborepo build config
```

## API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/signals` | GET | List recent signals |
| `/api/signals/collect` | POST | Trigger signal collection |
| `/api/issues/detect` | POST | Run issue detection |
| `/api/deliberate` | POST | AI agent deliberation |
| `/api/proposals` | GET/POST | List/create proposals |
| `/api/proposals/:id/vote` | POST | Cast vote |
| `/api/proposals/:id/tally` | POST | Tally votes |
| `/api/outcomes` | POST | Record execution outcome |
| `/api/outcomes/:id/proof` | GET | Generate outcome proof |
| `/api/trust/:entityId` | GET | Get trust score |
| `/api/stats` | GET | System statistics |

## Key Concepts

### Signal Flow

1. **Adapters** collect raw signals from various sources (blockchain, APIs, telemetry)
2. **Registry** normalizes and stores signals with attestation
3. **Detectors** analyze signals for anomalies, thresholds, and trends
4. **Issues** are generated with evidence and suggested actions

### Agent Deliberation

Four specialized AI agents analyze each issue:
- **RiskAgent** - Security and risk assessment
- **TreasuryAgent** - Financial implications
- **CommunityAgent** - Stakeholder impact
- **ProductAgent** - Technical feasibility

A **Moderator** synthesizes opinions into a **Decision Packet** containing:
- Recommendation with rationale
- Alternatives with pros/cons
- Risks with mitigation strategies
- Measurable KPIs

### Governance

- Token-weighted voting with configurable quorum and threshold
- Policy-based delegation (conditional, not blanket)
- On-chain proposal and vote recording

### Outcome Proof

- Execution records with action status
- KPI measurements against targets
- Cryptographic proof generation
- Trust score updates based on outcomes

## Design Principles

- **Human Sovereignty**: AI assists, humans decide
- **Auditability**: Every step is inspectable
- **Gradual Automation**: Delegation before autonomy
- **Reality Grounding**: Governance from measurable signals
- **Reversibility**: Rollback and dissent are first-class

## Tech Stack

- **Runtime**: Node.js / TypeScript
- **Monorepo**: pnpm + Turborepo
- **Blockchain**: Ethereum/EVM (Solidity, viem)
- **AI**: Claude API (hybrid with rule-based fallback)
- **API**: Express.js
- **Validation**: Zod

## Environment Variables

```bash
# AI Integration (optional - falls back to rule-based)
ANTHROPIC_API_KEY=sk-ant-...

# Blockchain (for contract deployment)
SEPOLIA_RPC_URL=https://...
PRIVATE_KEY=0x...

# API Server
PORT=3000
```

## License

Business Source License (BUSL 1.1)

- Source available for research and non-commercial use
- Commercial governance/protocol services restricted
- See [LICENSE](../LICENSE) for full terms
