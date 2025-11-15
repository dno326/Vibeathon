-- Fix Infinite Recursion in class_members RLS Policy
-- The issue: The SELECT policy on class_members queries class_members itself, causing infinite recursion
-- Run this in Supabase SQL Editor

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view class members" ON class_members;

-- Create a fixed policy that avoids recursion
-- Users can view class_members if:
-- 1. They are the user_id in the row (they can see their own memberships)
-- 2. They own the class (they can see all members of classes they own)
-- 3. Service role (bypass RLS)
-- This avoids recursion by NOT querying class_members within the policy
CREATE POLICY "Users can view class members" ON class_members
  FOR SELECT USING (
    user_id = auth.uid()  -- Users can see their own memberships
    OR EXISTS (
      SELECT 1 FROM classes c
      WHERE c.id = class_members.class_id
      AND c.owner_id = auth.uid()  -- Class owners can see all members
    )
    OR auth.uid() IS NULL  -- Allow service role (bypass RLS)
  );

-- Also ensure INSERT policy allows service role
DROP POLICY IF EXISTS "Users can join classes" ON class_members;
DROP POLICY IF EXISTS "Service role can insert class members" ON class_members;

-- Allow users to insert themselves as members
CREATE POLICY "Users can join classes" ON class_members
  FOR INSERT
  WITH CHECK (user_id = auth.uid() OR auth.uid() IS NULL);

-- Also fix the classes SELECT policy to allow service role
DROP POLICY IF EXISTS "Class members can view classes" ON classes;

CREATE POLICY "Class members can view classes" ON classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_members
      WHERE class_members.class_id = classes.id
      AND class_members.user_id = auth.uid()
    )
    OR owner_id = auth.uid()
    OR auth.uid() IS NULL  -- Allow service role
  );

-- Fix INSERT policy for classes to allow service role
DROP POLICY IF EXISTS "Users can create classes" ON classes;

CREATE POLICY "Users can create classes" ON classes
  FOR INSERT
  WITH CHECK (owner_id = auth.uid() OR auth.uid() IS NULL);

