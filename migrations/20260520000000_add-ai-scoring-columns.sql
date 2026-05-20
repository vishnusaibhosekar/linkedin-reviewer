-- Add missing columns for AI scoring results
ALTER TABLE reviews 
ADD COLUMN IF NOT EXISTS category_scores JSONB,
ADD COLUMN IF NOT EXISTS recommendations JSONB,
ADD COLUMN IF NOT EXISTS strengths TEXT[],
ADD COLUMN IF NOT EXISTS weaknesses TEXT[];
