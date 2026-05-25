// User types
export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  gestationalAge?: number;
  dueDate?: string;
  isFirstPregnancy?: boolean;
  createdAt: string;
}

// Profile from Supabase
export interface Profile {
  id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  date_of_birth: string | null;
  due_date: string | null;
  is_first_pregnancy: boolean | null;
  referral_source: string | null;
  onboarding_completed: boolean | null;
  // New enhanced fields
  last_menstrual_period: string | null;
  medical_history: MedicalHistoryItem[] | null;
  partner_name: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relationship: string | null;
  has_uploaded_scan: boolean | null;
  created_at: string;
  updated_at: string;
}

// Medical history options
export interface MedicalHistoryItem {
  condition: string;
  selected: boolean;
}

export const MEDICAL_HISTORY_OPTIONS = [
  'Diabetes',
  'Gestational Diabetes',
  'Hypertension',
  'Pre-eclampsia',
  'Previous C-Section',
  'Miscarriage',
  'Anemia',
  'Thyroid Disorder',
  'Heart Condition',
  'Asthma',
  'None of the above',
] as const;

// Health profile types
export interface HealthProfile {
  userId: string;
  age?: number;
  medicalHistory?: string[];
  hospital?: string;
  scanData?: ScanData;
}

export interface ScanData {
  babyPosition?: string;
  gestationalAge?: number;
  pelvicMeasurements?: string;
  uploadedAt: string;
}

// Symptom types
export interface Symptom {
  id: string;
  userId: string;
  description: string;
  severity: "low" | "medium" | "high";
  status: "normal" | "monitor" | "seek_care";
  createdAt: string;
}

// Training session types
export interface TrainingSession {
  id: string;
  userId: string;
  type: "ar_trainer" | "breathing" | "rehearsal";
  duration: number;
  completedAt: string;
}

// Mood entry types
export interface MoodEntry {
  id: string;
  userId: string;
  score: number;
  emoji: string;
  notes?: string;
  createdAt: string;
}

// Video library types
export type VideoCategory = 'education' | 'exercise' | 'breathing' | 'labor_prep' | 'postpartum' | 'nutrition';

export interface Video {
  id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  category: VideoCategory;
  trimester: number | null;
  tags: string[];
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface UserVideoProgress {
  id: string;
  user_id: string;
  video_id: string;
  progress_seconds: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
}

// Scan interpretation types
export interface ScanInterpretation {
  summary: string;
  key_findings: string[];
  recommendations: string[];
  trimester_info: string;
  next_steps: string[];
}
