export interface Alarm {
  id: number;
  medication_name: string;
  time: string;
  days: string[];
  enabled: boolean;
  notification_id: string | null;
  snooze_count: number;
  last_snoozed: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AlarmCreateInput {
  medication_name: string;
  time: string;
  days: string[];
  enabled?: boolean;
  notification_id?: string;
}

export interface AlarmUpdateInput {
  medication_name?: string;
  time?: string;
  days?: string[];
  enabled?: boolean;
  notification_id?: string;
}
