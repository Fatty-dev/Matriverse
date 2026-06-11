"use server";

import { createClient } from "@/lib/supabase/server";

export interface LabourRehearsalProgress {
  id: string;
  user_id: string;
  stage_id: string;
  status: "not_started" | "in_progress" | "completed";
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export async function getLabourRehearsalProgress(): Promise<{
  success: boolean;
  data?: LabourRehearsalProgress[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data, error } = await supabase
      .from("labour_rehearsal_progress")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching labour rehearsal progress:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error("Error in getLabourRehearsalProgress:", error);
    return { success: false, error: "Failed to fetch progress" };
  }
}

export async function startLabourRehearsalStage(stageId: string): Promise<{
  success: boolean;
  data?: LabourRehearsalProgress;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if progress already exists
    const { data: existing } = await supabase
      .from("labour_rehearsal_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("stage_id", stageId)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("labour_rehearsal_progress")
        .update({
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }

    // Create new record
    const { data, error } = await supabase
      .from("labour_rehearsal_progress")
      .insert({
        user_id: user.id,
        stage_id: stageId,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in startLabourRehearsalStage:", error);
    return { success: false, error: "Failed to start stage" };
  }
}

export async function completeLabourRehearsalStage(stageId: string): Promise<{
  success: boolean;
  data?: LabourRehearsalProgress;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Check if progress exists
    const { data: existing } = await supabase
      .from("labour_rehearsal_progress")
      .select("*")
      .eq("user_id", user.id)
      .eq("stage_id", stageId)
      .single();

    if (existing) {
      // Update existing record
      const { data, error } = await supabase
        .from("labour_rehearsal_progress")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    }

    // Create new record marked as completed
    const { data, error } = await supabase
      .from("labour_rehearsal_progress")
      .insert({
        user_id: user.id,
        stage_id: stageId,
        status: "completed",
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error in completeLabourRehearsalStage:", error);
    return { success: false, error: "Failed to complete stage" };
  }
}
