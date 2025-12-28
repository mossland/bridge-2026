/**
 * Event Publisher
 * 
 * 이벤트를 발행하는 인터페이스와 구현입니다.
 */

import type { Event } from './event-types';

/**
 * 이벤트 발행자 인터페이스
 */
export interface IEventPublisher {
  /**
   * 이벤트를 발행합니다.
   * @param event 발행할 이벤트
   */
  publish(event: Event): Promise<void>;
  
  /**
   * 여러 이벤트를 한 번에 발행합니다.
   * @param events 발행할 이벤트 배열
   */
  publishBatch(events: Event[]): Promise<void>;
}

/**
 * 이벤트 발행자 구현 (메모리 기반)
 * 
 * 실제 프로덕션에서는 Redis, RabbitMQ, Kafka 등을 사용할 수 있습니다.
 */
export class EventPublisher implements IEventPublisher {
  private subscribers: Map<string, Set<(event: Event) => void>> = new Map();
  
  /**
   * 이벤트를 발행하고 구독자들에게 전달합니다.
   */
  async publish(event: Event): Promise<void> {
    const subscribers = this.subscribers.get(event.type) || new Set();
    
    // 모든 구독자에게 이벤트 전달
    const promises = Array.from(subscribers).map(subscriber => {
      try {
        return Promise.resolve(subscriber(event));
      } catch (error) {
        console.error(`Error in event subscriber for ${event.type}:`, error);
        return Promise.resolve();
      }
    });
    
    await Promise.all(promises);
  }
  
  /**
   * 여러 이벤트를 한 번에 발행합니다.
   */
  async publishBatch(events: Event[]): Promise<void> {
    await Promise.all(events.map(event => this.publish(event)));
  }
  
  /**
   * 구독자를 등록합니다. (내부 사용)
   */
  _subscribe(eventType: string, handler: (event: Event) => void): void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, new Set());
    }
    this.subscribers.get(eventType)!.add(handler);
  }
  
  /**
   * 구독자를 제거합니다. (내부 사용)
   */
  _unsubscribe(eventType: string, handler: (event: Event) => void): void {
    const subscribers = this.subscribers.get(eventType);
    if (subscribers) {
      subscribers.delete(handler);
    }
  }
}

/**
 * 싱글톤 이벤트 발행자 인스턴스
 */
export const eventPublisher = new EventPublisher();


