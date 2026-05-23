"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

export type Symptom = {
  id: string;
  user_id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  notes: string | null;
  status: "normal" | "monitor" | "seek_care";
  logged_at: string;
  created_at: string;
};

const SymptomSchema = z.object({
  name: z.string().min(1, { message: "Symptom name is required" }),
  severity: z.enum(["mild", "moderate", "severe"], {
    message: "Please select a severity level",
  }),
  notes: z.string().optional(),
});

export type SymptomState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
} | null;

export async function logSymptom(
  prevState: SymptomState,
  formData: FormData
): Promise<SymptomState> {
  const validatedFields = SymptomSchema.safeParse({
    name: formData.get("name"),
    severity: formData.get("severity"),
    notes: formData.get("notes"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, severity, notes } = validatedFields.data;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "You must be logged in to log symptoms" };
  }

  // Determine status based on severity and symptom type
  let status: "normal" | "monitor" | "seek_care" = "normal";

  // Flag certain symptoms for monitoring
  const concerningSymptoms = ["bleeding", "severe pain", "contractions", "vision changes", "severe headache"];
  const lowerName = name.toLowerCase();

  if (concerningSymptoms.some(s => lowerName.includes(s))) {
    status = severity === "severe" ? "seek_care" : "monitor";
  } else if (severity === "severe") {
    status = "monitor";
  }

  const { error } = await supabase.from("symptoms").insert({
    user_id: user.id,
    name,
    severity,
    notes: notes || null,
    status,
    logged_at: new Date().toISOString(),
  });

  if (error) {
    return { message: error.message };
  }

  revalidatePath("/dashboard/symptoms");
  return { success: true, message: "Symptom logged successfully" };
}

export async function getSymptoms(): Promise<{ success: boolean; data?: Symptom[] }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: [] };
  }

  const { data: symptoms } = await supabase
    .from("symptoms")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(50);

  return { success: true, data: (symptoms as Symptom[]) || [] };
}

export async function getSymptomStats(): Promise<{
  thisWeek: number;
  mostCommon: { name: string; count: number } | null;
  hasMonitorStatus: boolean;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { thisWeek: 0, mostCommon: null, hasMonitorStatus: false };
  }

  // Get symptoms from this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const { data: weekSymptoms } = await supabase
    .from("symptoms")
    .select("*")
    .eq("user_id", user.id)
    .gte("logged_at", oneWeekAgo.toISOString());

  const thisWeek = weekSymptoms?.length || 0;

  // Find most common symptom
  const symptomCounts: Record<string, number> = {};
  weekSymptoms?.forEach((s) => {
    symptomCounts[s.name] = (symptomCounts[s.name] || 0) + 1;
  });

  let mostCommon: { name: string; count: number } | null = null;
  Object.entries(symptomCounts).forEach(([name, count]) => {
    if (!mostCommon || count > mostCommon.count) {
      mostCommon = { name, count };
    }
  });

  // Check if any symptoms need monitoring
  const hasMonitorStatus = weekSymptoms?.some(
    (s) => s.status === "monitor" || s.status === "seek_care"
  ) || false;

  return { thisWeek, mostCommon, hasMonitorStatus };
}

export async function deleteSymptom(id: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  const { error } = await supabase
    .from("symptoms")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/symptoms");
  return { success: true };
}
