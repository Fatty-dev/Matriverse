import { NormalizedLandmark } from "@mediapipe/tasks-vision";

export type SessionType = "deep_squat" | "pelvic_floor" | "birth_ball" | "hip_opening";

export interface ARTrainingSession {
  id: string;
  user_id: string;
  session_type: SessionType;
  started_at: string;
  completed_at?: string;
  duration_seconds?: number;
  total_reps: number;
  avg_form_score?: number;
  notes?: string;
  created_at: string;
}

export interface ARTrainingRep {
  id: string;
  session_id: string;
  rep_number: number;
  depth_percentage?: number;
  form_score: number;
  duration_ms: number;
  form_issues?: Record<string, any>;
  landmark_data?: Record<string, any>;
  created_at: string;
}

export interface PoseDetectionResult {
  landmarks: NormalizedLandmark[];
  worldLandmarks: NormalizedLandmark[];
  timestamp: number;
}

export interface SessionState {
  isActive: boolean;
  isPaused: boolean;
  startTime?: number;
  currentRep: number;
  reps: RepData[];
}

export interface RepData {
  repNumber: number;
  startTime: number;
  endTime?: number;
  formScore?: number;
  depth?: number;
  issues: string[];
}

export type SquatPhase = "standing" | "descending" | "bottom" | "ascending";

export interface VoiceGuidanceMessage {
  text: string;
  priority: "high" | "medium" | "low";
  timestamp: number;
}
