import { RawSignal, NormalizedSignal, SignalSource } from "@oracle/core";
import { BaseAdapter } from "./base.js";

export interface APIEndpoint {
  name: string;
  url: string;
  method?: "GET" | "POST";
  headers?: Record<string, string>;
  body?: unknown;
  transform?: (data: unknown) => Record<string, unknown>;
  category: string;
  severityThreshold?: {
    field: string;
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

export interface APIAdapterConfig {
  endpoints: APIEndpoint[];
  pollInterval?: number;
}

export class APIAdapter extends BaseAdapter {
  readonly name = "APIAdapter";
  readonly source: SignalSource = "api";

  private config: APIAdapterConfig;

  constructor(config: APIAdapterConfig) {
    super();
    this.config = config;
  }

  async fetch(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    for (const endpoint of this.config.endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method || "GET",
          headers: endpoint.headers,
          body: endpoint.body ? JSON.stringify(endpoint.body) : undefined,
        });

        if (!response.ok) {
          console.error(`API fetch failed for ${endpoint.name}: ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const transformedData = endpoint.transform
          ? endpoint.transform(data)
          : (data as Record<string, unknown>);

        const signal = this.createRawSignal(
          `${endpoint.name}-${Date.now()}`,
          {
            ...transformedData,
            _endpoint: endpoint.name,
            _category: endpoint.category,
            _severityConfig: endpoint.severityThreshold,
          },
          {
            apiEndpoint: endpoint.url,
          }
        );
        signals.push(signal);
      } catch (error) {
        console.error(`API fetch error for ${endpoint.name}:`, error);
      }
    }

    return signals;
  }

  normalize(signal: RawSignal): NormalizedSignal {
    const data = signal.data as {
      _endpoint: string;
      _category: string;
      _severityConfig?: {
        field: string;
        low: number;
        medium: number;
        high: number;
        critical: number;
      };
      value?: number;
      [key: string]: unknown;
    };

    const category = data._category || "api_data";
    let severity: NormalizedSignal["severity"] = "low";
    let value = 0;

    // Determine severity based on configured thresholds
    if (data._severityConfig && data[data._severityConfig.field] !== undefined) {
      const fieldValue = Number(data[data._severityConfig.field]);
      value = fieldValue;

      if (fieldValue >= data._severityConfig.critical) {
        severity = "critical";
      } else if (fieldValue >= data._severityConfig.high) {
        severity = "high";
      } else if (fieldValue >= data._severityConfig.medium) {
        severity = "medium";
      } else {
        severity = "low";
      }
    } else if (typeof data.value === "number") {
      value = data.value;
    }

    return this.createNormalizedSignal(
      signal,
      category,
      severity,
      value,
      "unit",
      `API signal from ${data._endpoint}`
    );
  }
}
