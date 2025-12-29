/**
 * Hash Chain
 * 
 * 신호들의 무결성을 보장하기 위한 해시 체인을 관리합니다.
 */

import { signatureService } from './signature-service';
import type { Signal } from '../../../shared/types';

/**
 * 해시 체인 노드
 */
export interface HashChainNode {
  /** 신호 ID */
  signalId: string;
  /** 현재 해시 */
  hash: string;
  /** 이전 해시 */
  previousHash: string;
  /** 타임스탬프 */
  timestamp: number;
}

/**
 * 해시 체인 관리자
 */
export class HashChain {
  private chain: HashChainNode[] = [];
  private genesisHash: string;
  
  constructor(genesisHash?: string) {
    this.genesisHash = genesisHash || this.generateGenesisHash();
  }
  
  /**
   * 신호를 체인에 추가합니다.
   */
  addSignal(signal: Signal): HashChainNode {
    const previousHash = this.chain.length > 0
      ? this.chain[this.chain.length - 1].hash
      : this.genesisHash;
    
    const dataToHash = JSON.stringify({
      signalId: signal.id,
      previousHash,
      timestamp: signal.createdAt,
      data: signal.data,
    });
    
    const hash = signatureService.hash(dataToHash);
    
    const node: HashChainNode = {
      signalId: signal.id,
      hash,
      previousHash,
      timestamp: signal.createdAt,
    };
    
    this.chain.push(node);
    return node;
  }
  
  /**
   * 체인의 무결성을 검증합니다.
   */
  verify(): boolean {
    if (this.chain.length === 0) {
      return true;
    }
    
    // 첫 번째 노드 검증
    if (this.chain[0].previousHash !== this.genesisHash) {
      return false;
    }
    
    // 나머지 노드들 검증
    for (let i = 1; i < this.chain.length; i++) {
      const currentNode = this.chain[i];
      const previousNode = this.chain[i - 1];
      
      if (currentNode.previousHash !== previousNode.hash) {
        return false;
      }
      
      // 해시 재계산하여 검증
      const dataToHash = JSON.stringify({
        signalId: currentNode.signalId,
        previousHash: currentNode.previousHash,
        timestamp: currentNode.timestamp,
      });
      
      const expectedHash = signatureService.hash(dataToHash);
      if (currentNode.hash !== expectedHash) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * 체인을 가져옵니다.
   */
  getChain(): HashChainNode[] {
    return [...this.chain];
  }
  
  /**
   * 특정 신호의 해시 체인 참조를 가져옵니다.
   */
  getHashForSignal(signalId: string): string | null {
    const node = this.chain.find(n => n.signalId === signalId);
    return node ? node.hash : null;
  }
  
  /**
   * 제네시스 해시를 생성합니다.
   */
  private generateGenesisHash(): string {
    return signatureService.hash(`genesis-${Date.now()}`);
  }
}

/**
 * 싱글톤 해시 체인 인스턴스
 */
export const hashChain = new HashChain();




