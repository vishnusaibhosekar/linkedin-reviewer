-- Remove foreign key constraint from reviews.user_id
ALTER TABLE reviews DROP CONSTRAINT IF EXISTS reviews_user_id_fkey;

-- Disable RLS on reviews table (API routes handle validation)
ALTER TABLE reviews DISABLE ROW LEVEL SECURITY;

-- Drop RLS policies if they exist
DROP POLICY IF EXISTS "Users can create reviews" ON reviews;
DROP POLICY IF EXISTS "Users can read own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can insert own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can view own reviews" ON reviews;
DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
