import { useCallback, useEffect, useRef } from "react";
import { getGlobalErrorLogger } from "@/lib/error_logging/logger";
import {
  IErrorContext,
  ErrorSeverity,
  ErrorCategory,
} from "@/lib/error_logging/types";

export function useErrorLogger() {
  const loggerRef = useRef(getGlobalErrorLogger());

  const logError = useCallback(
    async (error: Error | unknown, context?: Partial<IErrorContext>) => {
      try {
        await loggerRef.current.logError(error, context);
      } catch (loggingError) {
        console.error("Failed to log error:", loggingError);
      }
    },
    []
  );

  const logClientError = useCallback(
    async (error: Error | unknown, context?: Partial<IErrorContext>) => {
      try {
        await loggerRef.current.logClientError(error, context);
      } catch (loggingError) {
        console.error("Failed to log client error:", loggingError);
      }
    },
    []
  );

  const markErrorResolved = useCallback(async (errorId: string) => {
    try {
      await loggerRef.current.markErrorResolved(errorId);
    } catch (loggingError) {
      console.error("Failed to mark error as resolved:", loggingError);
    }
  }, []);

  const getErrors = useCallback(
    async (filters?: {
      severity?: ErrorSeverity[];
      category?: ErrorCategory[];
      resolved?: boolean;
      user_id?: string;
      date_from?: string;
      date_to?: string;
      limit?: number;
      offset?: number;
    }) => {
      try {
        return await loggerRef.current.getErrors(filters);
      } catch (loggingError) {
        console.error("Failed to fetch errors:", loggingError);
        return [];
      }
    },
    []
  );

  useEffect(() => {
    return () => {
      loggerRef.current.destroy();
    };
  }, []);

  return {
    logError,
    logClientError,
    markErrorResolved,
    getErrors,
  };
}

export function useErrorBoundary() {
  const { logClientError } = useErrorLogger();

  const handleError = useCallback(
    async (error: Error, errorInfo?: { componentStack?: string }) => {
      const context: Partial<IErrorContext> = {
        url: typeof window !== "undefined" ? window.location.href : undefined,
        user_agent:
          typeof window !== "undefined" ? navigator.userAgent : undefined,
      };

      // Add metadata to the error details
      if (errorInfo?.componentStack) {
        (error as any).componentStack = errorInfo.componentStack;
      }
      (error as any).errorBoundary = true;

      await logClientError(error, context);
    },
    [logClientError]
  );

  return { handleError };
}

export function useAsyncErrorHandler() {
  const { logError } = useErrorLogger();

  const handleAsyncError = useCallback(
    async (
      asyncFn: () => Promise<unknown>,
      context?: Partial<IErrorContext>
    ) => {
      try {
        return await asyncFn();
      } catch (error) {
        await logError(error, context);
        throw error; // Re-throw to maintain error handling flow
      }
    },
    [logError]
  );

  return { handleAsyncError };
}

export function useGlobalErrorHandlers() {
  const { logClientError } = useErrorLogger();

  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`;

      // Add metadata to the error
      (error as any).metadata = {
        line: event.lineno,
        column: event.colno,
        unhandled: true,
      };

      logClientError(error, {
        url: event.filename,
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      // Add metadata to the error
      (error as any).metadata = {
        unhandledRejection: true,
        reason: event.reason,
      };

      logClientError(error);
    };

    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
    };
  }, [logClientError]);
}
