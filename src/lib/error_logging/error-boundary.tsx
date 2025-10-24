"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { useErrorBoundary } from "@/hooks";
import { IErrorContext } from "./types";

interface IErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: Partial<IErrorContext>;
  showErrorDetails?: boolean;
}

interface IErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<
  IErrorBoundaryProps,
  IErrorBoundaryState
> {
  constructor(props: IErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): IErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Call the onError prop if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          showErrorDetails={this.props.showErrorDetails}
        />
      );
    }

    return this.props.children;
  }
}

interface IErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  showErrorDetails?: boolean;
}

function ErrorFallback({
  error,
  errorInfo,
  showErrorDetails = false,
}: IErrorFallbackProps) {
  const { handleError } = useErrorBoundary();

  React.useEffect(() => {
    if (error && errorInfo) {
      handleError(error, errorInfo);
    }
  }, [error, errorInfo, handleError]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Something went wrong
            </h3>
          </div>
        </div>

        <div className="text-sm text-gray-600 mb-4">
          <p>
            We're sorry, but something unexpected happened. Our team has been
            notified and is working to fix the issue.
          </p>
        </div>

        {showErrorDetails && error && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
              Error Details
            </summary>
            <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
              <div className="mb-2">
                <strong>Error:</strong> {error.message}
              </div>
              {error.stack && (
                <div>
                  <strong>Stack:</strong>
                  <pre className="whitespace-pre-wrap">{error.stack}</pre>
                </div>
              )}
              {errorInfo?.componentStack && (
                <div className="mt-2">
                  <strong>Component Stack:</strong>
                  <pre className="whitespace-pre-wrap">
                    {errorInfo.componentStack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="mt-6">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook-based error boundary for functional components
export function useErrorBoundaryFallback() {
  const [error, setError] = React.useState<Error | null>(null);
  const { handleError } = useErrorBoundary();

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback(
    (error: Error, errorInfo?: ErrorInfo) => {
      setError(error);
      handleError(error, errorInfo);
    },
    [handleError]
  );

  React.useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error, handleError]);

  return {
    error,
    resetError,
    captureError,
    hasError: error !== null,
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<IErrorBoundaryProps, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Async error boundary for handling async errors in components
export function AsyncErrorBoundary({ children }: { children: ReactNode }) {
  const { handleError } = useErrorBoundary();
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    const handleAsyncError = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason));

      setError(error);
      handleError(error, {
        componentStack: "AsyncErrorBoundary",
      });
    };

    window.addEventListener("unhandledrejection", handleAsyncError);

    return () => {
      window.removeEventListener("unhandledrejection", handleAsyncError);
    };
  }, [handleError]);

  if (error) {
    return (
      <ErrorFallback
        error={error}
        showErrorDetails={process.env.NODE_ENV === "development"}
      />
    );
  }

  return <>{children}</>;
}
