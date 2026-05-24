-- Re-enable RLS on reviews table with proper ownership policies
-- This ensures database-level security in addition to API-level checks

-- Enable RLS on reviews table
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent re-runs)
DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can create own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
DROP POLICY IF EXISTS "Admin full access" ON reviews;

-- Policy: Users can SELECT their own reviews
CREATE POLICY "Users can view own reviews"
ON reviews
FOR SELECT
TO authenticated
USING (
  user_id::text = auth.uid()
);

-- Policy: Users can INSERT reviews (automatically sets user_id to authenticated user)
CREATE POLICY "Users can create own reviews"
ON reviews
FOR INSERT
TO authenticated
WITH CHECK (
  user_id::text = auth.uid()
);

-- Policy: Users can UPDATE their own reviews
CREATE POLICY "Users can update own reviews"
ON reviews
FOR UPDATE
TO authenticated
USING (
  user_id::text = auth.uid()
)
WITH CHECK (
  user_id::text = auth.uid()
);

-- Policy: Users can DELETE their own reviews
CREATE POLICY "Users can delete own reviews"
ON reviews
FOR DELETE
TO authenticated
USING (
  user_id::text = auth.uid()
);

-- Policy: Service role (API key) has full access for webhooks and admin operations
CREATE POLICY "Admin full access"
ON reviews
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
