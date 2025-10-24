export const APP_NAME = "NextJS Supabase Project Starter";
export const public_storage_buckets = {
  user_avatars: "user_avatars",
};
export const private_storage_buckets = {
  user_uploads: "user_uploads",
};

// Types
export type PUBLIC_STORAGE_BUCKETS = keyof typeof public_storage_buckets;
export type PRIVATE_STORAGE_BUCKETS = keyof typeof private_storage_buckets;
