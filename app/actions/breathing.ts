"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type BreathingSession = {
  id: string;
  user_id: string;
  exercise_name: string;
  exercise_type: "relaxation" | "sleep_aid" | "labor_prep" | "stress_relief" | "energy";
  duration_seconds: number;
  completed_at: string;
  created_at: string;
};

export async function saveBreathingSession(
  exerciseName: string,
  exerciseType: "relaxation" | "sleep_aid" | "labor_prep" | "stress_relief" | "energy",
  durationSeconds: number
): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  const { error } = await supabase.from("breathing_sessions").insert({
    user_id: user.id,
    exercise_name: exerciseName,
    exercise_type: exerciseType,
    duration_seconds: durationSeconds,
    completed_at: new Date().toISOString(),
  });

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/breathing");
  return { success: true };
}

export async function getBreathingSessions(): Promise<BreathingSession[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: sessions } = await supabase
    .from("breathing_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false })
    .limit(50);

  return (sessions as BreathingSession[]) || [];
}

export async function getBreathingStats(): Promise<{
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number;
  favoriteExercise: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      favoriteExercise: null,
    };
  }

  const { data: sessions } = await supabase
    .from("breathing_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("completed_at", { ascending: false });

  if (!sessions || sessions.length === 0) {
    return {
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      favoriteExercise: null,
    };
  }

  // Total sessions
  const totalSessions = sessions.length;

  // Total minutes
  const totalMinutes = Math.floor(
    sessions.reduce((sum, s) => sum + s.duration_seconds, 0) / 60
  );

  // Calculate current streak (consecutive days with sessions)
  let currentStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sessionDates = sessions.map((s) => {
    const date = new Date(s.completed_at);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  });

  const uniqueDates = [...new Set(sessionDates)].sort((a, b) => b - a);

  let expectedDate = today.getTime();
  for (const date of uniqueDates) {
    if (date === expectedDate) {
      currentStreak++;
      expectedDate -= 24 * 60 * 60 * 1000; // Subtract one day
    } else if (date < expectedDate - 24 * 60 * 60 * 1000) {
      break;
    }
  }

  // Find favorite exercise (most completed)
  const exerciseCounts: Record<string, number> = {};
  sessions.forEach((s) => {
    exerciseCounts[s.exercise_name] = (exerciseCounts[s.exercise_name] || 0) + 1;
  });

  let favoriteExercise: string | null = null;
  let maxCount = 0;
  Object.entries(exerciseCounts).forEach(([name, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteExercise = name;
    }
  });

  // Shorten favorite exercise name if it exists
  if (favoriteExercise) {
    favoriteExercise = favoriteExercise.replace(" Breathing", "");
  }

  return {
    totalSessions,
    totalMinutes,
    currentStreak,
    favoriteExercise,
  };
}
