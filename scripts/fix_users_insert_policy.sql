-- Fix RLS Policy to Allow Service Role Inserts
-- This allows the service role key to insert user profiles during signup
-- Run this in Supabase SQL Editor

-- Drop existing INSERT policy if it exists
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Service role can insert users" ON users;
DROP POLICY IF EXISTS "Allow user profile inserts" ON users;

-- Policy: Allow inserts when id matches auth.uid() OR when auth.uid() is NULL
-- When using service role key, auth.uid() is typically NULL, so we allow it
-- When a user inserts their own profile, id = auth.uid(), so we allow it
CREATE POLICY "Allow user profile inserts" ON users
  FOR INSERT
  WITH CHECK (
    -- Allow if user is inserting their own profile
    id = auth.uid()
    OR
    -- Allow if auth.uid() is NULL (service role context)
    auth.uid() IS NULL
  );

