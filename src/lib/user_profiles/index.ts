"use server";

import { createServerDatabaseService } from "@/lib/supabase/service";
import { QueryOptions, WhereClause } from "@/lib/supabase/service";
import { TablesInsert, TablesUpdate } from "@/lib/supabase/types/database";
import {
  CreateUserProfileResult,
  DeleteUserProfileResult,
  FindManyUserProfilesResult,
  FindOneUserProfileResult,
  UpdateUserProfileResult,
  UserProfile,
} from "./types";

export async function find_many_user_profiles(
  where?: WhereClause<"user_profiles">,
  options?: QueryOptions
): Promise<FindManyUserProfilesResult> {
  try {
    const db = await createServerDatabaseService();
    const result = await db.findMany("user_profiles", where, options);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data || [],
      count: result.count,
    };
  } catch (error) {
    console.error("Error in find_many_user_profiles:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function find_one_user_profile(
  where: WhereClause<"user_profiles">
): Promise<FindOneUserProfileResult> {
  try {
    const db = await createServerDatabaseService();
    const result = await db.findOne("user_profiles", where);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data || undefined,
    };
  } catch (error) {
    console.error("Error in find_one_user_profile:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function find_one_user_profile_or_throw(
  where: WhereClause<"user_profiles">
): Promise<UserProfile> {
  const db = await createServerDatabaseService();
  return db.findOneOrThrow("user_profiles", where);
}

export async function create_user_profile(
  data: TablesInsert<"user_profiles">
): Promise<CreateUserProfileResult> {
  try {
    const db = await createServerDatabaseService();
    const result = await db.create("user_profiles", data);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data || undefined,
    };
  } catch (error) {
    console.error("Error in create_user_profile:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function update_user_profile(
  where: WhereClause<"user_profiles">,
  data: TablesUpdate<"user_profiles">
): Promise<UpdateUserProfileResult> {
  try {
    const db = await createServerDatabaseService();
    const result = await db.update("user_profiles", where, data);

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data || undefined,
    };
  } catch (error) {
    console.error("Error in update_user_profile:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function delete_user_profile(
  where: WhereClause<"user_profiles">,
  soft: boolean = true
): Promise<DeleteUserProfileResult> {
  try {
    const db = await createServerDatabaseService();
    const result = await db.delete("user_profiles", where, { soft });

    if (result.error) {
      return {
        success: false,
        error: result.error.message,
      };
    }

    return {
      success: true,
      data: result.data || undefined,
    };
  } catch (error) {
    console.error("Error in delete_user_profile:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
