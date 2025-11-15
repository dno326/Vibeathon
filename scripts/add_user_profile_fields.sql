-- Add grade and major fields to users table
-- Run this in Supabase SQL Editor

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS grade text,
ADD COLUMN IF NOT EXISTS major text;

-- Add comment for documentation
COMMENT ON COLUMN users.grade IS 'Student grade/year (e.g., Freshman, Sophomore, Junior, Senior)';
COMMENT ON COLUMN users.major IS 'Student major field of study';

