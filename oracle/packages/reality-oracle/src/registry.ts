import {
  SignalAdapter,
  RawSignal,
  NormalizedSignal,
  hashData,
} from "@oracle/core";

export interface SignalRegistryConfig {
  maxSignals?: number;
  pruneInterval?: number;
}

export class SignalRegistry {
  private adapters: Map<string, SignalAdapter> = new Map();
  private rawSignals: Map<string, RawSignal> = new Map();
  private normalizedSignals: Map<string, NormalizedSignal> = new Map();
  private config: SignalRegistryConfig;

  constructor(config: SignalRegistryConfig = {}) {
    this.config = {
      maxSignals: config.maxSignals || 10000,
      pruneInterval: config.pruneInterval || 3600000, // 1 hour
    };
  }

  registerAdapter(adapter: SignalAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  unregisterAdapter(name: string): void {
    this.adapters.delete(name);
  }

  getAdapter(name: string): SignalAdapter | undefined {
    return this.adapters.get(name);
  }

  listAdapters(): string[] {
    return Array.from(this.adapters.keys());
  }

  async collectSignals(): Promise<NormalizedSignal[]> {
    const collected: NormalizedSignal[] = [];

    for (const adapter of this.adapters.values()) {
      try {
        const rawSignals = await adapter.fetch();

        for (const raw of rawSignals) {
          if (!adapter.validate(raw)) {
            console.warn(`Invalid signal from ${adapter.name}:`, raw.id);
            continue;
          }

          this.rawSignals.set(raw.id, raw);
          const normalized = adapter.normalize(raw);
          this.normalizedSignals.set(normalized.id, normalized);
          collected.push(normalized);
        }
      } catch (error) {
        console.error(`Error collecting from ${adapter.name}:`, error);
      }
    }

    // Prune old signals if exceeding limit
    this.pruneOldSignals();

    return collected;
  }

  getSignal(id: string): NormalizedSignal | undefined {
    return this.normalizedSignals.get(id);
  }

  getRawSignal(id: string): RawSignal | undefined {
    return this.rawSignals.get(id);
  }

  getSignalsByCategory(category: string): NormalizedSignal[] {
    return Array.from(this.normalizedSignals.values()).filter(
      (s) => s.category === category
    );
  }

  getSignalsBySeverity(
    severity: NormalizedSignal["severity"]
  ): NormalizedSignal[] {
    return Array.from(this.normalizedSignals.values()).filter(
      (s) => s.severity === severity
    );
  }

  getRecentSignals(count: number = 100): NormalizedSignal[] {
    return Array.from(this.normalizedSignals.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, count);
  }

  // Generate Merkle root for on-chain attestation
  generateAttestation(signalIds: string[]): string {
    const signals = signalIds
      .map((id) => this.normalizedSignals.get(id))
      .filter((s): s is NormalizedSignal => s !== undefined);

    if (signals.length === 0) {
      throw new Error("No valid signals found for attestation");
    }

    // Simple hash-based attestation (real implementation would use Merkle tree)
    const data = signals.map((s) => ({
      id: s.id,
      category: s.category,
      value: s.value,
      timestamp: s.timestamp.toISOString(),
    }));

    return hashData(data);
  }

  private pruneOldSignals(): void {
    const maxSignals = this.config.maxSignals!;

    if (this.normalizedSignals.size <= maxSignals) {
      return;
    }

    // Sort by timestamp and remove oldest
    const sorted = Array.from(this.normalizedSignals.entries()).sort(
      ([, a], [, b]) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const toRemove = sorted.slice(maxSignals);
    for (const [id, signal] of toRemove) {
      this.normalizedSignals.delete(id);
      this.rawSignals.delete(signal.originalId);
    }
  }

  clear(): void {
    this.rawSignals.clear();
    this.normalizedSignals.clear();
  }

  stats(): {
    adapterCount: number;
    rawSignalCount: number;
    normalizedSignalCount: number;
  } {
    return {
      adapterCount: this.adapters.size,
      rawSignalCount: this.rawSignals.size,
      normalizedSignalCount: this.normalizedSignals.size,
    };
  }
}
