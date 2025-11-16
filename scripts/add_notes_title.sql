-- Add title to notes for user-provided note titles
ALTER TABLE notes ADD COLUMN IF NOT EXISTS title text;
