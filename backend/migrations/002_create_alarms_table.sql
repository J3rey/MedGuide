-- Create alarms table
CREATE TABLE IF NOT EXISTS alarms (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID,
  medication_name TEXT NOT NULL,
  time TEXT NOT NULL,
  days TEXT[] NOT NULL DEFAULT '{}',
  enabled BOOLEAN NOT NULL DEFAULT true,
  notification_id TEXT,
  snooze_count INTEGER DEFAULT 0,
  last_snoozed TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_alarms_user_id ON alarms(user_id);

-- Create updated_at trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_alarms_updated_at ON alarms;
CREATE TRIGGER update_alarms_updated_at BEFORE UPDATE ON alarms
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies (optional)
ALTER TABLE alarms ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for development (adjust for production)
CREATE POLICY "Allow public read access" ON alarms FOR SELECT TO anon USING (true);
CREATE POLICY "Allow public insert access" ON alarms FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow public update access" ON alarms FOR UPDATE TO anon USING (true);
CREATE POLICY "Allow public delete access" ON alarms FOR DELETE TO anon USING (true);
