-- Fix RLS Policies for Classes and Class Members Tables
-- This allows service role to create classes and add members
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create classes" ON classes;
DROP POLICY IF EXISTS "Users can join classes" ON class_members;

-- Policy: Allow users to create classes (they become the owner)
CREATE POLICY "Users can create classes" ON classes
  FOR INSERT
  WITH CHECK (owner_id = auth.uid() OR auth.uid() IS NULL);

-- Policy: Allow users to join classes (insert into class_members)
CREATE POLICY "Users can join classes" ON class_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

-- Note: Service role key (auth.uid() IS NULL) should bypass RLS,
-- but these policies ensure it works even if there are issues with service role detection.

