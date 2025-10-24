"use client";

import { useState } from "react";
import { useErrorLogger } from "@/hooks";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function ErrorTestPage() {
  const { logClientError } = useErrorLogger();
  const [testResults, setTestResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setTestResults((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const testClientError = async () => {
    try {
      throw new Error("Test client error - this is intentional for testing");
    } catch (error) {
      await logClientError(error, {
        user_id: "test-user-123",
        session_id: "test-session-456",
        metadata: { test: true, operation: "client_error_test" },
      });
      addResult("Client error logged successfully");
    }
  };

  const testAsyncError = async () => {
    try {
      await new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Test async error - this is intentional")),
          100
        );
      });
    } catch (error) {
      await logClientError(error, {
        metadata: { test: true, operation: "async_error_test" },
      });
      addResult("Async error logged successfully");
    }
  };

  const testUnhandledError = () => {
    // This will trigger the global error handler
    setTimeout(() => {
      throw new Error("Test unhandled error - this is intentional");
    }, 100);
    addResult("Unhandled error triggered (check console)");
  };

  const testUnhandledRejection = () => {
    // This will trigger the global rejection handler
    Promise.reject(new Error("Test unhandled rejection - this is intentional"));
    addResult("Unhandled rejection triggered (check console)");
  };

  const testServerError = async () => {
    try {
      const response = await fetch("/api/test-error?fail=true");
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      addResult("Server error test completed");
    } catch (error) {
      await logClientError(error, {
        metadata: { test: true, operation: "server_error_test" },
      });
      addResult("Server error logged successfully");
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Error Logging Test Page</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Client-Side Error Tests
          </h2>
          <div className="space-y-2">
            <Button onClick={testClientError} className="w-full">
              Test Client Error
            </Button>
            <Button onClick={testAsyncError} className="w-full">
              Test Async Error
            </Button>
            <Button onClick={testUnhandledError} className="w-full">
              Test Unhandled Error
            </Button>
            <Button onClick={testUnhandledRejection} className="w-full">
              Test Unhandled Rejection
            </Button>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Server-Side Error Tests
          </h2>
          <div className="space-y-2">
            <Button onClick={testServerError} className="w-full">
              Test Server Error
            </Button>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Test Results</h2>
          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
        </div>

        {testResults.length === 0 ? (
          <p className="text-gray-500">
            No test results yet. Click a test button above.
          </p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div
                key={index}
                className="text-sm font-mono bg-gray-100 p-2 rounded"
              >
                {result}
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-4 mt-6">
        <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
        <div className="space-y-2 text-sm">
          <p>
            1. Click the test buttons above to generate various types of errors
          </p>
          <p>
            2. Navigate to{" "}
            <code className="bg-gray-100 px-1 rounded">/error-logs</code> to
            view the error dashboard
          </p>
          <p>3. Check the browser console for additional error details</p>
          <p>4. Errors are automatically logged to the Supabase database</p>
        </div>
      </Card>
    </div>
  );
}
