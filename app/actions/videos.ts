"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Video, VideoCategory, UserVideoProgress } from "@/types";

export async function getVideos(filters?: {
  category?: VideoCategory;
  trimester?: number;
  featured?: boolean;
}): Promise<{ success: boolean; data?: Video[]; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    let query = supabase
      .from("videos")
      .select("*")
      .order("sort_order", { ascending: true });

    if (filters?.category) {
      query = query.eq("category", filters.category);
    }

    if (filters?.trimester) {
      query = query.eq("trimester", filters.trimester);
    }

    if (filters?.featured) {
      query = query.eq("is_featured", true);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Video[] };
  } catch (error) {
    console.error("Error fetching videos:", error);
    return { success: false, error: "Failed to fetch videos" };
  }
}

export async function getFeaturedVideos(): Promise<{ success: boolean; data?: Video[]; error?: string }> {
  return getVideos({ featured: true });
}

export async function getVideosByCategory(category: VideoCategory): Promise<{ success: boolean; data?: Video[]; error?: string }> {
  return getVideos({ category });
}

export async function getUserVideoProgress(): Promise<{
  success: boolean;
  data?: (UserVideoProgress & { video: Video })[];
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

    const { data, error } = await supabase
      .from("user_video_progress")
      .select("*, video:videos(*)")
      .eq("user_id", user.id)
      .order("last_watched_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data as (UserVideoProgress & { video: Video })[] };
  } catch (error) {
    console.error("Error fetching video progress:", error);
    return { success: false, error: "Failed to fetch video progress" };
  }
}

export async function updateVideoProgress(
  videoId: string,
  progressSeconds: number,
  completed: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "You must be logged in" };
    }

    const { error } = await supabase
      .from("user_video_progress")
      .upsert(
        {
          user_id: user.id,
          video_id: videoId,
          progress_seconds: progressSeconds,
          completed,
          last_watched_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,video_id",
        }
      );

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/videos");
    return { success: true };
  } catch (error) {
    console.error("Error updating video progress:", error);
    return { success: false, error: "Failed to update video progress" };
  }
}

export async function getVideoStats(): Promise<{
  totalVideos: number;
  watchedVideos: number;
  completedVideos: number;
  totalWatchTime: number;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { totalVideos: 0, watchedVideos: 0, completedVideos: 0, totalWatchTime: 0 };
  }

  // Get total videos
  const { count: totalVideos } = await supabase
    .from("videos")
    .select("*", { count: "exact", head: true });

  // Get user progress
  const { data: progress } = await supabase
    .from("user_video_progress")
    .select("*")
    .eq("user_id", user.id);

  const watchedVideos = progress?.length || 0;
  const completedVideos = progress?.filter((p) => p.completed).length || 0;
  const totalWatchTime = progress?.reduce((acc, p) => acc + (p.progress_seconds || 0), 0) || 0;

  return {
    totalVideos: totalVideos || 0,
    watchedVideos,
    completedVideos,
    totalWatchTime,
  };
}
