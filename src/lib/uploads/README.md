# Avatar Upload Functionality

This module provides server-side functions for managing user avatar uploads in Supabase Storage.

## Server Actions

### `upload_user_avatar(user_id: string, form_data: FormData)`

Uploads a new avatar for a user. Creates or replaces the existing avatar.

**Validation:**

- File size limit: 5MB
- Allowed formats: JPEG, JPG, PNG, GIF, WebP
- User authentication required

**Returns:** `IUploadAvatarResult`

### `delete_user_avatar(user_id: string)`

Deletes a user's avatar from storage and updates the profile.

**Returns:** `IDeleteAvatarResult`

### `update_user_avatar(user_id: string, form_data: FormData)`

Updates an existing avatar (deletes old, uploads new).

**Returns:** `IUpdateAvatarResult`

## Storage Configuration

- Bucket: `user_avatars`
- Folder structure: `{user_id}/avatar.{ext}`
- Public access: Yes
- RLS policies: Users can only manage their own avatars

## Usage

See `AvatarUploadButton` and `AvatarUploadWrapper` components for client-side implementation.
