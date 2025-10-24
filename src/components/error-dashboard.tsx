"use client";

import { useState, useEffect } from "react";
import { useErrorLogger } from "@/hooks";
import {
  IErrorLog,
  ErrorSeverity,
  ErrorCategory,
} from "@/lib/error_logging/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ErrorDashboard() {
  const { getErrors, markErrorResolved } = useErrorLogger();
  const [errors, setErrors] = useState<IErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<{
    severity?: ErrorSeverity[];
    resolved?: boolean;
  }>({});

  const loadErrors = async () => {
    setLoading(true);
    try {
      const errorList = await getErrors({
        ...filter,
        limit: 50,
      });
      setErrors(errorList);
    } catch (error) {
      console.error("Failed to load errors:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
  }, [filter]);

  const handleMarkResolved = async (errorId: string) => {
    try {
      await markErrorResolved(errorId);
      await loadErrors(); // Reload the list
    } catch (error) {
      console.error("Failed to mark error as resolved:", error);
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case "critical":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getCategoryColor = (category: ErrorCategory) => {
    switch (category) {
      case "client_error":
        return "bg-purple-100 text-purple-800";
      case "server_error":
        return "bg-red-100 text-red-800";
      case "database_error":
        return "bg-blue-100 text-blue-800";
      case "authentication_error":
        return "bg-yellow-100 text-yellow-800";
      case "validation_error":
        return "bg-green-100 text-green-800";
      case "network_error":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Error Dashboard</h1>
        <div className="flex gap-2">
          <Button
            variant={filter.resolved === undefined ? "default" : "outline"}
            onClick={() => setFilter({ ...filter, resolved: undefined })}
          >
            All
          </Button>
          <Button
            variant={filter.resolved === false ? "default" : "outline"}
            onClick={() => setFilter({ ...filter, resolved: false })}
          >
            Unresolved
          </Button>
          <Button
            variant={filter.resolved === true ? "default" : "outline"}
            onClick={() => setFilter({ ...filter, resolved: true })}
          >
            Resolved
          </Button>
        </div>
      </div>

      {errors.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No errors found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {errors.map((error) => (
            <Card key={error.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${getSeverityColor(error.severity)} text-white`}
                  >
                    {error.severity}
                  </Badge>
                  <Badge className={getCategoryColor(error.category)}>
                    {error.category}
                  </Badge>
                  {error.resolved && (
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-600"
                    >
                      Resolved
                    </Badge>
                  )}
                </div>
                {!error.resolved && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => error.id && handleMarkResolved(error.id)}
                  >
                    Mark Resolved
                  </Button>
                )}
              </div>

              <h3 className="font-semibold text-lg mb-2">
                {error.details.message}
              </h3>

              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Time:</strong>{" "}
                  {new Date(error.context.timestamp).toLocaleString()}
                </p>
                <p>
                  <strong>Environment:</strong> {error.context.environment}
                </p>
                {error.context.url && (
                  <p>
                    <strong>URL:</strong> {error.context.url}
                  </p>
                )}
                {error.context.user_id && (
                  <p>
                    <strong>User ID:</strong> {error.context.user_id}
                  </p>
                )}
                {error.details.code && (
                  <p>
                    <strong>Code:</strong> {error.details.code}
                  </p>
                )}
              </div>

              {error.details.stack && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm font-medium">
                    Stack Trace
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                    {error.details.stack}
                  </pre>
                </details>
              )}

              {error.details.metadata &&
                Object.keys(error.details.metadata).length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-medium">
                      Metadata
                    </summary>
                    <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                      {JSON.stringify(error.details.metadata, null, 2)}
                    </pre>
                  </details>
                )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
