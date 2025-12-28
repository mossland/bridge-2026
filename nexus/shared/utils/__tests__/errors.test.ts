/**
 * Error Tests
 */

import {
  BridgeError,
  RealityOracleError,
  InferenceMiningError,
  AgenticConsensusError,
  HumanGovernanceError,
  AtomicActuationError,
  ProofOfOutcomeError,
  errorToJSON,
} from '../errors';

describe('Error Types', () => {
  describe('BridgeError', () => {
    it('should create error with code and details', () => {
      const error = new BridgeError('Test error', 'TEST_ERROR', 500, { key: 'value' });
      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.statusCode).toBe(500);
      expect(error.details).toEqual({ key: 'value' });
    });
  });
  
  describe('RealityOracleError', () => {
    it('should create RealityOracleError', () => {
      const error = new RealityOracleError('Oracle error', { signalId: '123' });
      expect(error.name).toBe('RealityOracleError');
      expect(error.code).toBe('REALITY_ORACLE_ERROR');
    });
  });
  
  describe('InferenceMiningError', () => {
    it('should create InferenceMiningError', () => {
      const error = new InferenceMiningError('Mining error');
      expect(error.name).toBe('InferenceMiningError');
      expect(error.code).toBe('INFERENCE_MINING_ERROR');
    });
  });
  
  describe('AgenticConsensusError', () => {
    it('should create AgenticConsensusError', () => {
      const error = new AgenticConsensusError('Consensus error');
      expect(error.name).toBe('AgenticConsensusError');
      expect(error.code).toBe('AGENTIC_CONSENSUS_ERROR');
    });
  });
  
  describe('HumanGovernanceError', () => {
    it('should create HumanGovernanceError', () => {
      const error = new HumanGovernanceError('Governance error');
      expect(error.name).toBe('HumanGovernanceError');
      expect(error.code).toBe('HUMAN_GOVERNANCE_ERROR');
    });
  });
  
  describe('AtomicActuationError', () => {
    it('should create AtomicActuationError', () => {
      const error = new AtomicActuationError('Actuation error');
      expect(error.name).toBe('AtomicActuationError');
      expect(error.code).toBe('ATOMIC_ACTUATION_ERROR');
    });
  });
  
  describe('ProofOfOutcomeError', () => {
    it('should create ProofOfOutcomeError', () => {
      const error = new ProofOfOutcomeError('Outcome error');
      expect(error.name).toBe('ProofOfOutcomeError');
      expect(error.code).toBe('PROOF_OF_OUTCOME_ERROR');
    });
  });
  
  describe('errorToJSON', () => {
    it('should convert BridgeError to JSON', () => {
      const error = new BridgeError('Test', 'TEST', 500, { key: 'value' });
      const json = errorToJSON(error);
      expect(json.code).toBe('TEST');
      expect(json.statusCode).toBe(500);
      expect(json.details).toEqual({ key: 'value' });
    });
    
    it('should convert regular Error to JSON', () => {
      const error = new Error('Regular error');
      const json = errorToJSON(error);
      expect(json.name).toBe('Error');
      expect(json.message).toBe('Regular error');
      expect(json.code).toBeUndefined();
    });
  });
});


