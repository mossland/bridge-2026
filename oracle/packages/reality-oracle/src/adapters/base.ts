import {
  SignalAdapter,
  SignalSource,
  RawSignal,
  NormalizedSignal,
  generateId,
  now,
} from "@oracle/core";

export abstract class BaseAdapter implements SignalAdapter {
  abstract readonly name: string;
  abstract readonly source: SignalSource;

  abstract fetch(): Promise<RawSignal[]>;

  validate(signal: RawSignal): boolean {
    if (!signal.id || !signal.source || !signal.timestamp) {
      return false;
    }
    if (signal.source !== this.source) {
      return false;
    }
    return true;
  }

  abstract normalize(signal: RawSignal): NormalizedSignal;

  protected createRawSignal(
    sourceId: string,
    data: Record<string, unknown>,
    metadata?: RawSignal["metadata"]
  ): RawSignal {
    return {
      id: generateId(),
      source: this.source,
      sourceId,
      timestamp: now(),
      data,
      metadata,
    };
  }

  protected createNormalizedSignal(
    original: RawSignal,
    category: string,
    severity: NormalizedSignal["severity"],
    value: number,
    unit: string,
    description: string
  ): NormalizedSignal {
    return {
      id: generateId(),
      originalId: original.id,
      source: this.source,
      timestamp: original.timestamp,
      category,
      severity,
      value,
      unit,
      description,
    };
  }
}
