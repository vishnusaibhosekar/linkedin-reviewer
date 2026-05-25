-- Add rewritten_profile_data column to store the admin's rewritten profile
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS rewritten_profile_data JSONB;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_rewrite_orders_rewritten_profile_data ON rewrite_orders USING GIN (rewritten_profile_data);
