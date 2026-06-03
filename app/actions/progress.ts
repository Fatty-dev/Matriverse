"use server";

import { getProfile } from "@/app/actions/profile";
import { getARStats } from "@/app/actions/ar-training";
import { getMoodStats } from "@/app/actions/mood";
import { getBreathingStats } from "@/app/actions/breathing";
import { getSymptoms } from "@/app/actions/symptoms";

export type ProgressMilestone = {
  week: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
};

export type ProgressAchievement = {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  dateLabel: string | null;
};

export type ProgressSummary = {
  currentWeek: number | null;
  daysToDue: number | null;
  trimester: number | null;
  pregnancyPercent: number;
  stats: {
    trainingSessions: number;
    totalReps: number;
    avgFormScore: number;
    breathingMinutes: number;
    breathingSessions: number;
    moodCheckIns: number;
    moodStreak: number;
    symptomsLogged: number;
  };
  milestones: ProgressMilestone[];
  achievements: ProgressAchievement[];
  hasDueDate: boolean;
};

const MILESTONE_DEFS = [
  { week: 12, title: "First Trimester Complete", description: "Major development milestones reached" },
  { week: 20, title: "Halfway Point", description: "You're at the midpoint of pregnancy" },
  { week: 28, title: "Third Trimester Begins", description: "Time to focus on labour preparation" },
  { week: 32, title: "Growing Strong", description: "Baby is gaining weight rapidly" },
  { week: 37, title: "Early Term", description: "Baby is considered early term" },
  { week: 40, title: "Due Date", description: "Your estimated due date" },
];

function calculatePregnancyWeek(dueDate: string | null | undefined): {
  currentWeek: number | null;
  daysToDue: number | null;
  trimester: number | null;
} {
  if (!dueDate) {
    return { currentWeek: null, daysToDue: null, trimester: null };
  }

  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const daysToDue = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  const weeksRemaining = Math.ceil(daysToDue / 7);
  const currentWeek = Math.max(1, Math.min(42, 40 - weeksRemaining));

  let trimester = 1;
  if (currentWeek > 12) trimester = 2;
  if (currentWeek > 26) trimester = 3;

  return { currentWeek, daysToDue, trimester };
}

function buildMilestones(currentWeek: number | null): ProgressMilestone[] {
  if (!currentWeek) {
    return MILESTONE_DEFS.map((m) => ({
      ...m,
      completed: false,
      current: false,
    }));
  }

  return MILESTONE_DEFS.map((m, i) => {
    const nextWeek = MILESTONE_DEFS[i + 1]?.week ?? 42;
    const completed = m.week < currentWeek;
    const current = m.week <= currentWeek && nextWeek > currentWeek;
    return { ...m, completed, current };
  });
}

function buildAchievements(
  ar: Awaited<ReturnType<typeof getARStats>>,
  mood: Awaited<ReturnType<typeof getMoodStats>>,
  breathing: Awaited<ReturnType<typeof getBreathingStats>>,
  symptomCount: number
): ProgressAchievement[] {
  return [
    {
      id: "first-training",
      name: "First AR Session",
      description: "Complete your first guided squat session",
      unlocked: ar.totalSessions >= 1,
      dateLabel: ar.totalSessions >= 1 ? "Unlocked" : null,
    },
    {
      id: "rep-10",
      name: "10 Reps Strong",
      description: "Complete 10 reps across AR sessions",
      unlocked: ar.totalReps >= 10,
      dateLabel: ar.totalReps >= 10 ? `${ar.totalReps} reps` : null,
    },
    {
      id: "form-star",
      name: "Form Focus",
      description: "Average form score of 80+ across sessions",
      unlocked: ar.avgFormScore >= 80 && ar.totalSessions >= 1,
      dateLabel: ar.avgFormScore >= 80 ? `${ar.avgFormScore}% avg` : null,
    },
    {
      id: "breathing",
      name: "Breathing Practice",
      description: "Log 15+ minutes of breathing exercises",
      unlocked: breathing.totalMinutes >= 15,
      dateLabel: breathing.totalMinutes >= 15 ? `${breathing.totalMinutes} min` : null,
    },
    {
      id: "mood-streak",
      name: "Mood Streak",
      description: "Log your mood 3 days in a row",
      unlocked: mood.streak >= 3,
      dateLabel: mood.streak >= 3 ? `${mood.streak} day streak` : null,
    },
    {
      id: "mood-logger",
      name: "Mood Logger",
      description: "Record 7 mood check-ins",
      unlocked: mood.totalEntries >= 7,
      dateLabel: mood.totalEntries >= 7 ? `${mood.totalEntries} entries` : null,
    },
    {
      id: "symptoms",
      name: "Symptom Tracker",
      description: "Log symptoms 5 times",
      unlocked: symptomCount >= 5,
      dateLabel: symptomCount >= 5 ? `${symptomCount} logged` : null,
    },
    {
      id: "sessions-5",
      name: "Dedicated Practice",
      description: "Complete 5 AR training sessions",
      unlocked: ar.totalSessions >= 5,
      dateLabel: ar.totalSessions >= 5 ? `${ar.totalSessions} sessions` : null,
    },
  ];
}

export async function getProgressSummary(): Promise<ProgressSummary> {
  const [profile, arStats, moodStats, breathingStats, symptomsResult] = await Promise.all([
    getProfile(),
    getARStats(),
    getMoodStats(),
    getBreathingStats(),
    getSymptoms(),
  ]);

  const { currentWeek, daysToDue, trimester } = calculatePregnancyWeek(profile?.due_date);
  const symptomCount = symptomsResult.data?.length ?? 0;
  const pregnancyPercent = currentWeek ? Math.min(100, Math.round((currentWeek / 40) * 100)) : 0;

  return {
    currentWeek,
    daysToDue,
    trimester,
    pregnancyPercent,
    hasDueDate: Boolean(profile?.due_date),
    stats: {
      trainingSessions: arStats.totalSessions,
      totalReps: arStats.totalReps,
      avgFormScore: arStats.avgFormScore,
      breathingMinutes: breathingStats.totalMinutes,
      breathingSessions: breathingStats.totalSessions,
      moodCheckIns: moodStats.totalEntries,
      moodStreak: moodStats.streak,
      symptomsLogged: symptomCount,
    },
    milestones: buildMilestones(currentWeek),
    achievements: buildAchievements(arStats, moodStats, breathingStats, symptomCount),
  };
}
