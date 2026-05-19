-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent re-runs)
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can read own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;

-- Policy: Allow authenticated users to insert reviews
CREATE POLICY "Users can create reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
);

-- Policy: Allow authenticated users to read their own reviews
CREATE POLICY "Users can read own reviews"
ON reviews
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
);

-- Policy: Allow authenticated users to update their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews
FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
)
WITH CHECK (
  user_id = auth.uid()
);
