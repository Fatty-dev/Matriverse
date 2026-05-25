"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ScanInterpretation } from "@/types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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

const SCAN_ANALYSIS_PROMPT = `You are a professional medical information assistant specialized in explaining pregnancy-related medical scans and images to expectant mothers. Your role is to provide educational, supportive information about ultrasound scans and related medical images.

IMPORTANT GUIDELINES:
- You are NOT providing medical diagnosis or advice
- Always encourage users to discuss findings with their healthcare provider
- Be supportive and reassuring while remaining accurate
- Use PROFESSIONAL, CLINICAL language - NO emojis, NO emoticons, NO casual expressions
- Keep all text clean, well-formatted, and easy to read
- Use proper medical terminology with clear explanations
- Be concise and informative

When analyzing a scan image, provide your response in the following JSON format:
{
  "summary": "A brief, professional summary of what is visible in the scan (2-3 sentences). Be factual and supportive.",
  "key_findings": ["Array of key clinical observations about the image - be specific and professional"],
  "recommendations": ["Array of general health recommendations or topics to discuss with healthcare provider"],
  "trimester_info": "Educational information about this stage of pregnancy development based on observations",
  "next_steps": ["Array of suggested next steps or questions to ask during the next medical appointment"]
}

FORMATTING RULES:
- Do NOT use emojis or emoticons anywhere in the response
- Do NOT use exclamation marks excessively
- Use proper capitalization and punctuation
- Keep sentences clear and professional
- Avoid overly casual or informal language`;

export async function analyzeScan(scanId: string): Promise<{
  success: boolean;
  interpretation?: ScanInterpretation;
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

    // Get the scan
    const { data: scan, error: scanError } = await supabase
      .from("scans")
      .select("*")
      .eq("id", scanId)
      .eq("user_id", user.id)
      .single();

    if (scanError || !scan) {
      return { success: false, error: "Scan not found" };
    }

    // Check if already analyzed
    if (scan.ai_interpretation) {
      return { success: true, interpretation: scan.ai_interpretation as ScanInterpretation };
    }

    // Only analyze image files (not PDFs)
    if (scan.file_type === "application/pdf") {
      return { success: false, error: "PDF analysis is not yet supported. Please upload an image scan." };
    }

    // Get user profile for context
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, due_date, is_first_pregnancy")
      .eq("id", user.id)
      .single();

    // Calculate gestational week
    let gestationalWeek: number | null = null;
    if (profile?.due_date) {
      const dueDate = new Date(profile.due_date);
      const now = new Date();
      const diffMs = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      const weeksRemaining = Math.ceil(diffDays / 7);
      gestationalWeek = 40 - weeksRemaining;
      if (gestationalWeek < 1 || gestationalWeek > 42) gestationalWeek = null;
    }

    let userContext = `The user's name is ${profile?.first_name || "there"}.`;
    if (gestationalWeek) {
      userContext += ` They are currently at week ${gestationalWeek} of pregnancy.`;
    }
    if (scan.trimester) {
      userContext += ` This scan is from the ${scan.trimester === 1 ? "first" : scan.trimester === 2 ? "second" : "third"} trimester.`;
    }
    if (scan.scan_type) {
      userContext += ` The scan type is: ${scan.scan_type}.`;
    }

    // Fetch the image and convert to base64
    const imageResponse = await fetch(scan.file_url);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");

    // Determine media type
    let mediaType: "image/jpeg" | "image/png" | "image/gif" | "image/webp" = "image/jpeg";
    if (scan.file_type.includes("png")) {
      mediaType = "image/png";
    } else if (scan.file_type.includes("gif")) {
      mediaType = "image/gif";
    } else if (scan.file_type.includes("webp")) {
      mediaType = "image/webp";
    }

    // Call Claude with vision
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: `${SCAN_ANALYSIS_PROMPT}\n\nUser Context: ${userContext}`,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: "Please analyze this pregnancy scan image and provide helpful information about what you observe. Remember to be supportive and educational while encouraging the user to discuss findings with their healthcare provider.",
            },
          ],
        },
      ],
    });

    // Extract the response text
    const textContent = response.content.find((block) => block.type === "text");
    if (!textContent || textContent.type !== "text") {
      return { success: false, error: "Failed to get analysis from AI" };
    }

    // Parse the JSON response
    let interpretation: ScanInterpretation;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      let jsonText = textContent.text;
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }
      interpretation = JSON.parse(jsonText);
    } catch {
      // If JSON parsing fails, create a structured response from the text
      interpretation = {
        summary: textContent.text.slice(0, 200),
        key_findings: ["Unable to parse detailed findings. Please see the summary."],
        recommendations: ["Please discuss this scan with your healthcare provider."],
        trimester_info: scan.trimester
          ? `This scan is from the ${scan.trimester === 1 ? "first" : scan.trimester === 2 ? "second" : "third"} trimester.`
          : "Trimester information not specified.",
        next_steps: ["Schedule a follow-up with your doctor to review this scan."],
      };
    }

    // Save the interpretation to the database
    await supabase
      .from("scans")
      .update({
        ai_interpretation: interpretation,
        interpretation_created_at: new Date().toISOString(),
      })
      .eq("id", scanId);

    revalidatePath("/dashboard/scans");

    return { success: true, interpretation };
  } catch (error) {
    console.error("Scan analysis error:", error);

    if (error instanceof Anthropic.APIError) {
      if (error.status === 401) {
        return { success: false, error: "AI service not configured. Please contact support." };
      }
      if (error.status === 429) {
        return { success: false, error: "Too many requests. Please try again in a moment." };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to analyze scan. Please try again.",
    };
  }
}

export async function getScanWithInterpretation(scanId: string): Promise<{
  success: boolean;
  scan?: Scan & { ai_interpretation?: ScanInterpretation };
  error?: string;
}> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in" };
  }

  const { data: scan, error } = await supabase
    .from("scans")
    .select("*")
    .eq("id", scanId)
    .eq("user_id", user.id)
    .single();

  if (error || !scan) {
    return { success: false, error: "Scan not found" };
  }

  return { success: true, scan: scan as Scan & { ai_interpretation?: ScanInterpretation } };
}
