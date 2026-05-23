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
});

// Validation schema for step 3
const Step3Schema = z.object({
  dueDate: z.string().min(1, { message: "Due date is required" }),
  isFirstPregnancy: z.enum(["yes", "no"], {
    message: "Please select an option",
  }),
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
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { firstName, lastName, phone, dateOfBirth } = validatedFields.data;

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
    isFirstPregnancy: formData.get("firstPregnancy"),
    referralSource: formData.get("referralSource"),
    terms: formData.get("terms"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { dueDate, isFirstPregnancy, referralSource } = validatedFields.data;

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
      is_first_pregnancy: isFirstPregnancy === "yes",
      referral_source: referralSource || null,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    return {
      message: error.message,
    };
  }

  // Sign out after completing registration - user must login to access dashboard
  await supabase.auth.signOut();

  revalidatePath("/", "layout");
  redirect("/login?registered=true");
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
