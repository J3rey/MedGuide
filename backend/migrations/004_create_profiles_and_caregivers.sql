-- Migration 004: Create profiles, caregivers, medications, schedules, and related tables
-- MedGuide v3.0 - Multi-profile, Caregiver, Emergency, Pharmacy support

-- ============ Users table update ============
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS biometric_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS default_profile_id UUID;

-- ============ Profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'self',
  date_of_birth DATE,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  cultural_notes TEXT,
  dietary_notes TEXT,
  family_involvement_preference TEXT DEFAULT 'full',
  accessibility_settings JSONB DEFAULT '{"high_contrast": false, "text_size": "default", "button_size": "default", "reduce_animations": false, "simplified_ui": false, "voice_feedback": false}'::jsonb,
  avatar_color TEXT DEFAULT '#364EFF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_owner ON profiles(owner_user_id);

-- ============ Profile Caregivers ============
CREATE TABLE IF NOT EXISTS profile_caregivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  caregiver_user_id UUID,
  caregiver_name TEXT,
  caregiver_email TEXT,
  role TEXT NOT NULL DEFAULT 'caregiver',
  permissions JSONB DEFAULT '{"view_medication_status": true, "receive_missed_dose_alerts": true, "view_visual_schedule": true, "manage_medications": false, "manage_emergency_contacts": false, "trigger_emergency_protocol": false}'::jsonb,
  invite_status TEXT NOT NULL DEFAULT 'pending',
  invite_code TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_caregivers_profile ON profile_caregivers(profile_id);
CREATE INDEX IF NOT EXISTS idx_caregivers_user ON profile_caregivers(caregiver_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_caregivers_invite_code ON profile_caregivers(invite_code) WHERE invite_code IS NOT NULL;

-- ============ Medications ============
CREATE TABLE IF NOT EXISTS medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  drug_id TEXT,
  custom_name TEXT NOT NULL,
  dose TEXT NOT NULL,
  instructions TEXT,
  notes TEXT,
  pharmacy_id UUID,
  color TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medications_profile ON medications(profile_id);

-- ============ Medication Schedules ============
CREATE TABLE IF NOT EXISTS medication_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL, -- HH:MM format
  days TEXT[] NOT NULL DEFAULT ARRAY['mon','tue','wed','thu','fri','sat','sun'],
  recurrence_rule TEXT NOT NULL DEFAULT 'daily',
  reminder_enabled BOOLEAN DEFAULT TRUE,
  escalation_threshold_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_schedules_profile ON medication_schedules(profile_id);
CREATE INDEX IF NOT EXISTS idx_schedules_medication ON medication_schedules(medication_id);

-- ============ Medication Logs ============
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  scheduled_instance_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  taken_at TIMESTAMPTZ,
  skipped_reason TEXT,
  notes TEXT,
  logged_by_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_logs_profile ON medication_logs(profile_id);
CREATE INDEX IF NOT EXISTS idx_logs_medication ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_logs_status ON medication_logs(status);

-- ============ Pharmacies ============
CREATE TABLE IF NOT EXISTS pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  opening_hours TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pharmacies_profile ON pharmacies(profile_id);

-- ============ Emergency Contacts ============
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_language TEXT,
  priority_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_contacts_profile ON emergency_contacts(profile_id);

-- ============ Emergency Events ============
CREATE TABLE IF NOT EXISTS emergency_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'medium',
  description TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  triggered_by_user_id UUID,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emergency_events_profile ON emergency_events(profile_id);
CREATE INDEX IF NOT EXISTS idx_emergency_events_status ON emergency_events(status);

-- ============ Voice Notes ============
CREATE TABLE IF NOT EXISTS voice_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES medications(id) ON DELETE SET NULL,
  file_url_or_local_uri TEXT NOT NULL,
  transcript TEXT,
  created_by_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_notes_profile ON voice_notes(profile_id);

-- ============ Row Level Security ============
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pharmacies ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_notes ENABLE ROW LEVEL SECURITY;

-- Policies for profiles (owner access)
CREATE POLICY profiles_owner_policy ON profiles
  FOR ALL USING (owner_user_id = auth.uid());

-- Policies for medications (owner of profile)
CREATE POLICY medications_owner_policy ON medications
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Policies for medication_schedules
CREATE POLICY schedules_owner_policy ON medication_schedules
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Policies for medication_logs
CREATE POLICY logs_owner_policy ON medication_logs
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Policies for pharmacies
CREATE POLICY pharmacies_owner_policy ON pharmacies
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Policies for emergency_contacts
CREATE POLICY emergency_contacts_owner_policy ON emergency_contacts
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Policies for emergency_events
CREATE POLICY emergency_events_owner_policy ON emergency_events
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Policies for voice_notes
CREATE POLICY voice_notes_owner_policy ON voice_notes
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
  );

-- Caregiver access policies
CREATE POLICY caregivers_profile_owner_policy ON profile_caregivers
  FOR ALL USING (
    profile_id IN (SELECT id FROM profiles WHERE owner_user_id = auth.uid())
    OR caregiver_user_id = auth.uid()
  );

-- Caregiver read access to medications
CREATE POLICY medications_caregiver_read_policy ON medications
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_caregivers
      WHERE caregiver_user_id = auth.uid()
      AND invite_status = 'accepted'
      AND (permissions->>'view_medication_status')::boolean = true
    )
  );

-- Caregiver read access to medication_logs
CREATE POLICY logs_caregiver_read_policy ON medication_logs
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_caregivers
      WHERE caregiver_user_id = auth.uid()
      AND invite_status = 'accepted'
      AND (permissions->>'view_medication_status')::boolean = true
    )
  );

-- Caregiver read access to schedules
CREATE POLICY schedules_caregiver_read_policy ON medication_schedules
  FOR SELECT USING (
    profile_id IN (
      SELECT profile_id FROM profile_caregivers
      WHERE caregiver_user_id = auth.uid()
      AND invite_status = 'accepted'
      AND (permissions->>'view_visual_schedule')::boolean = true
    )
  );
