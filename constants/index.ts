// Application constants

export const APP_NAME = "MatriVerse";
export const APP_TAGLINE = "Every mother deserves a personal trainer for pregnancy";

// Pregnancy constants
export const TOTAL_PREGNANCY_WEEKS = 40;
export const TRIMESTER_1_END = 12;
export const TRIMESTER_2_END = 27;
export const LABOUR_REHEARSAL_START_WEEK = 36;

// Training types
export const TRAINING_TYPES = {
  AR_TRAINER: "ar_trainer",
  BREATHING: "breathing",
  REHEARSAL: "rehearsal",
} as const;

// Symptom severity levels
export const SYMPTOM_SEVERITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
} as const;

// Symptom status
export const SYMPTOM_STATUS = {
  NORMAL: "normal",
  MONITOR: "monitor",
  SEEK_CARE: "seek_care",
} as const;

// Mood emojis
export const MOOD_EMOJIS = [
  { emoji: "😢", label: "Very Low", score: 1 },
  { emoji: "😔", label: "Low", score: 3 },
  { emoji: "😐", label: "Okay", score: 5 },
  { emoji: "🙂", label: "Good", score: 7 },
  { emoji: "😊", label: "Great", score: 9 },
  { emoji: "🤩", label: "Amazing", score: 10 },
];

// Navigation routes
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
  AR_TRAINER: "/dashboard/ar-trainer",
  BREATHING: "/dashboard/breathing",
  REHEARSAL: "/dashboard/rehearsal",
  AI_COACH: "/dashboard/ai-coach",
  SYMPTOMS: "/dashboard/symptoms",
  MOOD: "/dashboard/mood",
  PROGRESS: "/dashboard/progress",
  PROFILE: "/dashboard/profile",
} as const;
