-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent re-runs)
DROP POLICY IF EXISTS "Users can upload to linkedin-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own linkedin-pdfs" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload to linkedin-screenshots" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own linkedin-screenshots" ON storage.objects;

-- Policy: Allow authenticated users to upload to linkedin-pdfs bucket
CREATE POLICY "Users can upload to linkedin-pdfs"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'linkedin-pdfs'
  AND uploaded_by = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own files from linkedin-pdfs
CREATE POLICY "Users can read own linkedin-pdfs"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket = 'linkedin-pdfs'
  AND uploaded_by = auth.uid()::text
);

-- Policy: Allow authenticated users to upload to linkedin-screenshots bucket
CREATE POLICY "Users can upload to linkedin-screenshots"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket = 'linkedin-screenshots'
  AND uploaded_by = auth.uid()::text
);

-- Policy: Allow authenticated users to read their own files from linkedin-screenshots
CREATE POLICY "Users can read own linkedin-screenshots"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket = 'linkedin-screenshots'
  AND uploaded_by = auth.uid()::text
);
