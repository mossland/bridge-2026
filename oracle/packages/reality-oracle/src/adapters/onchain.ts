import { createPublicClient, http, type PublicClient, type Chain } from "viem";
import { mainnet } from "viem/chains";
import { RawSignal, NormalizedSignal, SignalSource } from "@oracle/core";
import { BaseAdapter } from "./base.js";

export interface OnChainAdapterConfig {
  rpcUrl: string;
  chain?: Chain;
  contractAddresses?: string[];
  fromBlock?: bigint;
}

export class OnChainAdapter extends BaseAdapter {
  readonly name = "OnChainAdapter";
  readonly source: SignalSource = "onchain";

  private client: PublicClient;
  private config: OnChainAdapterConfig;
  private lastProcessedBlock: bigint = 0n;

  constructor(config: OnChainAdapterConfig) {
    super();
    this.config = config;
    this.client = createPublicClient({
      chain: config.chain || mainnet,
      transport: http(config.rpcUrl),
    });
    if (config.fromBlock) {
      this.lastProcessedBlock = config.fromBlock;
    }
  }

  async fetch(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    const latestBlock = await this.client.getBlockNumber();

    // Fetch governance-related events
    const fromBlock = this.lastProcessedBlock || latestBlock - 1000n;

    // Fetch recent transactions to governance contracts
    if (this.config.contractAddresses) {
      for (const address of this.config.contractAddresses) {
        const logs = await this.client.getLogs({
          address: address as `0x${string}`,
          fromBlock,
          toBlock: latestBlock,
        });

        for (const log of logs) {
          const signal = this.createRawSignal(
            `${log.transactionHash}-${log.logIndex}`,
            {
              address: log.address,
              topics: log.topics,
              data: log.data,
              blockNumber: Number(log.blockNumber),
            },
            {
              chainId: this.config.chain?.id || 1,
              blockNumber: Number(log.blockNumber),
              txHash: log.transactionHash,
            }
          );
          signals.push(signal);
        }
      }
    }

    this.lastProcessedBlock = latestBlock;
    return signals;
  }

  normalize(signal: RawSignal): NormalizedSignal {
    const data = signal.data as {
      blockNumber?: number;
      topics?: string[];
    };

    // Determine category based on event topics
    let category = "blockchain_event";
    let severity: NormalizedSignal["severity"] = "low";

    // Simple heuristic - real implementation would decode events
    if (data.topics && data.topics.length > 0) {
      const topic = data.topics[0];
      // Check for common governance event signatures
      if (topic.includes("Proposal")) {
        category = "governance_proposal";
        severity = "high";
      } else if (topic.includes("Vote")) {
        category = "governance_vote";
        severity = "medium";
      } else if (topic.includes("Transfer")) {
        category = "token_transfer";
        severity = "low";
      }
    }

    return this.createNormalizedSignal(
      signal,
      category,
      severity,
      data.blockNumber || 0,
      "block",
      `Blockchain event at block ${data.blockNumber}`
    );
  }
}
