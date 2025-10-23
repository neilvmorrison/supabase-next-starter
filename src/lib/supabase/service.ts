import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Tables } from "./types/database";
import { createClient } from "./client";
import { createClient as createServerClient } from "./server";

type TableName = keyof Database["public"]["Tables"];

// Helper type for Supabase error objects
interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
}

export interface DatabaseError {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: {
    column: string;
    ascending?: boolean;
  };
}

export interface QueryResult<T> {
  data: T[] | null;
  error: DatabaseError | null;
  count?: number;
}

export class DatabaseService {
  private client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database>) {
    this.client = client;
  }

  private handleError(error: unknown): DatabaseError {
    const err = error as SupabaseError;

    if (err?.code === "PGRST116") {
      return {
        message: "No rows found",
        code: err.code,
        details: "The requested record does not exist",
      };
    }

    if (err?.code === "23505") {
      return {
        message: "Duplicate entry",
        code: err.code,
        details: "A record with this information already exists",
        hint: "Check for unique constraints",
      };
    }

    if (err?.code === "23503") {
      return {
        message: "Foreign key constraint violation",
        code: err.code,
        details: "Referenced record does not exist",
        hint: "Ensure the referenced record exists before creating this one",
      };
    }

    if (err?.code === "23502") {
      return {
        message: "Required field missing",
        code: err.code,
        details: "A required field is null or empty",
        hint: "Check that all required fields are provided",
      };
    }

    if (err?.code === "42501") {
      return {
        message: "Insufficient permissions",
        code: err.code,
        details: "You don't have permission to perform this action",
        hint: "Check your authentication status and permissions",
      };
    }

    return {
      message: err?.message || "An unexpected error occurred",
      code: err?.code,
      details: err?.details,
      hint: err?.hint,
    };
  }

  async findMany<T extends TableName>(
    table: T,
    options?: QueryOptions
  ): Promise<QueryResult<Tables<T>>> {
    try {
      let query = this.client.from(table).select("*");

      if (options?.orderBy) {
        query = query.order(options.orderBy.column, {
          ascending: options.orderBy.ascending ?? true,
        });
      }

      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(
          options.offset,
          options.offset + (options.limit || 10) - 1
        );
      }

      const { data, error, count } = await query;

      if (error) {
        return { data: null, error: this.handleError(error) };
      }

      return {
        data: data as Tables<T>[],
        error: null,
        count: count || undefined,
      };
    } catch (error) {
      return { data: null, error: this.handleError(error) };
    }
  }
}

export function createDatabaseService(): DatabaseService {
  const client = createClient();
  return new DatabaseService(client);
}

export async function createServerDatabaseService(): Promise<DatabaseService> {
  const client = await createServerClient();
  return new DatabaseService(client);
}
