-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent re-runs)
DROP POLICY IF EXISTS "Users can upload to resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own resumes" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to rewrites" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own rewrites" ON storage.objects;

-- Policy: Allow authenticated users to upload to resumes bucket
CREATE POLICY "Users can upload to resumes"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'resumes'
  AND uploaded_by = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own files from resumes
CREATE POLICY "Users can read own resumes"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket = 'resumes'
  AND uploaded_by = auth.uid()::text
);

-- Policy: Allow authenticated users to upload to rewrites bucket
CREATE POLICY "Users can upload to rewrites"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'rewrites'
  AND uploaded_by = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own files from rewrites
CREATE POLICY "Users can read own rewrites"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket = 'rewrites'
  AND uploaded_by = auth.uid()::text
);
