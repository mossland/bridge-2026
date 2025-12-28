/**
 * Validation Utilities
 * 
 * 데이터 검증 유틸리티입니다.
 */

/**
 * 이메일 검증
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 지갑 주소 검증 (이더리움 주소 형식)
 */
export function isValidWalletAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * URL 검증
 */
export function isValidURL(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * 숫자 범위 검증
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * 문자열 길이 검증
 */
export function isValidLength(str: string, min: number, max: number): boolean {
  return str.length >= min && str.length <= max;
}

/**
 * 필수 필드 검증
 */
export function validateRequired<T extends Record<string, unknown>>(
  data: T,
  fields: (keyof T)[]
): { valid: boolean; missing: (keyof T)[] } {
  const missing: (keyof T)[] = [];
  
  for (const field of fields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missing.push(field);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
  };
}

/**
 * 타입 검증
 */
export function validateType<T>(
  value: unknown,
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
): value is T {
  switch (type) {
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number' && !isNaN(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'object':
      return typeof value === 'object' && value !== null && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    default:
      return false;
  }
}

/**
 * UUID 검증
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * IPFS CID 검증 (간단한 형식)
 */
export function isValidIPFSCID(cid: string): boolean {
  // 기본적인 CID 형식 검증 (실제로는 더 정교한 검증 필요)
  return cid.length > 0 && (cid.startsWith('Qm') || cid.startsWith('baf'));
}


