-- Create drugs table based on Supabase schema
CREATE TABLE IF NOT EXISTS drugs (
  id BIGSERIAL PRIMARY KEY,
  drug_name TEXT NOT NULL,
  counseling TEXT,
  adverse_effects TEXT,
  indications TEXT,
  precautions_pregnancy TEXT,
  precautions_children TEXT,
  precautions_breastfeeding TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on drug_name for faster searches
CREATE INDEX IF NOT EXISTS idx_drugs_drug_name ON drugs(drug_name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_drugs_updated_at BEFORE UPDATE ON drugs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
