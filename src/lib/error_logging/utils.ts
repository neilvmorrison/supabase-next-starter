import {
  ErrorLogger,
  getGlobalErrorLogger,
  getServerErrorLogger,
} from "./logger";
import { IErrorContext, ErrorSeverity, ErrorCategory } from "./types";

export function createErrorContext(
  context?: Partial<IErrorContext>
): IErrorContext {
  return {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    version: process.env.APP_VERSION,
    url: typeof window !== "undefined" ? window.location.href : undefined,
    user_agent: typeof window !== "undefined" ? navigator.userAgent : undefined,
    ...context,
  };
}

export function withErrorLogging<T extends unknown[], R>(
  fn: (...args: T) => R | Promise<R>,
  context?: Partial<IErrorContext>
) {
  return async (...args: T): Promise<R> => {
    const logger = getGlobalErrorLogger();

    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      await logger.logError(error, context);
      throw error;
    }
  };
}

export function withServerErrorLogging<T extends unknown[], R>(
  fn: (...args: T) => R | Promise<R>,
  context?: Partial<IErrorContext>
) {
  return async (...args: T): Promise<R> => {
    const logger = await getServerErrorLogger();

    try {
      const result = await fn(...args);
      return result;
    } catch (error) {
      await logger.logServerError(error, context);
      throw error;
    }
  };
}

export function createErrorWrapper(
  logger: ErrorLogger,
  context?: Partial<IErrorContext>
) {
  return {
    wrap: <T extends unknown[], R>(fn: (...args: T) => R | Promise<R>) => {
      return async (...args: T): Promise<R> => {
        try {
          const result = await fn(...args);
          return result;
        } catch (error) {
          await logger.logError(error, context);
          throw error;
        }
      };
    },

    wrapSync: <T extends unknown[], R>(fn: (...args: T) => R) => {
      return (...args: T): R => {
        try {
          return fn(...args);
        } catch (error) {
          logger.logError(error, context);
          throw error;
        }
      };
    },
  };
}

export function formatErrorForLogging(error: Error | unknown): {
  message: string;
  stack?: string;
  name?: string;
  metadata?: Record<string, unknown>;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      metadata: {
        constructor: error.constructor.name,
        cause: error.cause,
      },
    };
  }

  if (typeof error === "string") {
    return {
      message: error,
      metadata: { type: "string" },
    };
  }

  if (typeof error === "object" && error !== null) {
    return {
      message: "Unknown error object",
      metadata: {
        type: "object",
        keys: Object.keys(error),
        stringified: JSON.stringify(error),
      },
    };
  }

  return {
    message: `Unknown error: ${String(error)}`,
    metadata: { type: typeof error },
  };
}

export function isClientSide(): boolean {
  return typeof window !== "undefined";
}

export function isServerSide(): boolean {
  return typeof window === "undefined";
}

export function getEnvironment(): string {
  return process.env.NODE_ENV || "development";
}

export function getAppVersion(): string | undefined {
  return process.env.APP_VERSION;
}

export function createErrorId(): string {
  return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeErrorForLogging(
  error: Error | unknown
): Error | unknown {
  // Remove sensitive information from error objects
  if (error instanceof Error) {
    const sanitizedError = new Error(error.message);
    sanitizedError.name = error.name;
    sanitizedError.stack = error.stack;

    // Remove sensitive properties
    const sensitiveKeys = ["password", "token", "secret", "key", "auth"];
    const sanitizedCause = error.cause;

    if (typeof sanitizedCause === "object" && sanitizedCause !== null) {
      const sanitizedCauseObj = { ...sanitizedCause };
      Object.keys(sanitizedCauseObj).forEach((key) => {
        if (
          sensitiveKeys.some((sensitive) =>
            key.toLowerCase().includes(sensitive)
          )
        ) {
          delete sanitizedCauseObj[key];
        }
      });
      sanitizedError.cause = sanitizedCauseObj;
    }

    return sanitizedError;
  }

  return error;
}

export function groupErrorsByCategory(
  errors: Array<{ category: ErrorCategory; severity: ErrorSeverity }>
) {
  return errors.reduce((acc, error) => {
    if (!acc[error.category]) {
      acc[error.category] = {
        total: 0,
        bySeverity: {},
      };
    }

    acc[error.category].total++;
    acc[error.category].bySeverity[error.severity] =
      (acc[error.category].bySeverity[error.severity] || 0) + 1;

    return acc;
  }, {} as Record<ErrorCategory, { total: number; bySeverity: Record<ErrorSeverity, number> }>);
}

export function getErrorStats(
  errors: Array<{
    severity: ErrorSeverity;
    resolved: boolean;
    created_at: string;
  }>
) {
  const now = new Date();
  const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  return {
    total: errors.length,
    resolved: errors.filter((e) => e.resolved).length,
    unresolved: errors.filter((e) => !e.resolved).length,
    last24Hours: errors.filter((e) => new Date(e.created_at) > last24Hours)
      .length,
    last7Days: errors.filter((e) => new Date(e.created_at) > last7Days).length,
    bySeverity: errors.reduce((acc, error) => {
      acc[error.severity] = (acc[error.severity] || 0) + 1;
      return acc;
    }, {} as Record<ErrorSeverity, number>),
  };
}
