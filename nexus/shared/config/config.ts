/**
 * Configuration Management
 * 
 * BRIDGE 2026의 전역 설정을 관리합니다.
 */

export interface BridgeConfig {
  /** 환경 (development, staging, production) */
  environment: 'development' | 'staging' | 'production';
  
  /** 블록체인 설정 */
  blockchain: {
    /** RPC URL */
    rpcUrl: string;
    /** 네트워크 ID */
    networkId: number;
    /** 컨트랙트 주소 */
    contracts: {
      /** Moss Coin (ERC-20) 주소 */
      mossCoin: string;
      /** BridgeLog 컨트랙트 주소 */
      bridgeLog?: string;
    };
  };
  
  /** LLM 설정 */
  llm: {
    /** Gemini API 키 */
    geminiApiKey?: string;
    /** 모델 이름 */
    model?: string;
    /** 온도 */
    temperature?: number;
  };
  
  /** Agora 설정 */
  agora: {
    /** API URL */
    apiUrl?: string;
    /** API 키 */
    apiKey?: string;
  };
  
  /** 데이터베이스 설정 */
  database: {
    /** PostgreSQL 연결 문자열 */
    connectionString?: string;
    /** 호스트 */
    host?: string;
    /** 포트 */
    port?: number;
    /** 데이터베이스 이름 */
    database?: string;
    /** 사용자 이름 */
    username?: string;
    /** 비밀번호 */
    password?: string;
  };
  
  /** 수집기 설정 */
  collectors: {
    /** 수집 간격 (밀리초) */
    interval?: number;
    /** 활성화된 수집기 */
    enabled?: string[];
  };
  
  /** 로깅 설정 */
  logging: {
    /** 로그 레벨 */
    level: 'debug' | 'info' | 'warn' | 'error';
    /** 파일 로깅 활성화 */
    fileLogging?: boolean;
    /** 로그 파일 경로 */
    logPath?: string;
  };
}

/**
 * 기본 설정
 */
const defaultConfig: BridgeConfig = {
  environment: (process.env.NODE_ENV as any) || 'development',
  
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    networkId: parseInt(process.env.NETWORK_ID || '1', 10),
    contracts: {
      mossCoin: process.env.MOSS_COIN_ADDRESS || '0x8bbfe65e31b348cd823c62e02ad8c19a84d',
      bridgeLog: process.env.BRIDGE_LOG_CONTRACT_ADDRESS,
    },
  },
  
  llm: {
    geminiApiKey: process.env.GEMINI_API_KEY,
    model: process.env.LLM_MODEL || 'gemini-pro',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
  },
  
  agora: {
    apiUrl: process.env.AGORA_API_URL,
    apiKey: process.env.AGORA_API_KEY,
  },
  
  database: {
    connectionString: process.env.DATABASE_URL,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'bridge2026',
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
  },
  
  collectors: {
    interval: parseInt(process.env.COLLECTOR_INTERVAL || '60000', 10),
    enabled: process.env.ENABLED_COLLECTORS?.split(',') || [],
  },
  
  logging: {
    level: (process.env.LOG_LEVEL as any) || 'info',
    fileLogging: process.env.FILE_LOGGING === 'true',
    logPath: process.env.LOG_PATH || './logs',
  },
};

/**
 * 전역 설정 인스턴스
 */
let globalConfig: BridgeConfig = { ...defaultConfig };

/**
 * 설정을 가져옵니다.
 */
export function getConfig(): BridgeConfig {
  return { ...globalConfig };
}

/**
 * 설정을 업데이트합니다.
 */
export function updateConfig(updates: Partial<BridgeConfig>): void {
  globalConfig = {
    ...globalConfig,
    ...updates,
  };
}

/**
 * 설정을 초기화합니다.
 */
export function initializeConfig(config?: Partial<BridgeConfig>): void {
  globalConfig = {
    ...defaultConfig,
    ...config,
  };
}

/**
 * 환경 변수에서 설정을 로드합니다.
 */
export function loadConfigFromEnv(): BridgeConfig {
  return {
    ...defaultConfig,
    // 환경 변수는 이미 defaultConfig에 반영됨
  };
}

