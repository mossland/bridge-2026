/**
 * Event Subscriber
 * 
 * 이벤트를 구독하는 인터페이스와 구현입니다.
 */

import type { Event, EventType } from './event-types';
import { eventPublisher } from './publisher';

/**
 * 이벤트 핸들러 타입
 */
export type EventHandler<T extends Event = Event> = (event: T) => void | Promise<void>;

/**
 * 이벤트 구독자 인터페이스
 */
export interface IEventSubscriber {
  /**
   * 이벤트를 구독합니다.
   * @param eventType 구독할 이벤트 타입
   * @param handler 이벤트 핸들러
   * @returns 구독 해제 함수
   */
  subscribe<T extends Event>(
    eventType: EventType,
    handler: EventHandler<T>
  ): () => void;
  
  /**
   * 여러 이벤트 타입을 구독합니다.
   * @param eventTypes 구독할 이벤트 타입 배열
   * @param handler 이벤트 핸들러
   * @returns 구독 해제 함수
   */
  subscribeMany<T extends Event>(
    eventTypes: EventType[],
    handler: EventHandler<T>
  ): () => void;
  
  /**
   * 모든 이벤트를 구독합니다.
   * @param handler 이벤트 핸들러
   * @returns 구독 해제 함수
   */
  subscribeAll(handler: EventHandler<Event>): () => void;
}

/**
 * 이벤트 구독자 구현
 */
export class EventSubscriber implements IEventSubscriber {
  private handlers: Map<string, Set<EventHandler>> = new Map();
  
  subscribe<T extends Event>(
    eventType: EventType,
    handler: EventHandler<T>
  ): () => void {
    // Publisher에 핸들러 등록
    (eventPublisher as any)._subscribe(eventType, handler);
    
    // 내부 추적을 위해 저장
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    this.handlers.get(eventType)!.add(handler);
    
    // 구독 해제 함수 반환
    return () => {
      (eventPublisher as any)._unsubscribe(eventType, handler);
      this.handlers.get(eventType)?.delete(handler);
    };
  }
  
  subscribeMany<T extends Event>(
    eventTypes: EventType[],
    handler: EventHandler<T>
  ): () => void {
    const unsubscribeFunctions = eventTypes.map(eventType =>
      this.subscribe(eventType, handler)
    );
    
    // 모든 구독을 해제하는 함수 반환
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }
  
  subscribeAll(handler: EventHandler<Event>): () => void {
    const allEventTypes = Object.values(EventType);
    return this.subscribeMany(allEventTypes, handler);
  }
  
  /**
   * 모든 구독을 해제합니다.
   */
  unsubscribeAll(): void {
    this.handlers.forEach((handlers, eventType) => {
      handlers.forEach(handler => {
        (eventPublisher as any)._unsubscribe(eventType, handler);
      });
    });
    this.handlers.clear();
  }
}

/**
 * 싱글톤 이벤트 구독자 인스턴스
 */
export const eventSubscriber = new EventSubscriber();




