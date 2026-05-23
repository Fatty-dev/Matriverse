"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ARTrainingSession, ARTrainingRep, SessionType } from "@/types/ar-training";

export async function startARSession(
  sessionType: SessionType
): Promise<{ success: boolean; sessionId?: string; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  const { data, error } = await supabase
    .from("ar_training_sessions")
    .insert({
      user_id: user.id,
      session_type: sessionType,
      started_at: new Date().toISOString(),
      total_reps: 0,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, sessionId: data.id };
}

export async function completeARSession(
  sessionId: string,
  totalReps: number,
  avgFormScore: number,
  notes?: string
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  // Get session start time to calculate duration
  const { data: session } = await supabase
    .from("ar_training_sessions")
    .select("started_at")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return { success: false, message: "Session not found" };
  }

  const startedAt = new Date(session.started_at);
  const completedAt = new Date();
  const durationSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

  const { error } = await supabase
    .from("ar_training_sessions")
    .update({
      completed_at: completedAt.toISOString(),
      duration_seconds: durationSeconds,
      total_reps: totalReps,
      avg_form_score: avgFormScore,
      notes,
    })
    .eq("id", sessionId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/ar-trainer");
  return { success: true };
}

export async function saveARRep(
  sessionId: string,
  repNumber: number,
  formScore: number,
  durationMs: number,
  depthPercentage?: number,
  formIssues?: Record<string, any>,
  landmarkData?: Record<string, any>
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  // Verify session belongs to user
  const { data: session } = await supabase
    .from("ar_training_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) {
    return { success: false, message: "Session not found" };
  }

  const { error } = await supabase.from("ar_training_reps").insert({
    session_id: sessionId,
    rep_number: repNumber,
    form_score: formScore,
    duration_ms: durationMs,
    depth_percentage: depthPercentage,
    form_issues: formIssues,
    landmark_data: landmarkData,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true };
}

export async function getARSessions(limit = 50): Promise<{ success: boolean; data?: ARTrainingSession[] }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: [] };
  }

  const { data: sessions } = await supabase
    .from("ar_training_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(limit);

  return { success: true, data: (sessions as ARTrainingSession[]) || [] };
}

export async function getARSessionWithReps(
  sessionId: string
): Promise<{ session: ARTrainingSession | null; reps: ARTrainingRep[] }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { session: null, reps: [] };
  }

  const { data: session } = await supabase
    .from("ar_training_sessions")
    .select("*")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  const { data: reps } = await supabase
    .from("ar_training_reps")
    .select("*")
    .eq("session_id", sessionId)
    .order("rep_number", { ascending: true });

  return {
    session: session as ARTrainingSession | null,
    reps: (reps as ARTrainingRep[]) || [],
  };
}

export async function getARStats(): Promise<{
  totalSessions: number;
  totalReps: number;
  avgFormScore: number;
  bestSession: ARTrainingSession | null;
  recentSessions: ARTrainingSession[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalSessions: 0,
      totalReps: 0,
      avgFormScore: 0,
      bestSession: null,
      recentSessions: [],
    };
  }

  const { data: sessions } = await supabase
    .from("ar_training_sessions")
    .select("*")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("started_at", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalReps: 0,
      avgFormScore: 0,
      bestSession: null,
      recentSessions: [],
    };
  }

  const totalSessions = sessions.length;
  const totalReps = sessions.reduce((sum, s) => sum + (s.total_reps || 0), 0);

  // Calculate average form score across all sessions
  const sessionsWithScore = sessions.filter((s) => s.avg_form_score != null);
  const avgFormScore =
    sessionsWithScore.length > 0
      ? sessionsWithScore.reduce((sum, s) => sum + (s.avg_form_score || 0), 0) /
        sessionsWithScore.length
      : 0;

  // Find best session by avg_form_score
  let bestSession: ARTrainingSession | null = null;
  let bestScore = 0;
  sessions.forEach((s) => {
    if (s.avg_form_score && s.avg_form_score > bestScore) {
      bestScore = s.avg_form_score;
      bestSession = s as ARTrainingSession;
    }
  });

  const recentSessions = sessions.slice(0, 5) as ARTrainingSession[];

  return {
    totalSessions,
    totalReps,
    avgFormScore: Math.round(avgFormScore * 10) / 10,
    bestSession,
    recentSessions,
  };
}
