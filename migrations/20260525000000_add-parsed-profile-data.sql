-- Add parsed_profile_data column to store structured profile extraction
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS parsed_profile_data JSONB;

-- Add index for faster queries on parsed data
CREATE INDEX IF NOT EXISTS idx_reviews_parsed_profile_data ON reviews USING GIN (parsed_profile_data);
