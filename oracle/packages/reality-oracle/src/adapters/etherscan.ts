import { RawSignal, NormalizedSignal, SignalSource } from "@oracle/core";
import { BaseAdapter } from "./base.js";

export interface EtherscanAdapterConfig {
  apiKey: string;
  mocTokenAddress?: string;
  foundationAddress?: string;
  minTransferAmount?: number; // Minimum MOC for whale alert
}

const DEFAULT_MOC_TOKEN = "0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab";
const DEFAULT_FOUNDATION = "0xcda8f4d40dbeaecf7ee7221f9e9b35d565ca2ad2";
const ETHERSCAN_API = "https://api.etherscan.io/api";

interface TokenTransfer {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
}

interface GasPrice {
  SafeGasPrice: string;
  ProposeGasPrice: string;
  FastGasPrice: string;
}

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  blockNumber: string;
  timeStamp: string;
  methodId?: string;
  functionName?: string;
}

export class EtherscanAdapter extends BaseAdapter {
  readonly name = "EtherscanAdapter";
  readonly source: SignalSource = "onchain";

  private config: EtherscanAdapterConfig;
  private lastBlockChecked: number = 0;

  constructor(config: EtherscanAdapterConfig) {
    super();
    this.config = {
      ...config,
      mocTokenAddress: config.mocTokenAddress || DEFAULT_MOC_TOKEN,
      foundationAddress: config.foundationAddress || DEFAULT_FOUNDATION,
      minTransferAmount: config.minTransferAmount || 100000, // 100K MOC
    };
  }

  async fetch(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // 1. Fetch MOC token transfers
      const transfers = await this.fetchTokenTransfers();
      for (const transfer of transfers) {
        signals.push(this.createTransferSignal(transfer));
      }

      // 2. Fetch gas prices
      const gasSignal = await this.fetchGasPrice();
      if (gasSignal) {
        signals.push(gasSignal);
      }

      // 3. Fetch foundation wallet activity
      const foundationSignals = await this.fetchFoundationActivity();
      signals.push(...foundationSignals);

    } catch (error) {
      console.error("[EtherscanAdapter] Error fetching data:", error);
    }

    return signals;
  }

  private async fetchTokenTransfers(): Promise<TokenTransfer[]> {
    const url = `${ETHERSCAN_API}?module=account&action=tokentx&contractaddress=${this.config.mocTokenAddress}&page=1&offset=20&sort=desc&apikey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json() as EtherscanResponse<TokenTransfer[]>;

      if (data.status === "1" && data.result) {
        // Filter large transfers (whale alerts)
        return data.result.filter((tx: TokenTransfer) => {
          const amount = parseFloat(tx.value) / Math.pow(10, parseInt(tx.tokenDecimal));
          return amount >= this.config.minTransferAmount!;
        });
      }
    } catch (error) {
      console.error("[EtherscanAdapter] Token transfer fetch error:", error);
    }

    return [];
  }

  private createTransferSignal(transfer: TokenTransfer): RawSignal {
    const amount = parseFloat(transfer.value) / Math.pow(10, parseInt(transfer.tokenDecimal));
    const isFoundationTx =
      transfer.from.toLowerCase() === this.config.foundationAddress?.toLowerCase() ||
      transfer.to.toLowerCase() === this.config.foundationAddress?.toLowerCase();

    return this.createRawSignal(
      `etherscan-transfer-${transfer.hash}`,
      {
        type: "token_transfer",
        amount,
        from: transfer.from,
        to: transfer.to,
        txHash: transfer.hash,
        blockNumber: parseInt(transfer.blockNumber),
        timestamp: parseInt(transfer.timeStamp) * 1000,
        tokenSymbol: transfer.tokenSymbol,
        isFoundationTx,
        isWhaleAlert: amount >= 500000, // 500K+ is whale
      },
      {
        txHash: transfer.hash,
        blockNumber: parseInt(transfer.blockNumber),
      }
    );
  }

  private async fetchGasPrice(): Promise<RawSignal | null> {
    const url = `${ETHERSCAN_API}?module=gastracker&action=gasoracle&apikey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json() as EtherscanResponse<GasPrice>;

      if (data.status === "1" && data.result) {
        const gasData = data.result;
        return this.createRawSignal(
          `etherscan-gas-${Date.now()}`,
          {
            type: "gas_price",
            safeGas: parseInt(gasData.SafeGasPrice),
            proposeGas: parseInt(gasData.ProposeGasPrice),
            fastGas: parseInt(gasData.FastGasPrice),
          }
        );
      }
    } catch (error) {
      console.error("[EtherscanAdapter] Gas price fetch error:", error);
    }

    return null;
  }

  private async fetchFoundationActivity(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];
    const url = `${ETHERSCAN_API}?module=account&action=txlist&address=${this.config.foundationAddress}&page=1&offset=5&sort=desc&apikey=${this.config.apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json() as EtherscanResponse<Transaction[]>;

      if (data.status === "1" && data.result) {
        for (const tx of data.result) {
          const value = parseFloat(tx.value) / 1e18; // ETH value
          if (value > 0.1) { // Significant ETH movement
            signals.push(this.createRawSignal(
              `etherscan-foundation-${tx.hash}`,
              {
                type: "foundation_activity",
                txHash: tx.hash,
                from: tx.from,
                to: tx.to,
                valueEth: value,
                blockNumber: parseInt(tx.blockNumber),
                timestamp: parseInt(tx.timeStamp) * 1000,
                methodId: tx.methodId,
                functionName: tx.functionName || "Unknown",
              },
              {
                txHash: tx.hash,
                blockNumber: parseInt(tx.blockNumber),
              }
            ));
          }
        }
      }
    } catch (error) {
      console.error("[EtherscanAdapter] Foundation activity fetch error:", error);
    }

    return signals;
  }

  normalize(signal: RawSignal): NormalizedSignal {
    const data = signal.data as {
      type: string;
      amount?: number;
      from?: string;
      to?: string;
      txHash?: string;
      isWhaleAlert?: boolean;
      isFoundationTx?: boolean;
      safeGas?: number;
      proposeGas?: number;
      fastGas?: number;
      valueEth?: number;
      functionName?: string;
    };

    let category: string;
    let severity: NormalizedSignal["severity"];
    let value: number;
    let unit: string;
    let description: string;

    switch (data.type) {
      case "token_transfer":
        category = data.isFoundationTx ? "foundation_transfer" : "moc_transfer";
        severity = data.isWhaleAlert ? "critical" : data.amount! > 200000 ? "high" : "medium";
        value = data.amount!;
        unit = "MOC";
        description = data.isWhaleAlert
          ? `Whale Alert: ${this.formatNumber(data.amount!)} MOC 대규모 전송`
          : `${this.formatNumber(data.amount!)} MOC 전송 (${this.shortenAddress(data.from!)} → ${this.shortenAddress(data.to!)})`;
        break;

      case "gas_price":
        category = "network_gas";
        severity = data.fastGas! > 100 ? "high" : data.fastGas! > 50 ? "medium" : "low";
        value = data.proposeGas!;
        unit = "Gwei";
        description = `이더리움 가스비: ${data.safeGas}/${data.proposeGas}/${data.fastGas} Gwei (Safe/Standard/Fast)`;
        break;

      case "foundation_activity":
        category = "foundation_activity";
        severity = data.valueEth! > 1 ? "high" : "medium";
        value = data.valueEth!;
        unit = "ETH";
        description = `Mossland Foundation 지갑 활동: ${data.valueEth?.toFixed(4)} ETH (${data.functionName})`;
        break;

      default:
        category = "onchain_unknown";
        severity = "low";
        value = 0;
        unit = "";
        description = "Unknown on-chain signal";
    }

    return this.createNormalizedSignal(signal, category, severity, value, unit, description);
  }

  private formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toFixed(0);
  }

  private shortenAddress(address: string): string {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }
}
