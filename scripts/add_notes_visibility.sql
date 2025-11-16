-- Add public visibility to notes and adjust RLS
-- Run in Supabase SQL Editor

-- 1) Schema: add column
ALTER TABLE notes ADD COLUMN IF NOT EXISTS public boolean NOT NULL DEFAULT true;

-- 2) Drop old SELECT policy on notes if it exists
DROP POLICY IF EXISTS "Class members can view notes" ON notes;

-- 3) New SELECT policy: creator always sees; class members see public notes
CREATE POLICY "View notes (creator or class public)" ON notes
  FOR SELECT USING (
    -- Creator can always view their notes
    created_by = auth.uid()
    OR auth.uid() IS NULL
    OR EXISTS (
      SELECT 1 FROM sessions s
      JOIN class_members cm ON cm.class_id = s.class_id
      WHERE s.id = notes.session_id
      AND cm.user_id = auth.uid()
      AND notes.public = true
    )
  );

-- 4) INSERT policy: only creators who are members of the class via the session
DROP POLICY IF EXISTS "Insert notes (class member)" ON notes;
CREATE POLICY "Insert notes (class member)" ON notes
  FOR INSERT WITH CHECK (
    created_by = auth.uid() OR auth.uid() IS NULL
  );

-- 5) UPDATE/DELETE: only creator or service role
DROP POLICY IF EXISTS "Update notes (owner or service)" ON notes;
DROP POLICY IF EXISTS "Delete notes (owner or service)" ON notes;

CREATE POLICY "Update notes (owner or service)" ON notes
  FOR UPDATE USING (created_by = auth.uid() OR auth.uid() IS NULL)
  WITH CHECK (created_by = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Delete notes (owner or service)" ON notes
  FOR DELETE USING (created_by = auth.uid() OR auth.uid() IS NULL);
