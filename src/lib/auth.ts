import { createServerAuthService } from "./auth/service";
import { UserProfile, IUserProfileWithInitials } from "./user_profiles/types";

export async function getCurrentUser(): Promise<IUserProfileWithInitials | null> {
  const auth_service = await createServerAuthService();
  const result = await auth_service.get_current_user();

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export async function getUserProfile(
  userId: string
): Promise<UserProfile | null> {
  const auth_service = await createServerAuthService();
  const result = await auth_service.get_user_profile(userId);

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  const auth_service = await createServerAuthService();
  return auth_service.check_email_exists(email);
}

export async function updateUserProfile(
  userId: string,
  updates: { first_name?: string; last_name?: string }
): Promise<UserProfile | null> {
  const auth_service = await createServerAuthService();
  const result = await auth_service.update_user_profile(userId, updates);

  if (result.error || !result.data) {
    return null;
  }

  return result.data;
}

export async function signOut() {
  const auth_service = await createServerAuthService();
  await auth_service.sign_out();
}
