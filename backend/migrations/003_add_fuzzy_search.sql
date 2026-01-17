-- Add PostgreSQL trigram extension for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create trigram index on drug_name for similarity search
CREATE INDEX IF NOT EXISTS idx_drugs_drug_name_trgm 
ON drugs USING gin(drug_name gin_trgm_ops);

-- Add text search index for better full-text search
CREATE INDEX IF NOT EXISTS idx_drugs_drug_name_gin 
ON drugs USING gin(to_tsvector('english', drug_name));

-- Create function for fuzzy drug search
CREATE OR REPLACE FUNCTION search_drugs_fuzzy(search_term TEXT, threshold REAL DEFAULT 0.3)
RETURNS TABLE (
  id BIGINT,
  drug_name TEXT,
  counseling TEXT,
  adverse_effects TEXT,
  indications TEXT,
  precautions_pregnancy TEXT,
  precautions_children TEXT,
  precautions_breastfeeding TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  similarity_score REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.drug_name,
    d.counseling,
    d.adverse_effects,
    d.indications,
    d.precautions_pregnancy,
    d.precautions_children,
    d.precautions_breastfeeding,
    d.created_at,
    d.updated_at,
    similarity(d.drug_name, search_term) as similarity_score
  FROM drugs d
  WHERE similarity(d.drug_name, search_term) > threshold
  ORDER BY similarity_score DESC;
END;
$$ LANGUAGE plpgsql;

-- This enables:
-- 1. Fuzzy matching: search_drugs_fuzzy('paracetmol', 0.3) matches 'paracetamol'
-- 2. Fast ILIKE queries: drug_name ILIKE '%query%'
-- 3. Typo tolerance: handles misspellings like "ibuprofin" -> "ibuprofen"
