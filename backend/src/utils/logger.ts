/**
 * Simple structured logger utility
 * In production, this could be replaced with Winston, Pino, or similar
 */

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private formatLog(level: LogLevel, message: string, meta?: Record<string, unknown>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  private log(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
    const logEntry = this.formatLog(level, message, meta);

    if (this.isDevelopment) {
      // Pretty print in development
      const color = {
        error: '\x1b[31m', // Red
        warn: '\x1b[33m',  // Yellow
        info: '\x1b[36m',  // Cyan
        debug: '\x1b[90m', // Gray
      }[level];
      const reset = '\x1b[0m';

      console.log(`${color}[${level.toUpperCase()}]${reset} ${message}`);
      if (meta && Object.keys(meta).length > 0) {
        console.log(JSON.stringify(meta, null, 2));
      }
    } else {
      // JSON format in production for log aggregation
      console.log(JSON.stringify(logEntry));
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.log('error', message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.log('warn', message, meta);
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.log('info', message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
