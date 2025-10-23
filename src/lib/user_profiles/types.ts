import { Tables } from "../types";

export type UserProfile = Tables["user_profiles"]["Row"];

export interface FindManyUserProfilesResult {
  success: boolean;
  data?: UserProfile[];
  error?: string;
  count?: number;
}

export interface FindOneUserProfileResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

export interface CreateUserProfileResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

export interface UpdateUserProfileResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

export interface DeleteUserProfileResult {
  success: boolean;
  data?: UserProfile;
  error?: string;
}
