-- Supabase Database Setup for MedGuide
-- Run this in your Supabase SQL Editor

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id TEXT PRIMARY KEY,
  brand_name TEXT NOT NULL,
  generic_name TEXT NOT NULL,
  precautions TEXT,
  adverse_effects TEXT,
  counselling TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster searching
CREATE INDEX IF NOT EXISTS idx_medications_brand_name ON medications(brand_name);
CREATE INDEX IF NOT EXISTS idx_medications_generic_name ON medications(generic_name);

-- Insert Panadol test data (if not exists)
INSERT INTO medications (id, brand_name, generic_name, precautions, adverse_effects, counselling)
VALUES 
  (
    'panadol',
    'Panadol',
    'Paracetamol',
    'Do not exceed recommended dose. Not for children under 12 without medical advice. Avoid alcohol.',
    'Rare: allergic reactions, liver damage with overdose, skin rash',
    'Take with food if stomach upset occurs. Space doses 4-6 hours apart. Maximum 4000mg per day for adults.'
  )
ON CONFLICT (id) DO NOTHING;

-- Verify the data
SELECT * FROM medications WHERE brand_name ILIKE '%panadol%' OR generic_name ILIKE '%panadol%';

-- Enable Row Level Security (RLS) - optional for testing, recommended for production
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (for testing)
CREATE POLICY "Allow public read access" ON medications
  FOR SELECT
  USING (true);

-- If you want to add more medications later, use this format:
-- INSERT INTO medications (id, brand_name, generic_name, precautions, adverse_effects, counselling)
-- VALUES ('drug-id', 'Brand Name', 'Generic Name', 'Precautions text', 'Adverse effects text', 'Counselling text');
