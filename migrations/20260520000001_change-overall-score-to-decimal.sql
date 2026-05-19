-- Change overall_score from INT to DECIMAL to support fractional scores (e.g., 83.5)
ALTER TABLE reviews 
  ALTER COLUMN overall_score TYPE DECIMAL(5,2);
