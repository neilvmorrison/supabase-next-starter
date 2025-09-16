"use client";

import { createClient } from "./supabase/client";

export interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  created_at: string;
  updated_at: string;
}

export async function signInWithMagicLink(
  email: string
): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/authentication/confirm`,
    },
  });

  return { error };
}

export async function updateUserProfile(
  userId: string,
  updates: { first_name?: string; last_name?: string }
): Promise<UserProfile | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

export async function signOut(): Promise<{ error: Error | null }> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  return { error };
}
