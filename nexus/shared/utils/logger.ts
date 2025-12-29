/**
 * Logger
 * 
 * BRIDGE 2026의 로깅 시스템입니다.
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LoggerConfig {
  level: LogLevel;
  fileLogging?: boolean;
  logPath?: string;
  enableConsole?: boolean;
}

/**
 * 로거 클래스
 */
export class Logger {
  private config: LoggerConfig;
  private logBuffer: Array<{
    level: LogLevel;
    message: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }> = [];
  
  constructor(config: LoggerConfig) {
    this.config = {
      enableConsole: true,
      ...config,
    };
  }
  
  /**
   * 디버그 로그
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.DEBUG, message, metadata);
  }
  
  /**
   * 정보 로그
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.INFO, message, metadata);
  }
  
  /**
   * 경고 로그
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    this.log(LogLevel.WARN, message, metadata);
  }
  
  /**
   * 에러 로그
   */
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    const errorMetadata = error
      ? {
          ...metadata,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        }
      : metadata;
    
    this.log(LogLevel.ERROR, message, errorMetadata);
  }
  
  /**
   * 로그 기록
   */
  private log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    if (level < this.config.level) {
      return; // 로그 레벨 필터링
    }
    
    const timestamp = Date.now();
    const logEntry = {
      level,
      message,
      timestamp,
      metadata,
    };
    
    this.logBuffer.push(logEntry);
    
    // 버퍼 크기 제한 (최대 1000개)
    if (this.logBuffer.length > 1000) {
      this.logBuffer.shift();
    }
    
    // 콘솔 출력
    if (this.config.enableConsole) {
      this.logToConsole(level, message, metadata, timestamp);
    }
    
    // 파일 로깅 (TODO: 실제 파일 쓰기 구현)
    if (this.config.fileLogging) {
      // this.logToFile(logEntry);
    }
  }
  
  /**
   * 콘솔에 로그 출력
   */
  private logToConsole(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    timestamp?: number
  ): void {
    const timestampStr = timestamp ? new Date(timestamp).toISOString() : new Date().toISOString();
    const levelStr = LogLevel[level];
    const prefix = `[${timestampStr}] [${levelStr}]`;
    
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(prefix, message, metadata || '');
        break;
      case LogLevel.INFO:
        console.info(prefix, message, metadata || '');
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, metadata || '');
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, metadata || '');
        break;
    }
  }
  
  /**
   * 로그 버퍼를 가져옵니다.
   */
  getLogs(level?: LogLevel, limit?: number): Array<{
    level: LogLevel;
    message: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
  }> {
    let logs = this.logBuffer;
    
    if (level !== undefined) {
      logs = logs.filter(log => log.level === level);
    }
    
    if (limit !== undefined) {
      logs = logs.slice(-limit);
    }
    
    return logs;
  }
  
  /**
   * 로그 버퍼를 비웁니다.
   */
  clearLogs(): void {
    this.logBuffer = [];
  }
}

/**
 * 기본 로거 인스턴스
 */
let defaultLogger: Logger | undefined;

/**
 * 기본 로거를 가져옵니다.
 */
export function getLogger(): Logger {
  if (!defaultLogger) {
    const level = process.env.LOG_LEVEL === 'debug' ? LogLevel.DEBUG :
                  process.env.LOG_LEVEL === 'warn' ? LogLevel.WARN :
                  process.env.LOG_LEVEL === 'error' ? LogLevel.ERROR :
                  LogLevel.INFO;
    
    defaultLogger = new Logger({
      level,
      fileLogging: process.env.FILE_LOGGING === 'true',
      logPath: process.env.LOG_PATH || './logs',
    });
  }
  
  return defaultLogger;
}

/**
 * 로거를 설정합니다.
 */
export function setLogger(logger: Logger): void {
  defaultLogger = logger;
}




