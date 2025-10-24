"use server";

import { createClient } from "@/lib/supabase/server";
import { update_user_profile } from "@/lib/user_profiles";
import {
  IUploadAvatarResult,
  IDeleteAvatarResult,
  IUpdateAvatarResult,
} from "./types";

const AVATAR_BUCKET = "user_avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

async function file_from_form_data(
  form_data: FormData,
  field_name: string
): Promise<File | null> {
  const file = form_data.get(field_name);
  if (file instanceof File) {
    return file;
  }
  return null;
}

export async function upload_user_avatar(
  user_id: string,
  form_data: FormData
): Promise<IUploadAvatarResult> {
  const file = await file_from_form_data(form_data, "file");
  try {
    if (!file) {
      return {
        success: false,
        error: "No file provided",
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: "File size exceeds 5MB limit",
      };
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed",
      };
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user || authData.user.id !== user_id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const file_ext = file.name.split(".").pop();
    const file_name = `${user_id}/avatar.${file_ext}`;

    const { error: upload_error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .upload(file_name, file, {
        upsert: true,
        contentType: file.type,
      });

    if (upload_error) {
      console.error("Upload error:", upload_error);
      return {
        success: false,
        error: upload_error.message || "Failed to upload file",
      };
    }

    const { data: url_data } = supabase.storage
      .from(AVATAR_BUCKET)
      .getPublicUrl(file_name);

    const avatar_url = url_data.publicUrl;

    const update_result = await update_user_profile(
      { auth_user_id: user_id },
      { avatar_url }
    );

    if (!update_result.success) {
      return {
        success: false,
        error: update_result.error || "Failed to update profile",
      };
    }

    return {
      success: true,
      data: {
        avatar_url,
        path: file_name,
      },
    };
  } catch (error) {
    console.error("Error in upload_user_avatar:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function delete_user_avatar(
  user_id: string
): Promise<IDeleteAvatarResult> {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();

    if (!authData.user || authData.user.id !== user_id) {
      return {
        success: false,
        error: "Unauthorized",
      };
    }

    const { data: files, error: list_error } = await supabase.storage
      .from(AVATAR_BUCKET)
      .list(user_id);

    if (list_error) {
      console.error("List error:", list_error);
      return {
        success: false,
        error: list_error.message || "Failed to list files",
      };
    }

    if (files && files.length > 0) {
      const file_paths = files.map((file) => `${user_id}/${file.name}`);

      const { error: delete_error } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove(file_paths);

      if (delete_error) {
        console.error("Delete error:", delete_error);
        return {
          success: false,
          error: delete_error.message || "Failed to delete file",
        };
      }
    }

    const update_result = await update_user_profile(
      { auth_user_id: user_id },
      { avatar_url: null }
    );

    if (!update_result.success) {
      return {
        success: false,
        error: update_result.error || "Failed to update profile",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error in delete_user_avatar:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}

export async function update_user_avatar(
  user_id: string,
  form_data: FormData
): Promise<IUpdateAvatarResult> {
  try {
    const delete_result = await delete_user_avatar(user_id);

    if (!delete_result.success) {
      return {
        success: false,
        error: delete_result.error || "Failed to delete existing avatar",
      };
    }

    const upload_result = await upload_user_avatar(user_id, form_data);

    if (!upload_result.success) {
      return {
        success: false,
        error: upload_result.error || "Failed to upload new avatar",
      };
    }

    return {
      success: true,
      data: upload_result.data,
    };
  } catch (error) {
    console.error("Error in update_user_avatar:", error);
    return {
      success: false,
      error: "Internal server error",
    };
  }
}
