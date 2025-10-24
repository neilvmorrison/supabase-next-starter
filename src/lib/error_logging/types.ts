export type ErrorSeverity = "low" | "medium" | "high" | "critical";

export type ErrorCategory =
  | "client_error"
  | "server_error"
  | "database_error"
  | "authentication_error"
  | "validation_error"
  | "network_error"
  | "unknown_error";

export interface IErrorContext {
  user_id?: string;
  session_id?: string;
  request_id?: string;
  url?: string;
  method?: string;
  user_agent?: string;
  ip_address?: string;
  timestamp: string;
  environment: string;
  version?: string;
  metadata?: Record<string, unknown>;
}

export interface IErrorDetails {
  message: string;
  stack?: string;
  code?: string | number;
  name?: string;
  cause?: unknown;
  metadata?: Record<string, unknown>;
}

export interface IErrorLog {
  id?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: IErrorContext;
  details: IErrorDetails;
  resolved: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface IErrorLogInsert {
  severity: ErrorSeverity;
  category: ErrorCategory;
  context: IErrorContext;
  details: IErrorDetails;
  resolved?: boolean;
}

export interface IErrorLogUpdate {
  resolved?: boolean;
  updated_at?: string;
}

export interface IErrorLogger {
  logError(
    error: Error | unknown,
    context?: Partial<IErrorContext>
  ): Promise<void>;
  logClientError(
    error: Error | unknown,
    context?: Partial<IErrorContext>
  ): Promise<void>;
  logServerError(
    error: Error | unknown,
    context?: Partial<IErrorContext>
  ): Promise<void>;
  markErrorResolved(errorId: string): Promise<void>;
  getErrors(filters?: IErrorFilters): Promise<IErrorLog[]>;
}

export interface IErrorFilters {
  severity?: ErrorSeverity[];
  category?: ErrorCategory[];
  resolved?: boolean;
  user_id?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export interface IErrorReportingConfig {
  enableClientLogging: boolean;
  enableServerLogging: boolean;
  enableConsoleLogging: boolean;
  enableDatabaseLogging: boolean;
  batchSize: number;
  flushInterval: number;
  maxRetries: number;
  environment: string;
  version?: string;
}
