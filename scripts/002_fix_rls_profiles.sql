-- Drop existing problematic policies
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_public" ON public.profiles;

-- Add new policies that allow profile creation during signup (unauthenticated)
-- Allow reading all profiles (for listing owners/finders)
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

-- Allow users to insert their own profile (can be done anytime)
CREATE POLICY "profiles_insert_auth" ON public.profiles FOR INSERT WITH CHECK (
  auth.uid() = id OR auth.jwt() ->> 'email' = email
);

-- Allow users to update their own profile
CREATE POLICY "profiles_update_self" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "profiles_delete_self" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
