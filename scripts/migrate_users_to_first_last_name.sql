-- Migration script to update users table from name to first_name and last_name
-- Run this in your Supabase SQL Editor after the initial setup

-- Step 1: Add new columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text;

-- Step 2: Migrate existing data (if any)
-- Split existing name into first_name and last_name
UPDATE users 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = CASE 
    WHEN POSITION(' ' IN name) > 0 THEN SUBSTRING(name FROM POSITION(' ' IN name) + 1)
    ELSE ''
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Step 3: Make first_name and last_name NOT NULL (after migration)
-- First, set defaults for any NULL values
UPDATE users 
SET first_name = COALESCE(first_name, ''),
    last_name = COALESCE(last_name, '')
WHERE first_name IS NULL OR last_name IS NULL;

-- Step 4: Drop the old name column
ALTER TABLE users DROP COLUMN IF EXISTS name;

-- Step 5: Make first_name and last_name required
ALTER TABLE users 
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL;

-- Step 6: Update the trigger function to use first_name and last_name
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

