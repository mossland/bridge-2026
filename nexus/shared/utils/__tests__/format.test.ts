/**
 * Format Tests
 */

import {
  formatCurrency,
  formatPercent,
  formatDate,
  formatRelativeTime,
  formatWalletAddress,
  formatCompactNumber,
  formatBytes,
  formatDuration,
} from '../format';

describe('Format Utilities', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toContain('1,234.56');
      expect(formatCurrency(1000, 'USD')).toContain('1,000');
    });
  });
  
  describe('formatPercent', () => {
    it('should format percentage correctly', () => {
      expect(formatPercent(0.5)).toBe('50.0%');
      expect(formatPercent(0.123, 2)).toBe('12.30%');
    });
  });
  
  describe('formatDate', () => {
    it('should format date in ISO format', () => {
      const date = new Date('2024-01-01T00:00:00Z');
      expect(formatDate(date, 'iso')).toContain('2024-01-01');
    });
  });
  
  describe('formatRelativeTime', () => {
    it('should format relative time correctly', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      expect(formatRelativeTime(oneHourAgo)).toContain('hour');
    });
  });
  
  describe('formatWalletAddress', () => {
    it('should format wallet address correctly', () => {
      const address = '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
      const formatted = formatWalletAddress(address);
      expect(formatted).toContain('...');
      expect(formatted.length).toBeLessThan(address.length);
    });
  });
  
  describe('formatCompactNumber', () => {
    it('should format compact numbers correctly', () => {
      expect(formatCompactNumber(1500)).toContain('K');
      expect(formatCompactNumber(2500000)).toContain('M');
    });
  });
  
  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(1024)).toContain('KB');
      expect(formatBytes(1048576)).toContain('MB');
    });
  });
  
  describe('formatDuration', () => {
    it('should format duration correctly', () => {
      expect(formatDuration(3600000)).toContain('h');
      expect(formatDuration(60000)).toContain('m');
    });
  });
});




