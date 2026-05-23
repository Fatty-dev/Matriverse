"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type Scan = {
  id: string;
  user_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  scan_type: "ultrasound" | "medical_report" | "lab_result" | "other" | null;
  scan_date: string | null;
  trimester: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function uploadScan(formData: FormData): Promise<{ success: boolean; message?: string; scanId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  const file = formData.get("file") as File;
  const scanType = formData.get("scanType") as string;
  const scanDate = formData.get("scanDate") as string;
  const trimester = formData.get("trimester") as string;
  const notes = formData.get("notes") as string;

  if (!file) {
    return { success: false, message: "No file provided" };
  }

  // Upload file to Supabase Storage
  const fileExt = file.name.split(".").pop();
  const fileName = `${user.id}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from("scans")
    .upload(fileName, file);

  if (uploadError) {
    return { success: false, message: `Upload failed: ${uploadError.message}` };
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from("scans")
    .getPublicUrl(fileName);

  // Save scan record to database
  const { data, error } = await supabase
    .from("scans")
    .insert({
      user_id: user.id,
      file_name: file.name,
      file_url: publicUrl,
      file_type: file.type,
      file_size: file.size,
      scan_type: scanType || null,
      scan_date: scanDate || null,
      trimester: trimester ? parseInt(trimester) : null,
      notes: notes || null,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/scans");
  return { success: true, scanId: data.id };
}

export async function getScans(filter?: { trimester?: number; scanType?: string }): Promise<{ success: boolean; data?: Scan[] }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: [] };
  }

  let query = supabase
    .from("scans")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (filter?.trimester) {
    query = query.eq("trimester", filter.trimester);
  }

  if (filter?.scanType) {
    query = query.eq("scan_type", filter.scanType);
  }

  const { data: scans } = await query;

  return { success: true, data: (scans as Scan[]) || [] };
}

export async function deleteScan(scanId: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  // Get scan to delete file from storage
  const { data: scan } = await supabase
    .from("scans")
    .select("file_url")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .single();

  if (scan && scan.file_url) {
    // Extract file path from URL
    const urlParts = scan.file_url.split("/");
    const filePath = urlParts.slice(-2).join("/");

    await supabase.storage.from("scans").remove([filePath]);
  }

  const { error } = await supabase
    .from("scans")
    .delete()
    .eq("id", scanId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/scans");
  return { success: true };
}

export async function getScanStats(): Promise<{
  totalScans: number;
  byTrimester: { first: number; second: number; third: number };
  recentScans: Scan[];
}> {
  const scansResult = await getScans();
  const scans = scansResult.data || [];

  const byTrimester = {
    first: scans.filter((s) => s.trimester === 1).length,
    second: scans.filter((s) => s.trimester === 2).length,
    third: scans.filter((s) => s.trimester === 3).length,
  };

  return {
    totalScans: scans.length,
    byTrimester,
    recentScans: scans.slice(0, 5),
  };
}
