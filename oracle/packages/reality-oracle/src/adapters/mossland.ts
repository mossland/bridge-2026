import { RawSignal, NormalizedSignal, SignalSource } from "@oracle/core";
import { BaseAdapter } from "./base.js";

export interface MosslandAdapterConfig {
  apiUrl?: string;
  language?: "en" | "ko";
}

const DEFAULT_API_URL = "https://disclosure.moss.land";

interface Disclosure {
  date: string;
  title: string;
  url: string;
}

interface MarketData {
  market_type: string;
  number: number;
}

interface TickerData {
  market: string;
  trade_price: number;
  acc_trade_price_24h: number;
  acc_trade_volume_24h: number;
  timestamp: number;
  change: string;
  change_rate: number;
  change_price: number;
}

interface Transaction {
  txHash: string;
  from: string;
  to: string;
  amount: string;
  timestamp: number;
}

interface LastTxResponse {
  value: Transaction[];
}

interface CountResponse {
  count: number;
}

interface ReleaseItem {
  date: string;
  title: string;
  description?: string;
}

export class MosslandAdapter extends BaseAdapter {
  readonly name = "MosslandAdapter";
  readonly source: SignalSource = "api";

  private config: MosslandAdapterConfig;
  private lastDisclosureDate: string = "";
  private lastPrice: number = 0;

  constructor(config: MosslandAdapterConfig = {}) {
    super();
    this.config = {
      apiUrl: config.apiUrl || DEFAULT_API_URL,
      language: config.language || "ko",
    };
  }

  async fetch(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // 1. Fetch new disclosures
      const disclosureSignals = await this.fetchDisclosures();
      signals.push(...disclosureSignals);

      // 2. Fetch market data (price, volume)
      const marketSignals = await this.fetchMarketData();
      signals.push(...marketSignals);

      // 3. Fetch blockchain stats (transactions, holders)
      const blockchainSignals = await this.fetchBlockchainStats();
      signals.push(...blockchainSignals);

      // 4. Fetch release schedule
      const releaseSignals = await this.fetchReleaseSchedule();
      signals.push(...releaseSignals);

    } catch (error) {
      console.error("[MosslandAdapter] Error fetching data:", error);
    }

    return signals;
  }

  private async fetchDisclosures(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];
    const url = `${this.config.apiUrl}/api/disclosure?lang=${this.config.language}`;

    try {
      const response = await fetch(url);
      const data = await response.json() as Disclosure[];

      if (Array.isArray(data) && data.length > 0) {
        // Check for new disclosures
        const latestDate = data[0].date;
        if (latestDate !== this.lastDisclosureDate) {
          this.lastDisclosureDate = latestDate;

          // Create signal for new disclosure
          const latest = data[0];
          signals.push(this.createRawSignal(
            `mossland-disclosure-${Date.now()}`,
            {
              type: "disclosure",
              title: latest.title,
              date: latest.date,
              url: latest.url,
              isNew: true,
            },
            {
              apiEndpoint: url,
            }
          ));
        }

        // Always include recent disclosure count
        signals.push(this.createRawSignal(
          `mossland-disclosure-count-${Date.now()}`,
          {
            type: "disclosure_stats",
            totalCount: data.length,
            latestTitle: data[0].title,
            latestDate: data[0].date,
          },
          {
            apiEndpoint: url,
          }
        ));
      }
    } catch (error) {
      console.error("[MosslandAdapter] Disclosure fetch error:", error);
    }

    return signals;
  }

  private async fetchMarketData(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // Fetch ticker from Upbit
      const tickerUrl = `${this.config.apiUrl}/api/getTickerKrw?exchange=upbit`;
      const tickerResponse = await fetch(tickerUrl);
      const tickerData = await tickerResponse.json();

      if (Array.isArray(tickerData) && tickerData.length > 0) {
        const ticker = tickerData[0] as TickerData;
        const priceChange = this.lastPrice > 0
          ? ((ticker.trade_price - this.lastPrice) / this.lastPrice) * 100
          : 0;

        signals.push(this.createRawSignal(
          `mossland-price-${Date.now()}`,
          {
            type: "price",
            price: ticker.trade_price,
            priceChange,
            change: ticker.change,
            changeRate: ticker.change_rate * 100,
            changePrice: ticker.change_price,
            volume24h: ticker.acc_trade_volume_24h,
            volumeKrw24h: ticker.acc_trade_price_24h,
            exchange: "upbit",
          },
          {
            apiEndpoint: tickerUrl,
          }
        ));

        this.lastPrice = ticker.trade_price;

        // Alert for significant price changes
        if (Math.abs(ticker.change_rate) > 0.05) { // 5% change
          signals.push(this.createRawSignal(
            `mossland-price-alert-${Date.now()}`,
            {
              type: "price_alert",
              price: ticker.trade_price,
              changeRate: ticker.change_rate * 100,
              direction: ticker.change,
              isSignificant: true,
            }
          ));
        }
      }

      // Fetch market overview
      const marketUrl = `${this.config.apiUrl}/api/market`;
      const marketResponse = await fetch(marketUrl);
      const marketData = await marketResponse.json() as MarketData[];

      if (Array.isArray(marketData)) {
        const marketCapKrw = marketData.find(m => m.market_type === "mossland_marketcap_krw");
        const marketCapUsd = marketData.find(m => m.market_type === "coinmarketcap_marketcap_usd");
        const circulatingSupply = marketData.find(m => m.market_type === "mossland_circulating_supply");

        signals.push(this.createRawSignal(
          `mossland-marketcap-${Date.now()}`,
          {
            type: "market_overview",
            marketCapKrw: marketCapKrw?.number || 0,
            marketCapUsd: marketCapUsd?.number || 0,
            circulatingSupply: circulatingSupply?.number || 0,
          },
          {
            apiEndpoint: marketUrl,
          }
        ));
      }
    } catch (error) {
      console.error("[MosslandAdapter] Market data fetch error:", error);
    }

    return signals;
  }

  private async fetchBlockchainStats(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // Fetch total transaction count
      const totalTxUrl = `${this.config.apiUrl}/api/getTotalTx`;
      const totalTxResponse = await fetch(totalTxUrl);
      const totalTxData = await totalTxResponse.json() as CountResponse;

      // Fetch daily transaction count
      const dailyTxUrl = `${this.config.apiUrl}/api/getLastDayTx`;
      const dailyTxResponse = await fetch(dailyTxUrl);
      const dailyTxData = await dailyTxResponse.json() as CountResponse;

      // Fetch holder count
      const holderUrl = `${this.config.apiUrl}/api/getHolderCount`;
      const holderResponse = await fetch(holderUrl);
      const holderData = await holderResponse.json() as CountResponse;

      signals.push(this.createRawSignal(
        `mossland-blockchain-stats-${Date.now()}`,
        {
          type: "blockchain_stats",
          totalTransactions: totalTxData?.count || 0,
          dailyTransactions: dailyTxData?.count || 0,
          holderCount: holderData?.count || 0,
        },
        {
          apiEndpoint: totalTxUrl,
        }
      ));

      // Alert for high daily transaction activity
      if ((dailyTxData?.count || 0) > 1000) {
        signals.push(this.createRawSignal(
          `mossland-tx-alert-${Date.now()}`,
          {
            type: "transaction_alert",
            dailyTransactions: dailyTxData?.count || 0,
            isHighActivity: true,
          }
        ));
      }

      // Fetch recent transactions
      const lastTxUrl = `${this.config.apiUrl}/api/getLastTx`;
      const lastTxResponse = await fetch(lastTxUrl);
      const lastTxData = await lastTxResponse.json() as LastTxResponse;

      if (lastTxData && Array.isArray(lastTxData.value)) {
        signals.push(this.createRawSignal(
          `mossland-recent-tx-${Date.now()}`,
          {
            type: "recent_transactions",
            count: lastTxData.value.length,
            transactions: lastTxData.value.slice(0, 5),
          },
          {
            apiEndpoint: lastTxUrl,
          }
        ));
      }
    } catch (error) {
      console.error("[MosslandAdapter] Blockchain stats fetch error:", error);
    }

    return signals;
  }

  private async fetchReleaseSchedule(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    try {
      // Fetch recent releases (past 3 months)
      const recentUrl = `${this.config.apiUrl}/api/recent_release?lang=${this.config.language}`;
      const recentResponse = await fetch(recentUrl);
      const recentData = await recentResponse.json() as ReleaseItem[];

      // Fetch expected releases (next 3 months)
      const expectedUrl = `${this.config.apiUrl}/api/expected_release?lang=${this.config.language}`;
      const expectedResponse = await fetch(expectedUrl);
      const expectedData = await expectedResponse.json() as ReleaseItem[];

      if (Array.isArray(recentData) || Array.isArray(expectedData)) {
        signals.push(this.createRawSignal(
          `mossland-releases-${Date.now()}`,
          {
            type: "release_schedule",
            recentReleases: Array.isArray(recentData) ? recentData.slice(0, 3) : [],
            expectedReleases: Array.isArray(expectedData) ? expectedData.slice(0, 3) : [],
            recentCount: Array.isArray(recentData) ? recentData.length : 0,
            expectedCount: Array.isArray(expectedData) ? expectedData.length : 0,
          },
          {
            apiEndpoint: expectedUrl,
          }
        ));
      }
    } catch (error) {
      console.error("[MosslandAdapter] Release schedule fetch error:", error);
    }

    return signals;
  }

  normalize(signal: RawSignal): NormalizedSignal {
    const data = signal.data as {
      type: string;
      title?: string;
      date?: string;
      url?: string;
      isNew?: boolean;
      price?: number;
      changeRate?: number;
      direction?: string;
      isSignificant?: boolean;
      marketCapKrw?: number;
      marketCapUsd?: number;
      circulatingSupply?: number;
      totalTransactions?: number;
      dailyTransactions?: number;
      holderCount?: number;
      count?: number;
      totalCount?: number;
      latestTitle?: string;
      recentCount?: number;
      expectedCount?: number;
      isHighActivity?: boolean;
    };

    let category: string;
    let severity: NormalizedSignal["severity"];
    let value: number;
    let unit: string;
    let description: string;

    switch (data.type) {
      case "disclosure":
        category = "mossland_disclosure";
        severity = "high";
        value = 1;
        unit = "건";
        description = `새 공시: ${data.title}`;
        break;

      case "disclosure_stats":
        category = "mossland_disclosure";
        severity = "low";
        value = data.totalCount || 0;
        unit = "건";
        description = `공시 현황: 총 ${data.totalCount}건`;
        break;

      case "price":
        category = "moc_price";
        severity = Math.abs(data.changeRate || 0) > 10 ? "high" :
                   Math.abs(data.changeRate || 0) > 5 ? "medium" : "low";
        value = data.price || 0;
        unit = "KRW";
        description = `MOC 가격: ${this.formatKrw(data.price || 0)} (${(data.changeRate || 0) >= 0 ? "+" : ""}${(data.changeRate || 0).toFixed(2)}%)`;
        break;

      case "price_alert":
        category = "moc_price_alert";
        severity = Math.abs(data.changeRate || 0) > 10 ? "critical" : "high";
        value = data.changeRate || 0;
        unit = "%";
        description = `MOC 가격 급변: ${data.direction === "RISE" ? "상승" : "하락"} ${Math.abs(data.changeRate || 0).toFixed(2)}%`;
        break;

      case "market_overview":
        category = "moc_market";
        severity = "low";
        value = data.marketCapKrw || 0;
        unit = "KRW";
        description = `MOC 시가총액: ${this.formatKrw(data.marketCapKrw || 0)} (${this.formatUsd(data.marketCapUsd || 0)})`;
        break;

      case "blockchain_stats":
        category = "moc_blockchain";
        severity = "low";
        value = data.holderCount || 0;
        unit = "holders";
        description = `MOC 블록체인: ${(data.holderCount || 0).toLocaleString()}명 홀더, ${(data.dailyTransactions || 0).toLocaleString()}건/일`;
        break;

      case "transaction_alert":
        category = "moc_tx_alert";
        severity = "medium";
        value = data.dailyTransactions || 0;
        unit = "건";
        description = `트랜잭션 급증: 24시간 ${(data.dailyTransactions || 0).toLocaleString()}건`;
        break;

      case "recent_transactions":
        category = "moc_transactions";
        severity = "low";
        value = data.count || 0;
        unit = "건";
        description = `최근 트랜잭션: ${data.count}건`;
        break;

      case "release_schedule":
        category = "mossland_roadmap";
        severity = (data.expectedCount || 0) > 0 ? "medium" : "low";
        value = data.expectedCount || 0;
        unit = "건";
        description = `로드맵: 최근 ${data.recentCount}건 완료, ${data.expectedCount}건 예정`;
        break;

      default:
        category = "mossland_unknown";
        severity = "low";
        value = 0;
        unit = "";
        description = "Unknown Mossland signal";
    }

    return this.createNormalizedSignal(signal, category, severity, value, unit, description);
  }

  private formatKrw(amount: number): string {
    if (amount >= 100000000) return (amount / 100000000).toFixed(1) + "억원";
    if (amount >= 10000) return (amount / 10000).toFixed(1) + "만원";
    return amount.toLocaleString() + "원";
  }

  private formatUsd(amount: number): string {
    if (amount >= 1000000) return "$" + (amount / 1000000).toFixed(2) + "M";
    if (amount >= 1000) return "$" + (amount / 1000).toFixed(1) + "K";
    return "$" + amount.toFixed(0);
  }
}
