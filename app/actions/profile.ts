"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

// Validation schema for step 2
const Step2Schema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  phone: z.string().min(1, { message: "Phone number is required" }),
  dateOfBirth: z.string().min(1, { message: "Date of birth is required" }),
  partnerName: z.string().optional(),
  emergencyContactName: z.string().min(1, { message: "Emergency contact name is required" }),
  emergencyContactPhone: z.string().min(1, { message: "Emergency contact phone is required" }),
  emergencyContactRelationship: z.string().min(1, { message: "Please select a relationship" }),
});

// Validation schema for step 3
const Step3Schema = z.object({
  dueDate: z.string().min(1, { message: "Due date is required" }),
  lastMenstrualPeriod: z.string().optional(),
  isFirstPregnancy: z.enum(["yes", "no"], {
    message: "Please select an option",
  }),
  medicalHistory: z.string().optional(),
  referralSource: z.string().optional(),
  terms: z.literal("on", { message: "You must accept the terms" }),
});

export type ProfileState = {
  errors?: Record<string, string[]>;
  message?: string;
} | null;

export async function updateProfileStep2(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const validatedFields = Step2Schema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    phone: formData.get("phone"),
    dateOfBirth: formData.get("dateOfBirth"),
    partnerName: formData.get("partnerName"),
    emergencyContactName: formData.get("emergencyContactName"),
    emergencyContactPhone: formData.get("emergencyContactPhone"),
    emergencyContactRelationship: formData.get("emergencyContactRelationship"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const {
    firstName,
    lastName,
    phone,
    dateOfBirth,
    partnerName,
    emergencyContactName,
    emergencyContactPhone,
    emergencyContactRelationship,
  } = validatedFields.data;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      date_of_birth: dateOfBirth,
      partner_name: partnerName || null,
      emergency_contact_name: emergencyContactName,
      emergency_contact_phone: emergencyContactPhone,
      emergency_contact_relationship: emergencyContactRelationship,
    })
    .eq("id", user.id);

  if (error) {
    return {
      message: error.message,
    };
  }

  revalidatePath("/", "layout");
  redirect("/signup/step-3");
}

export async function updateProfileStep3(
  prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const validatedFields = Step3Schema.safeParse({
    dueDate: formData.get("dueDate"),
    lastMenstrualPeriod: formData.get("lastMenstrualPeriod"),
    isFirstPregnancy: formData.get("firstPregnancy"),
    medicalHistory: formData.get("medicalHistory"),
    referralSource: formData.get("referralSource"),
    terms: formData.get("terms"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { dueDate, lastMenstrualPeriod, isFirstPregnancy, medicalHistory, referralSource } = validatedFields.data;

  // Parse medical history JSON
  let parsedMedicalHistory: { condition: string; selected: boolean }[] = [];
  if (medicalHistory) {
    try {
      const conditions = JSON.parse(medicalHistory) as string[];
      parsedMedicalHistory = conditions.map(condition => ({
        condition,
        selected: true,
      }));
    } catch {
      // If parsing fails, leave it empty
    }
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      due_date: dueDate,
      last_menstrual_period: lastMenstrualPeriod || null,
      is_first_pregnancy: isFirstPregnancy === "yes",
      medical_history: parsedMedicalHistory,
      referral_source: referralSource || null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return {
      message: error.message,
    };
  }

  // After onboarding, redirect to scan upload page instead of login
  revalidatePath("/", "layout");
  redirect("/dashboard/scans?onboarding=true");
}

export async function getProfile() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function markScanUploaded() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not authenticated" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ has_uploaded_scan: true })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  return { success: true };
}
