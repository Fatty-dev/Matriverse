"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getSymptoms } from "./symptoms";
import { getScans } from "./scans";
import { getARStats, getARSessions } from "./ar-training";

export type Report = {
  id: string;
  user_id: string;
  report_type: "full_summary" | "symptoms_report" | "progress_report" | "scans_report" | "ar_training_report";
  title: string;
  description: string | null;
  date_from: string | null;
  date_to: string | null;
  file_url: string | null;
  file_size: number | null;
  report_data: any;
  created_at: string;
  updated_at: string;
};

export async function generateReport(
  reportType: Report["report_type"],
  dateFrom?: string,
  dateTo?: string
): Promise<{ success: boolean; message?: string; reportId?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  // Gather data based on report type
  let reportData: any = {};
  let title = "";

  try {
    switch (reportType) {
      case "full_summary":
        title = "Full Pregnancy Summary";
        const [symptomsResult, scansResult, arStats] = await Promise.all([
          getSymptoms(),
          getScans(),
          getARStats(),
        ]);

        reportData = {
          symptoms: symptomsResult.data || [],
          scans: scansResult.data || [],
          arTraining: arStats,
        };
        break;

      case "symptoms_report":
        title = "Symptoms Report";
        const symptoms = await getSymptoms();
        reportData = { symptoms: symptoms.data || [] };
        break;

      case "progress_report":
        title = "Progress Report";
        const progressStats = await getARStats();
        reportData = { arTraining: progressStats };
        break;

      case "scans_report":
        title = "Scans Summary";
        const scans = await getScans();
        reportData = { scans: scans.data || [] };
        break;

      case "ar_training_report":
        title = "AR Training Report";
        const arData = await getARStats();
        const sessions = await getARSessions();
        reportData = { stats: arData, sessions: sessions.data || [] };
        break;
    }

    // Save report to database (without file for now)
    const { data, error } = await supabase
      .from("reports")
      .insert({
        user_id: user.id,
        report_type: reportType,
        title,
        description: `Generated on ${new Date().toLocaleDateString()}`,
        date_from: dateFrom || null,
        date_to: dateTo || null,
        report_data: reportData,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath("/dashboard/reports");
    return { success: true, reportId: data.id };
  } catch (error) {
    return { success: false, message: "Failed to generate report" };
  }
}

export async function getReports(): Promise<{ success: boolean; data?: Report[] }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, data: [] };
  }

  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return { success: true, data: (reports as Report[]) || [] };
}

export async function deleteReport(reportId: string): Promise<{ success: boolean; message?: string }> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, message: "You must be logged in" };
  }

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", reportId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, message: error.message };
  }

  revalidatePath("/dashboard/reports");
  return { success: true };
}

export async function getReportStats(): Promise<{
  totalReports: number;
  byType: Record<string, number>;
  recentReports: Report[];
}> {
  const reportsResult = await getReports();
  const reports = reportsResult.data || [];

  const byType: Record<string, number> = {
    full_summary: 0,
    symptoms_report: 0,
    progress_report: 0,
    scans_report: 0,
    ar_training_report: 0,
  };

  reports.forEach((report) => {
    byType[report.report_type] = (byType[report.report_type] || 0) + 1;
  });

  return {
    totalReports: reports.length,
    byType,
    recentReports: reports.slice(0, 5),
  };
}
