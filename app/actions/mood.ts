"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MoodType = "happy" | "calm" | "neutral" | "anxious" | "sad" | "tired";
export type MoodContext = "morning" | "afternoon" | "evening" | "after_exercise" | "after_breathing" | "general";

export interface MoodEntry {
  id: string;
  user_id: string;
  mood: MoodType;
  score: number;
  note: string | null;
  context: MoodContext | null;
  logged_at: string;
  created_at: string;
}

export async function logMood(
  mood: MoodType,
  score: number,
  note?: string,
  context?: MoodContext
): Promise<{ success: boolean; error?: string; data?: MoodEntry }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { data, error } = await supabase
      .from("mood_entries")
      .insert({
        user_id: user.id,
        mood,
        score,
        note: note || null,
        context: context || "general",
        logged_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/mood");
    return { success: true, data: data as MoodEntry };
  } catch (error) {
    console.error("Error logging mood:", error);
    return { success: false, error: "Failed to log mood" };
  }
}

export async function getMoodEntries(limit?: number): Promise<{
  success: boolean;
  data?: MoodEntry[];
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    let query = supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("logged_at", { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as MoodEntry[] };
  } catch (error) {
    console.error("Error fetching mood entries:", error);
    return { success: false, error: "Failed to fetch mood entries" };
  }
}

export async function getMoodStats(): Promise<{
  weeklyAverage: number;
  mostCommonMood: MoodType | null;
  streak: number;
  totalEntries: number;
  weeklyData: { day: string; score: number }[];
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      weeklyAverage: 0,
      mostCommonMood: null,
      streak: 0,
      totalEntries: 0,
      weeklyData: [],
    };
  }

  // Get all entries for stats
  const { data: allEntries } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false });

  const entries = (allEntries || []) as MoodEntry[];

  // Get entries from the past 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: weeklyEntries } = await supabase
    .from("mood_entries")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", sevenDaysAgo.toISOString())
    .order("logged_at", { ascending: true });

  const weekEntries = (weeklyEntries || []) as MoodEntry[];

  // Calculate weekly average
  const weeklyAverage =
    weekEntries.length > 0
      ? Math.round((weekEntries.reduce((sum, e) => sum + e.score, 0) / weekEntries.length) * 10) / 10
      : 0;

  // Find most common mood
  const moodCounts: Record<MoodType, number> = {
    happy: 0,
    calm: 0,
    neutral: 0,
    anxious: 0,
    sad: 0,
    tired: 0,
  };

  weekEntries.forEach((e) => {
    moodCounts[e.mood]++;
  });

  let mostCommonMood: MoodType | null = null;
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([mood, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonMood = mood as MoodType;
    }
  });

  // Calculate streak
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < entries.length; i++) {
    const entryDate = new Date(entries[i].logged_at);
    entryDate.setHours(0, 0, 0, 0);

    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() - streak);

    if (entryDate.getTime() === expectedDate.getTime()) {
      streak++;
    } else if (entryDate.getTime() < expectedDate.getTime()) {
      break;
    }
  }

  // Generate weekly data for chart
  const weeklyData: { day: string; score: number }[] = [];
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const dayEntries = weekEntries.filter((e) => {
      const entryDate = new Date(e.logged_at);
      return entryDate >= date && entryDate < nextDate;
    });

    const avgScore =
      dayEntries.length > 0
        ? Math.round(dayEntries.reduce((sum, e) => sum + e.score, 0) / dayEntries.length)
        : 0;

    weeklyData.push({
      day: days[date.getDay()],
      score: avgScore,
    });
  }

  return {
    weeklyAverage,
    mostCommonMood,
    streak,
    totalEntries: entries.length,
    weeklyData,
  };
}

export async function getTodaysMoodEntry(): Promise<{
  success: boolean;
  data?: MoodEntry | null;
  error?: string;
}> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("mood_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("logged_at", today.toISOString())
      .order("logged_at", { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== "PGRST116") {
      return { success: false, error: error.message };
    }

    return { success: true, data: (data as MoodEntry) || null };
  } catch (error) {
    console.error("Error fetching today's mood:", error);
    return { success: false, error: "Failed to fetch today's mood" };
  }
}
