/**
 * Production-ready logging utility for Supabase Edge Functions
 * Provides environment-aware logging with performance optimization
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  function?: string;
  duration?: number;
  userId?: string;
  [key: string]: any;
}

class Logger {
  private isDev: boolean;

  constructor() {
    // Enable verbose logging in development, minimal in production
    this.isDev = Deno.env.get('ENVIRONMENT') === 'development';
  }

  /**
   * Development-only logs (stripped in production)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Informational logs for important flow milestones
   */
  info(message: string, context?: LogContext): void {
    console.log(`[INFO] ${message}`, this.formatContext(context));
  }

  /**
   * Warning logs for recoverable issues
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, this.formatContext(context));
  }

  /**
   * Error logs for failures and exceptions
   */
  error(message: string, error?: Error, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, {
      error: error?.message || error,
      stack: error?.stack,
      ...this.formatContext(context),
    });
  }

  /**
   * Performance timing helper
   */
  timing(operation: string, durationMs: number, context?: LogContext): void {
    const formatted = durationMs.toFixed(2);
    if (this.isDev || durationMs > 1000) {
      // Always log slow operations (>1s), debug log all in dev
      this.info(`⏱️  ${operation}: ${formatted}ms`, context);
    }
  }

  private formatContext(context?: LogContext): string {
    if (!context) return '';
    return JSON.stringify(context, null, this.isDev ? 2 : 0);
  }
}

// Export singleton instance
export const logger = new Logger();
