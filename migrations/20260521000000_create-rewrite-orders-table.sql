-- Create rewrite_orders table
CREATE TABLE rewrite_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  review_id UUID NOT NULL REFERENCES reviews(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending_payment',
  
  -- Intake form data
  resume_storage_path TEXT NOT NULL,
  key_accomplishments TEXT NOT NULL,
  target_roles VARCHAR(255) NOT NULL,
  tone_preference VARCHAR(20) NOT NULL,  -- 'formal', 'conversational', 'bold'
  sections_to_improve TEXT[] NOT NULL,   -- e.g., ['headline', 'about', 'experience']
  special_requests TEXT,
  contact_email VARCHAR(255) NOT NULL,
  
  -- Fulfillment
  deliverable_path TEXT,
  assigned_to VARCHAR(100) DEFAULT 'manish',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  due_date TIMESTAMPTZ,  -- created_at + 3 business days
  completed_at TIMESTAMPTZ
);

-- Create indexes for performance
CREATE INDEX idx_rewrite_orders_user_id ON rewrite_orders(user_id);
CREATE INDEX idx_rewrite_orders_review_id ON rewrite_orders(review_id);
CREATE INDEX idx_rewrite_orders_status ON rewrite_orders(status);
