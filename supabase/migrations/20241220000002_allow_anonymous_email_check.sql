-- Allow anonymous users to check if an email exists in user_profiles
-- This is needed for the login form to work properly

CREATE POLICY "Allow anonymous email check" ON public.user_profiles
  FOR SELECT USING (true);
