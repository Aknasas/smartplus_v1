// mobile/src/services/types/index.js

export interface User {
  user_id: string;
  username: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  patient_id?: string;
  blood_type?: string;
  created_at?: string;
  last_login?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface HealthMetric {
  metric_id?: string;
  time?: string;
  metric_type: string;
  value: number;
  unit: string;
  device_id?: string;
  finger_detected?: boolean;
  notes?: string;
}

export interface Anomaly {
  anomaly_id: string;
  detected_at: string;
  metric_type: string;
  metric_value: number;
  expected_range_min: number;
  expected_range_max: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  level?: string;
  is_resolved: boolean;
  notes?: string;
}

export interface EmergencyContact {
  contact_id: string;
  name: string;
  relationship: string;
  phone: string;
  alternate_phone?: string;
  email?: string;
  is_primary: boolean;
  can_receive_alerts: boolean;
}

export interface Reminder {
  reminder_id: string;
  reminder_type: string;
  title: string;
  description?: string;
  scheduled_datetime: string;
  end_datetime?: string;
  extra_info?: string;
  color?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  recurrence_interval?: number;
  is_active: boolean;
  is_completed: boolean;
  completed_at?: string;
  created_at: string;
}

export interface HealthTarget {
  target_id: string;
  target_type: string;
  target_value: number;
  target_min_value?: number;
  target_max_value?: number;
  current_value: number;
  unit: string;
  icon?: string;
  color?: string;
  is_active: boolean;
  start_date: string;
  end_date?: string;
}