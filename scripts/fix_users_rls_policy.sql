-- Fix RLS Policy for Users Table
-- This allows users to insert their own profile during signup
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist (optional, for clean slate)
DROP POLICY IF EXISTS "Users can insert own profile" ON users;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;

-- Policy: Users can insert their own profile (id must match auth.uid())
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT
  USING (id = auth.uid());

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Note: The trigger function handle_new_user() uses SECURITY DEFINER
-- which bypasses RLS, so it can insert without these policies.
-- However, if the trigger fails or we manually insert, these policies are needed.

