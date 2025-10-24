import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../supabase/types/database";
import { createClient } from "../supabase/client";
import { createClient as createServerClient } from "../supabase/server";
import {
  IErrorLogger,
  IErrorLog,
  IErrorLogInsert,
  IErrorLogUpdate,
  IErrorFilters,
  IErrorContext,
  IErrorDetails,
  ErrorSeverity,
  ErrorCategory,
  IErrorReportingConfig,
} from "./types";

type ErrorLogsTable = Database["public"]["Tables"]["error_logs"];

export class ErrorLogger implements IErrorLogger {
  private client: SupabaseClient<Database>;
  private config: IErrorReportingConfig;
  private errorQueue: IErrorLogInsert[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(
    client: SupabaseClient<Database>,
    config: Partial<IErrorReportingConfig> = {}
  ) {
    this.client = client;
    this.config = {
      enableClientLogging: true,
      enableServerLogging: true,
      enableConsoleLogging: true,
      enableDatabaseLogging: true,
      batchSize: 10,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      environment: process.env.NODE_ENV || "development",
      version: process.env.APP_VERSION,
      ...config,
    };

    this.startFlushTimer();
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flushQueue();
    }, this.config.flushInterval);
  }

  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private categorizeError(error: Error | unknown): ErrorCategory {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const name = error.name.toLowerCase();

      if (name.includes("auth") || message.includes("auth")) {
        return "authentication_error";
      }
      if (name.includes("validation") || message.includes("validation")) {
        return "validation_error";
      }
      if (
        name.includes("network") ||
        message.includes("network") ||
        message.includes("fetch")
      ) {
        return "network_error";
      }
      if (
        name.includes("database") ||
        message.includes("database") ||
        message.includes("sql")
      ) {
        return "database_error";
      }
    }

    // Check if we're on client side
    if (typeof window !== "undefined") {
      return "client_error";
    }

    return "server_error";
  }

  private determineSeverity(error: Error | unknown): ErrorSeverity {
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      const name = error.name.toLowerCase();

      // Critical errors
      if (
        name.includes("critical") ||
        message.includes("critical") ||
        message.includes("fatal") ||
        message.includes("security")
      ) {
        return "critical";
      }

      // High severity errors
      if (
        name.includes("error") ||
        message.includes("unauthorized") ||
        message.includes("forbidden") ||
        message.includes("not found")
      ) {
        return "high";
      }

      // Medium severity errors
      if (
        name.includes("warning") ||
        message.includes("warning") ||
        message.includes("timeout")
      ) {
        return "medium";
      }
    }

    return "low";
  }

  private extractErrorDetails(error: Error | unknown): IErrorDetails {
    if (error instanceof Error) {
      return {
        message: error.message,
        stack: error.stack,
        name: error.name,
        cause: error.cause,
        metadata: {
          constructor: error.constructor.name,
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

  private buildContext(context?: Partial<IErrorContext>): IErrorContext {
    const now = new Date().toISOString();
    const baseContext: IErrorContext = {
      timestamp: now,
      environment: this.config.environment,
      version: this.config.version,
    };

    // Add client-side context if available
    if (typeof window !== "undefined") {
      baseContext.url = window.location.href;
      baseContext.user_agent = navigator.userAgent;
    }

    return {
      ...baseContext,
      ...context,
    };
  }

  private async logToConsole(
    error: Error | unknown,
    context: IErrorContext
  ): Promise<void> {
    if (!this.config.enableConsoleLogging) return;

    const severity = this.determineSeverity(error);
    const category = this.categorizeError(error);
    const details = this.extractErrorDetails(error);

    const logData = {
      severity,
      category,
      context,
      details,
      timestamp: new Date().toISOString(),
    };

    switch (severity) {
      case "critical":
        console.error("🚨 CRITICAL ERROR:", logData);
        break;
      case "high":
        console.error("❌ HIGH ERROR:", logData);
        break;
      case "medium":
        console.warn("⚠️ MEDIUM ERROR:", logData);
        break;
      case "low":
        console.info("ℹ️ LOW ERROR:", logData);
        break;
    }
  }

  private async logToDatabase(errorLog: IErrorLogInsert): Promise<void> {
    if (!this.config.enableDatabaseLogging) return;

    try {
      const { error } = await this.client
        .from("error_logs")
        .insert(errorLog as never);

      if (error) {
        console.error("Failed to log error to database:", error);
      }
    } catch (dbError) {
      console.error("Database logging failed:", dbError);
    }
  }

  private async flushQueue(): Promise<void> {
    if (this.errorQueue.length === 0) return;

    const batch = this.errorQueue.splice(0, this.config.batchSize);

    try {
      const { error } = await this.client
        .from("error_logs")
        .insert(batch as never);

      if (error) {
        console.error("Failed to flush error queue:", error);
        // Re-queue the batch for retry
        this.errorQueue.unshift(...batch);
      }
    } catch (dbError) {
      console.error("Error queue flush failed:", dbError);
      // Re-queue the batch for retry
      this.errorQueue.unshift(...batch);
    }
  }

  async logError(
    error: Error | unknown,
    context?: Partial<IErrorContext>
  ): Promise<void> {
    const fullContext = this.buildContext(context);
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(error);
    const details = this.extractErrorDetails(error);

    const errorLog: IErrorLogInsert = {
      severity,
      category,
      context: fullContext,
      details,
      resolved: false,
    };

    // Log to console immediately
    await this.logToConsole(error, fullContext);

    // Add to queue for database logging
    if (this.config.enableDatabaseLogging) {
      this.errorQueue.push(errorLog);

      // Flush immediately if queue is full
      if (this.errorQueue.length >= this.config.batchSize) {
        await this.flushQueue();
      }
    }
  }

  async logClientError(
    error: Error | unknown,
    context?: Partial<IErrorContext>
  ): Promise<void> {
    const clientContext = {
      ...context,
      url: typeof window !== "undefined" ? window.location.href : undefined,
      user_agent:
        typeof window !== "undefined" ? navigator.userAgent : undefined,
    };

    await this.logError(error, clientContext);
  }

  async logServerError(
    error: Error | unknown,
    context?: Partial<IErrorContext>
  ): Promise<void> {
    const serverContext = {
      ...context,
      environment: this.config.environment,
    };

    await this.logError(error, serverContext);
  }

  async markErrorResolved(errorId: string): Promise<void> {
    try {
      const updateData: IErrorLogUpdate = {
        resolved: true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await this.client
        .from("error_logs")
        .update(updateData as never)
        .eq("id", errorId);

      if (error) {
        console.error("Failed to mark error as resolved:", error);
        throw new Error(`Failed to mark error ${errorId} as resolved`);
      }
    } catch (dbError) {
      console.error("Error marking as resolved:", dbError);
      throw dbError;
    }
  }

  async getErrors(filters?: IErrorFilters): Promise<IErrorLog[]> {
    try {
      let query = this.client.from("error_logs").select("*");

      if (filters?.severity && filters.severity.length > 0) {
        query = query.in("severity", filters.severity);
      }

      if (filters?.category && filters.category.length > 0) {
        query = query.in("category", filters.category);
      }

      if (filters?.resolved !== undefined) {
        query = query.eq("resolved", filters.resolved);
      }

      if (filters?.user_id) {
        query = query.eq("user_id", filters.user_id);
      }

      if (filters?.date_from) {
        query = query.gte("created_at", filters.date_from);
      }

      if (filters?.date_to) {
        query = query.lte("created_at", filters.date_to);
      }

      query = query.order("created_at", { ascending: false });

      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      if (filters?.offset) {
        query = query.range(
          filters.offset,
          filters.offset + (filters.limit || 50) - 1
        );
      }

      const { data, error } = await query;

      if (error) {
        console.error("Failed to fetch errors:", error);
        throw new Error("Failed to fetch errors");
      }

      return (data as ErrorLogsTable["Row"][]) || [];
    } catch (dbError) {
      console.error("Error fetching errors:", dbError);
      throw dbError;
    }
  }

  destroy(): void {
    this.stopFlushTimer();
    // Flush any remaining errors
    this.flushQueue();
  }
}

// Factory functions
export function createErrorLogger(
  config?: Partial<IErrorReportingConfig>
): ErrorLogger {
  const client = createClient();
  return new ErrorLogger(client, config);
}

export async function createServerErrorLogger(
  config?: Partial<IErrorReportingConfig>
): Promise<ErrorLogger> {
  const client = await createServerClient();
  return new ErrorLogger(client, config);
}

// Global error logger instance (singleton pattern)
let globalErrorLogger: ErrorLogger | null = null;

export function getGlobalErrorLogger(): ErrorLogger {
  if (!globalErrorLogger) {
    globalErrorLogger = createErrorLogger();
  }
  return globalErrorLogger;
}

export function getServerErrorLogger(): Promise<ErrorLogger> {
  return createServerErrorLogger();
}
