-- =====================================================
-- Supabase Next.js Starter - Complete Schema Migration
-- Date: 2025-01-25 14:37:16
-- Description: Complete database schema for user profiles
-- =====================================================

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "created_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    "deleted_at" TIMESTAMP WITHOUT TIME ZONE,
    "first_name" TEXT,
    "last_name" TEXT,
    "middle_name" TEXT,
    "email" TEXT NOT NULL,
    "auth_user_id" UUID,
    "avatar_url" TEXT,
    "avatar_color" TEXT
);

-- User profiles indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_auth_user_id ON public.user_profiles USING btree (auth_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles USING btree (email);
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_email_key ON public.user_profiles USING btree (email);
CREATE UNIQUE INDEX IF NOT EXISTS user_profiles_pkey ON public.user_profiles USING btree (id);

-- User profiles constraints
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY USING INDEX "user_profiles_pkey";
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE NOT VALID;
ALTER TABLE "public"."user_profiles" VALIDATE CONSTRAINT "user_profiles_auth_user_id_fkey";
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_email_key" UNIQUE USING INDEX "user_profiles_email_key";

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.user_profiles (auth_user_id, first_name, last_name, email, avatar_color)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    NEW.email,
    (ARRAY[
      'orange', 
      'amber',  
      'yellow',  
      'lime',  
      'green',  
      'emerald',  
      'teal',  
      'cyan',  
      'sky',  
      'blue',  
      'indigo',  
      'violet',  
      'purple',  
      'fuchsia',  
      'pink',  
      'rose'   
    ])[floor(random() * 16) + 1]
  );
  RETURN NEW;
END;
$function$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to automatically create user profile when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- User profiles permissions
GRANT DELETE ON TABLE "public"."user_profiles" TO "anon";
GRANT INSERT ON TABLE "public"."user_profiles" TO "anon";
GRANT REFERENCES ON TABLE "public"."user_profiles" TO "anon";
GRANT SELECT ON TABLE "public"."user_profiles" TO "anon";
GRANT TRIGGER ON TABLE "public"."user_profiles" TO "anon";
GRANT TRUNCATE ON TABLE "public"."user_profiles" TO "anon";
GRANT UPDATE ON TABLE "public"."user_profiles" TO "anon";

GRANT DELETE ON TABLE "public"."user_profiles" TO "authenticated";
GRANT INSERT ON TABLE "public"."user_profiles" TO "authenticated";
GRANT REFERENCES ON TABLE "public"."user_profiles" TO "authenticated";
GRANT SELECT ON TABLE "public"."user_profiles" TO "authenticated";
GRANT TRIGGER ON TABLE "public"."user_profiles" TO "authenticated";
GRANT TRUNCATE ON TABLE "public"."user_profiles" TO "authenticated";
GRANT UPDATE ON TABLE "public"."user_profiles" TO "authenticated";

GRANT DELETE ON TABLE "public"."user_profiles" TO "service_role";
GRANT INSERT ON TABLE "public"."user_profiles" TO "service_role";
GRANT REFERENCES ON TABLE "public"."user_profiles" TO "service_role";
GRANT SELECT ON TABLE "public"."user_profiles" TO "service_role";
GRANT TRIGGER ON TABLE "public"."user_profiles" TO "service_role";
GRANT TRUNCATE ON TABLE "public"."user_profiles" TO "service_role";
GRANT UPDATE ON TABLE "public"."user_profiles" TO "service_role";

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- Create user_avatars bucket (public, readable by all authenticated users)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user_avatars',
  'user_avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create user_uploads bucket (private, users only access their own folder)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'user_uploads',
  'user_uploads',
  false,
  52428800 -- 50MB limit
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STORAGE POLICIES - user_avatars
-- =====================================================

-- Allow authenticated users to read all avatars
CREATE POLICY "Authenticated users can view all avatars"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user_avatars');

-- Allow authenticated users to upload their own avatar
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user_avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- STORAGE POLICIES - user_uploads
-- =====================================================

-- Allow users to read their own files
CREATE POLICY "Users can view their own uploads"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user_uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload to their own folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user_uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own uploads"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'user_uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'user_uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own uploads"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user_uploads' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
