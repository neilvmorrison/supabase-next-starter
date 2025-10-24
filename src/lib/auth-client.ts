"use client";

import { createAuthService } from "./auth/service";
import { Tables } from "./supabase/types/database";

export type UserProfile = Tables<"user_profiles">;

export async function signInWithMagicLink(
  email: string,
  userData?: { first_name?: string; last_name?: string }
): Promise<{ error: Error | null }> {
  const auth_service = createAuthService();
  const result = await auth_service.sign_in_with_magic_link(email, userData);

  return { error: result.error ? new Error(result.error.message) : null };
}

export async function updateUserProfile(
  userId: string,
  updates: { first_name?: string; last_name?: string }
): Promise<UserProfile | null> {
  const auth_service = createAuthService();
  const result = await auth_service.update_user_profile(userId, updates);

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export async function signOut(): Promise<{ error: Error | null }> {
  const auth_service = createAuthService();
  const result = await auth_service.sign_out();

  return { error: result.error ? new Error(result.error.message) : null };
}
