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
  created_at: string;
  updated_at: string;
}

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
