/**
 * MedGuide Data Models
 * TypeScript types for profiles, caregivers, medications, schedules,
 * pharmacies, emergency contacts, and accessibility settings.
 */

// ============ User ============
export interface User {
  id: string;
  email: string;
  phone?: string;
  created_at: string;
  terms_accepted_at?: string;
  biometric_enabled: boolean;
  default_profile_id?: string;
}

// ============ Profile ============
export type Relationship =
  | 'self'
  | 'parent'
  | 'grandparent'
  | 'partner'
  | 'child'
  | 'sibling'
  | 'other';

export interface Profile {
  id: string;
  owner_user_id: string;
  name: string;
  relationship: Relationship;
  date_of_birth?: string;
  preferred_language: string;
  cultural_notes?: string;
  dietary_notes?: string;
  family_involvement_preference?: 'full' | 'limited' | 'none';
  accessibility_settings: AccessibilitySettings;
  avatar_color?: string;
  created_at: string;
}

export interface AccessibilitySettings {
  high_contrast: boolean;
  text_size: 'small' | 'default' | 'large' | 'extraLarge';
  button_size: 'default' | 'large' | 'extraLarge';
  reduce_animations: boolean;
  simplified_ui: boolean;
  voice_feedback: boolean;
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  high_contrast: false,
  text_size: 'default',
  button_size: 'default',
  reduce_animations: false,
  simplified_ui: false,
  voice_feedback: false,
};

// ============ Caregiver ============
export type CaregiverRole = 'caregiver' | 'family_member' | 'emergency_contact';

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface CaregiverPermissions {
  view_medication_status: boolean;
  receive_missed_dose_alerts: boolean;
  view_visual_schedule: boolean;
  manage_medications: boolean;
  manage_emergency_contacts: boolean;
  trigger_emergency_protocol: boolean;
}

export const defaultCaregiverPermissions: CaregiverPermissions = {
  view_medication_status: true,
  receive_missed_dose_alerts: true,
  view_visual_schedule: true,
  manage_medications: false,
  manage_emergency_contacts: false,
  trigger_emergency_protocol: false,
};

export interface ProfileCaregiver {
  id: string;
  profile_id: string;
  caregiver_user_id: string;
  caregiver_name?: string;
  caregiver_email?: string;
  role: CaregiverRole;
  permissions: CaregiverPermissions;
  invite_status: InviteStatus;
  invite_code?: string;
  created_at: string;
  revoked_at?: string;
}

// ============ Medication ============
export interface Medication {
  id: string;
  profile_id: string;
  drug_id?: string;
  custom_name: string;
  dose: string;
  instructions?: string;
  notes?: string;
  pharmacy_id?: string;
  color?: string;
  icon?: string;
  created_at: string;
}

// ============ Medication Schedule ============
export type RecurrenceRule = 'daily' | 'weekdays' | 'weekends' | 'custom';

export interface MedicationSchedule {
  id: string;
  medication_id: string;
  profile_id: string;
  scheduled_time: string; // HH:MM format
  days: string[]; // ['mon','tue','wed','thu','fri','sat','sun'] or subset
  recurrence_rule: RecurrenceRule;
  reminder_enabled: boolean;
  escalation_threshold_minutes: number;
  created_at: string;
}

// ============ Medication Log ============
export type MedicationStatus =
  | 'upcoming'
  | 'due_now'
  | 'taken'
  | 'taken_late'
  | 'missed'
  | 'skipped'
  | 'snoozed';

export interface MedicationLog {
  id: string;
  medication_id: string;
  profile_id: string;
  scheduled_instance_time: string;
  status: MedicationStatus;
  taken_at?: string;
  skipped_reason?: string;
  notes?: string;
  logged_by_user_id?: string;
  created_at: string;
}

// ============ Pharmacy ============
export interface Pharmacy {
  id: string;
  profile_id: string;
  name: string;
  phone: string;
  address?: string;
  opening_hours?: string;
  notes?: string;
  created_at: string;
}

// ============ Emergency Contact ============
export interface EmergencyContact {
  id: string;
  profile_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  preferred_language?: string;
  priority_order: number;
  created_at: string;
}

// ============ Emergency Event ============
export type EmergencyEventType =
  | 'medication_overdose'
  | 'severe_side_effect'
  | 'allergic_reaction'
  | 'fall'
  | 'chest_pain'
  | 'breathing_difficulty'
  | 'confusion'
  | 'other';

export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';
export type EmergencyEventStatus = 'active' | 'resolved' | 'cancelled';

export interface EmergencyEvent {
  id: string;
  profile_id: string;
  event_type: EmergencyEventType;
  severity: EmergencySeverity;
  description?: string;
  status: EmergencyEventStatus;
  triggered_by_user_id: string;
  resolved_at?: string;
  created_at: string;
}

// ============ Voice Note ============
export interface VoiceNote {
  id: string;
  profile_id: string;
  medication_id?: string;
  file_url_or_local_uri: string;
  transcript?: string;
  created_by_user_id: string;
  created_at: string;
}

// ============ Schedule View Types ============
export interface ScheduleItem {
  id: string;
  medication: Medication;
  schedule: MedicationSchedule;
  log?: MedicationLog;
  status: MedicationStatus;
  scheduledTime: Date;
  profileName: string;
}

export type ScheduleViewMode = 'today' | 'weekly' | 'timeline';

// ============ Navigation Types ============
export type MainTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Scan: undefined;
  Chat: undefined;
  Profile: undefined;
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  ManageProfiles: undefined;
  CreateProfile: undefined;
  EditProfile: { profileId: string };
  CaregiverDashboard: undefined;
  CaregiverInvite: { profileId: string };
  CaregiverPermissions: { caregiverId: string };
  AccessibilitySettings: undefined;
  SecuritySettings: undefined;
  PharmacyList: undefined;
  AddEditPharmacy: { pharmacyId?: string };
  EmergencyContacts: undefined;
  EmergencyProtocol: undefined;
  TermsAndConditions: undefined;
  CulturalNotes: { profileId: string };
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  LanguageSelect: undefined;
  TermsAccept: undefined;
  CreateAccount: undefined;
  CreateFirstProfile: undefined;
  AccessibilityPreferences: undefined;
  AddFirstMedication: undefined;
  InviteCaregiver: undefined;
  AddEmergencyContact: undefined;
  OnboardingComplete: undefined;
};
