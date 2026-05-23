import { TOTAL_PREGNANCY_WEEKS, TRIMESTER_1_END, TRIMESTER_2_END } from "@/constants";

// Calculate days until due date
export function daysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

// Calculate gestational age from due date
export function calculateGestationalAge(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = due.getTime() - today.getTime();
  const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
  return TOTAL_PREGNANCY_WEEKS - diffWeeks;
}

// Get current trimester
export function getCurrentTrimester(gestationalAge: number): 1 | 2 | 3 {
  if (gestationalAge <= TRIMESTER_1_END) return 1;
  if (gestationalAge <= TRIMESTER_2_END) return 2;
  return 3;
}

// Format date
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Format time
export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Get greeting based on time of day
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

// Classnames helper
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Truncate text
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}
