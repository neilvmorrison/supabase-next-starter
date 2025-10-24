"use client";

import { useEffect } from "react";
import { getGlobalErrorLogger } from "./logger";
import { createErrorContext } from "./utils";

export function GlobalErrorHandlers() {
  useEffect(() => {
    const logger = getGlobalErrorLogger();

    const handleUnhandledError = (event: ErrorEvent) => {
      const error = new Error(event.message);
      error.stack = `${event.filename}:${event.lineno}:${event.colno}`;

      const context = createErrorContext({
        url: event.filename,
        metadata: {
          line: event.lineno,
          column: event.colno,
          unhandled: true,
          filename: event.filename,
        },
      });

      logger.logClientError(error, context);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      const context = createErrorContext({
        metadata: {
          unhandledRejection: true,
          reason: event.reason,
        },
      });

      logger.logClientError(error, context);
    };

    const handleResourceError = (event: Event) => {
      const target = event.target as HTMLElement;
      const error = new Error(`Resource failed to load: ${target.tagName}`);

      const context = createErrorContext({
        metadata: {
          resourceError: true,
          tagName: target.tagName,
          src:
            (target as HTMLImageElement).src ||
            (target as HTMLElement).getAttribute("src"),
        },
      });

      logger.logClientError(error, context);
    };

    // Add event listeners
    window.addEventListener("error", handleUnhandledError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleResourceError, true);

    // Cleanup
    return () => {
      window.removeEventListener("error", handleUnhandledError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleResourceError, true);
    };
  }, []);

  return null;
}


// React component error handler
export function withComponentErrorHandler<P extends object>(
  Component: React.ComponentType<P>
) {
  const WrappedComponent = (props: P) => {
    const logger = getGlobalErrorLogger();

    useEffect(() => {
      const originalConsoleError = console.error;

      console.error = (...args) => {
        // Log React warnings/errors
        const errorMessage = args.join(" ");
        if (
          errorMessage.includes("Warning:") ||
          errorMessage.includes("Error:")
        ) {
          const error = new Error(errorMessage);
          logger.logClientError(error, {
            metadata: {
              consoleError: true,
              component: Component.displayName || Component.name,
            },
          });
        }

        originalConsoleError.apply(console, args);
      };

      return () => {
        console.error = originalConsoleError;
      };
    }, []);

    return <Component {...props} />;
  };

  WrappedComponent.displayName = `withComponentErrorHandler(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}
