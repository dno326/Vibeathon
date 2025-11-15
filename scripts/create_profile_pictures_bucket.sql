-- Create profile-pictures storage bucket in Supabase
-- Note: This needs to be done in Supabase Dashboard, not SQL Editor
-- Storage buckets are managed through the Storage UI

-- Instructions:
-- 1. Go to Supabase Dashboard → Storage
-- 2. Click "New bucket"
-- 3. Name: profile-pictures
-- 4. Public bucket: Yes (checked)
-- 5. File size limit: 5MB (or your preference)
-- 6. Allowed MIME types: image/*
-- 7. Click "Create bucket"

-- After creating the bucket, you may want to set up RLS policies:
-- Policy for public read access (if bucket is public, this may not be needed):
-- CREATE POLICY "Public read access" ON storage.objects
--   FOR SELECT USING (bucket_id = 'profile-pictures');

-- Policy for authenticated users to upload:
-- CREATE POLICY "Authenticated users can upload" ON storage.objects
--   FOR INSERT WITH CHECK (
--     bucket_id = 'profile-pictures' AND
--     auth.role() = 'authenticated'
--   );

-- Policy for users to update their own files:
-- CREATE POLICY "Users can update own files" ON storage.objects
--   FOR UPDATE USING (
--     bucket_id = 'profile-pictures' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

-- Policy for users to delete their own files:
-- CREATE POLICY "Users can delete own files" ON storage.objects
--   FOR DELETE USING (
--     bucket_id = 'profile-pictures' AND
--     (storage.foldername(name))[1] = auth.uid()::text
--   );

