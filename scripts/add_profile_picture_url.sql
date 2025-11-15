-- Add profile_picture_url column to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url text;

-- Add comment for documentation
COMMENT ON COLUMN users.profile_picture_url IS 'URL to the user profile picture stored in Supabase storage';

