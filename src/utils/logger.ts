/**
 * Frontend Logger Utility
 * Provides structured logging for React application with different log levels
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  stack?: string;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private isDevelopment: boolean = process.env.NODE_ENV === 'development';

  private constructor() {
    // Singleton pattern
    this.setupGlobalErrorHandler();
  }

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private setupGlobalErrorHandler(): void {
    // Catch unhandled errors
    window.addEventListener('error', (event) => {
      this.error('Unhandled Error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      }, event.error);
    });

    // Catch unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled Promise Rejection', {
        reason: event.reason,
      });
    });
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      stack: error?.stack,
    };

    // Store log entry
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Console output with styling
    const emoji = this.getLevelEmoji(level);
    const style = this.getLevelStyle(level);
    const timestamp = new Date().toLocaleTimeString();

    if (this.isDevelopment || level === LogLevel.ERROR || level === LogLevel.WARN) {
      console.group(`${emoji} [${timestamp}] ${level}: ${message}`);
      
      if (data) {
        console.log('%cData:', 'font-weight: bold;', data);
      }
      
      if (error) {
        console.error('%cError:', 'font-weight: bold; color: red;', error);
        if (error.stack) {
          console.error('%cStack Trace:', 'font-weight: bold;', error.stack);
        }
      }
      
      console.groupEnd();
    }

    // Send errors to backend (optional)
    if (level === LogLevel.ERROR) {
      this.sendToBackend(entry);
    }
  }

  private getLevelEmoji(level: LogLevel): string {
    const emojis = {
      [LogLevel.DEBUG]: '🔍',
      [LogLevel.INFO]: 'ℹ️',
      [LogLevel.WARN]: '⚠️',
      [LogLevel.ERROR]: '❌',
    };
    return emojis[level] || '📝';
  }

  private getLevelStyle(level: LogLevel): string {
    const styles = {
      [LogLevel.DEBUG]: 'color: gray',
      [LogLevel.INFO]: 'color: blue',
      [LogLevel.WARN]: 'color: orange',
      [LogLevel.ERROR]: 'color: red; font-weight: bold',
    };
    return styles[level] || '';
  }

  private sendToBackend(entry: LogEntry): void {
    // Optional: Send error logs to backend for monitoring
    // You can implement this to send logs to your backend service
    if (this.isDevelopment) {
      return; // Don't send to backend in development
    }

    // Example implementation (uncomment and modify as needed):
    /*
    fetch('/api/v1/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    }).catch(err => {
      console.error('Failed to send log to backend:', err);
    });
    */
  }

  // Public logging methods
  public debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  public info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  public warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  public error(message: string, data?: any, error?: Error): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  // Get recent logs
  public getLogs(level?: LogLevel, limit: number = 100): LogEntry[] {
    let filtered = this.logs;
    
    if (level) {
      filtered = this.logs.filter(log => log.level === level);
    }
    
    return filtered.slice(-limit);
  }

  // Clear logs
  public clearLogs(): void {
    this.logs = [];
  }

  // Export logs as JSON
  public exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // API call logging helper
  public logApiCall(
    method: string,
    url: string,
    status?: number,
    duration?: number,
    error?: any
  ): void {
    const data = {
      method,
      url,
      status,
      duration: duration ? `${duration}ms` : undefined,
    };

    if (error) {
      this.error(`API Call Failed: ${method} ${url}`, data, error);
    } else {
      this.info(`API Call: ${method} ${url}`, data);
    }
  }

  // Component lifecycle logging
  public logComponentMount(componentName: string, props?: any): void {
    this.debug(`Component Mounted: ${componentName}`, props);
  }

  public logComponentUnmount(componentName: string): void {
    this.debug(`Component Unmounted: ${componentName}`);
  }

  // User action logging
  public logUserAction(action: string, details?: any): void {
    this.info(`User Action: ${action}`, details);
  }
}

// Export singleton instance
export const logger = Logger.getInstance();

// Export default
export default logger;
