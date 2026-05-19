-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  
  -- Intake form data
  full_name VARCHAR(255) NOT NULL,
  professional_status VARCHAR(50) NOT NULL,  -- employed/unemployed/student
  work_experience VARCHAR(20) NOT NULL,       -- 0-1/1-3/3-7/7+
  current_job_title VARCHAR(255),             -- nullable, only if employed
  purpose VARCHAR(100) NOT NULL,
  
  -- LinkedIn data
  linkedin_url TEXT NOT NULL,
  pdf_storage_path TEXT NOT NULL,
  screenshot_paths TEXT[] NOT NULL,           -- array of paths
  
  -- Processing results (empty initially, populated by AI)
  parsed_pdf_text TEXT,
  parsed_data JSONB,
  review_data JSONB,                          -- full AI review output
  overall_score INT,
  score_band VARCHAR(50),
  model_used VARCHAR(100),
  tokens_used INT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_status ON reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own reviews
CREATE POLICY "Users can view own reviews"
  ON reviews FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reviews"
  ON reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (auth.uid() = user_id);
