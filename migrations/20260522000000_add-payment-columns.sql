-- Enable pgcrypto extension for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add payment columns to reviews table
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS payment_amount_minor BIGINT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS checkout_session_id VARCHAR(255);

-- Add indexes for payment queries
CREATE INDEX IF NOT EXISTS idx_reviews_payment_status ON reviews(payment_status);
CREATE INDEX IF NOT EXISTS idx_reviews_payment_id ON reviews(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_reviews_payment_id ON reviews(payment_id) WHERE payment_id IS NOT NULL;

-- Add payment columns to rewrite_orders table
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS payment_amount DECIMAL(10, 2);
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS payment_amount_minor BIGINT;
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS payment_currency VARCHAR(10);
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS payment_id VARCHAR(255);
ALTER TABLE rewrite_orders ADD COLUMN IF NOT EXISTS checkout_session_id VARCHAR(255);

-- Add indexes for rewrite payment queries
CREATE INDEX IF NOT EXISTS idx_rewrite_orders_payment_status ON rewrite_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_rewrite_orders_payment_id ON rewrite_orders(payment_id);
CREATE UNIQUE INDEX IF NOT EXISTS uniq_rewrite_orders_payment_id ON rewrite_orders(payment_id) WHERE payment_id IS NOT NULL;

-- Create webhook_events table for idempotency tracking
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id VARCHAR(255) NOT NULL UNIQUE,
    event_type VARCHAR(100) NOT NULL,
    processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
