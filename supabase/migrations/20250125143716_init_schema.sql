-- =====================================================
-- Supabase Next.js Starter - Complete Schema Migration
-- Date: 2025-01-25 14:37:16
-- Description: Complete database schema for user profiles and error logging
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
-- ERROR LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'client_error', 'server_error', 'database_error', 
    'authentication_error', 'validation_error', 'network_error', 'unknown_error'
  )),
  
  -- Context information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  request_id VARCHAR(255),
  url TEXT,
  method VARCHAR(10),
  user_agent TEXT,
  ip_address INET,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  environment VARCHAR(50) NOT NULL DEFAULT 'development',
  version VARCHAR(50),
  
  -- Error details
  message TEXT NOT NULL,
  stack TEXT,
  code VARCHAR(50),
  name VARCHAR(100),
  cause JSONB,
  metadata JSONB,
  
  -- Status
  resolved BOOLEAN NOT NULL DEFAULT FALSE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Error logs indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_category ON error_logs(category);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_id ON error_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_environment ON error_logs(environment);
CREATE INDEX IF NOT EXISTS idx_error_logs_session_id ON error_logs(session_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_error_logs_severity_category ON error_logs(severity, category);
CREATE INDEX IF NOT EXISTS idx_error_logs_user_resolved ON error_logs(user_id, resolved);

-- Enable Row Level Security for error logs
ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

-- Error logs RLS policies
CREATE POLICY "Users can read their own error logs" ON error_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can read all error logs" ON error_logs
  FOR SELECT USING (auth.role() = 'service_role');

CREATE POLICY "Service role can insert error logs" ON error_logs
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can update error logs" ON error_logs
  FOR UPDATE USING (auth.role() = 'service_role');

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

-- Function to automatically update updated_at timestamp for error logs
CREATE OR REPLACE FUNCTION update_error_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old error logs (optional, for maintenance)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete error logs older than 90 days that are resolved
  DELETE FROM error_logs 
  WHERE created_at < NOW() - INTERVAL '90 days' 
    AND resolved = TRUE;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger to automatically create user profile when new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger to automatically update updated_at for error logs
CREATE TRIGGER trigger_update_error_logs_updated_at
  BEFORE UPDATE ON error_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_error_logs_updated_at();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for error statistics (useful for dashboards)
CREATE OR REPLACE VIEW error_logs_stats AS
SELECT 
  DATE_TRUNC('day', created_at) as date,
  environment,
  severity,
  category,
  COUNT(*) as error_count,
  COUNT(CASE WHEN resolved = TRUE THEN 1 END) as resolved_count,
  COUNT(CASE WHEN resolved = FALSE THEN 1 END) as unresolved_count
FROM error_logs
GROUP BY DATE_TRUNC('day', created_at), environment, severity, category
ORDER BY date DESC, severity DESC;

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

-- Error logs view permissions
GRANT SELECT ON error_logs_stats TO authenticated;
GRANT SELECT ON error_logs_stats TO service_role;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
