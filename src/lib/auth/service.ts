import { SupabaseClient, User } from "@supabase/supabase-js";
import { Database } from "../supabase/types/database";
import { UserProfile } from "../user_profiles/types";
import {
  find_one_user_profile,
  update_user_profile as update_user_profile_db,
} from "../user_profiles";
import { createDatabaseService } from "../supabase/service";
import { createClient } from "../supabase/client";
import { createClient as createServerClient } from "../supabase/server";

interface AuthError {
  message: string;
  code?: string;
}

export interface AuthResult<T = void> {
  data?: T;
  error: AuthError | null;
}

export interface SignInOptions {
  first_name?: string;
  last_name?: string;
}

export class AuthService {
  private client: SupabaseClient<Database>;
  private is_server: boolean;

  constructor(client: SupabaseClient<Database>, is_server: boolean = false) {
    this.client = client;
    this.is_server = is_server;
  }

  private handleError(error: unknown): AuthError {
    if (error && typeof error === "object" && "message" in error) {
      return {
        message: (error as Error).message,
        code: "code" in error ? (error as { code?: string }).code : undefined,
      };
    }
    return {
      message: "An unexpected error occurred",
    };
  }

  async get_current_user(): Promise<AuthResult<UserProfile>> {
    try {
      const {
        data: { user },
        error: auth_error,
      } = await this.client.auth.getUser();

      if (auth_error) {
        return { error: this.handleError(auth_error) };
      }

      if (!user) {
        return { error: { message: "User not authenticated" } };
      }

      if (this.is_server) {
        const result = await find_one_user_profile({ auth_user_id: user.id });

        if (!result.success || !result.data) {
          return {
            error: {
              message: result.error || "User profile not found",
            },
          };
        }

        return { data: result.data, error: null };
      } else {
        const db = createDatabaseService();
        const result = await db.findOne("user_profiles", {
          auth_user_id: user.id,
        });

        if (result.error || !result.data) {
          return {
            error: {
              message: result.error?.message || "User profile not found",
            },
          };
        }

        return { data: result.data, error: null };
      }
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async get_user_profile(user_id: string): Promise<AuthResult<UserProfile>> {
    try {
      if (this.is_server) {
        const result = await find_one_user_profile({ id: user_id });

        if (!result.success || !result.data) {
          return {
            error: {
              message: result.error || "User profile not found",
            },
          };
        }

        return { data: result.data, error: null };
      } else {
        const db = createDatabaseService();
        const result = await db.findOne("user_profiles", { id: user_id });

        if (result.error || !result.data) {
          return {
            error: {
              message: result.error?.message || "User profile not found",
            },
          };
        }

        return { data: result.data, error: null };
      }
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async check_email_exists(email: string): Promise<boolean> {
    try {
      if (this.is_server) {
        const result = await find_one_user_profile({ email });
        return result.success && !!result.data;
      } else {
        const db = createDatabaseService();
        const result = await db.findOne("user_profiles", { email });
        return !result.error && !!result.data;
      }
    } catch {
      return false;
    }
  }

  async update_user_profile(
    user_id: string,
    updates: { first_name?: string; last_name?: string }
  ): Promise<AuthResult<UserProfile>> {
    try {
      if (this.is_server) {
        const result = await update_user_profile_db({ id: user_id }, updates);

        if (!result.success || !result.data) {
          return {
            error: {
              message: result.error || "Failed to update user profile",
            },
          };
        }

        return { data: result.data, error: null };
      } else {
        const db = createDatabaseService();
        const result = await db.update(
          "user_profiles",
          { id: user_id },
          updates
        );

        if (result.error || !result.data) {
          return {
            error: {
              message: result.error?.message || "Failed to update user profile",
            },
          };
        }

        return { data: result.data, error: null };
      }
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async sign_in_with_magic_link(
    email: string,
    options?: SignInOptions
  ): Promise<AuthResult> {
    try {
      const auth_options: { emailRedirectTo: string; data?: object } = {
        emailRedirectTo:
          typeof window !== "undefined"
            ? `${window.location.origin}/authentication/confirm`
            : "/authentication/confirm",
      };

      if (options?.first_name || options?.last_name) {
        auth_options.data = {
          first_name: options.first_name,
          last_name: options.last_name,
        };
      }

      const { error } = await this.client.auth.signInWithOtp({
        email,
        options: auth_options,
      });

      if (error) {
        return { error: this.handleError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async sign_out(): Promise<AuthResult> {
    try {
      const { error } = await this.client.auth.signOut();

      if (error) {
        return { error: this.handleError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }

  async get_auth_user(): Promise<AuthResult<User>> {
    try {
      const {
        data: { user },
        error,
      } = await this.client.auth.getUser();

      if (error) {
        return { error: this.handleError(error) };
      }

      if (!user) {
        return { error: { message: "User not authenticated" } };
      }

      return { data: user, error: null };
    } catch (error) {
      return { error: this.handleError(error) };
    }
  }
}

export function createAuthService(): AuthService {
  const client = createClient();
  return new AuthService(client, false);
}

export async function createServerAuthService(): Promise<AuthService> {
  const client = await createServerClient();
  return new AuthService(client, true);
}
