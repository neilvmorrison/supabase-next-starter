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
ALTER TABLE "public"."user_profiles" ADD CONSTRAINT "user_profiles_auth_user_id_fkey" FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) NOT VALID;
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
-- MIGRATION COMPLETE
-- =====================================================
