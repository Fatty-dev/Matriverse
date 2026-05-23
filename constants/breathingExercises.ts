export type BreathingExercise = {
  name: string;
  duration: string;
  durationMinutes: number;
  type: "Relaxation" | "Sleep Aid" | "Labor Prep" | "Stress Relief" | "Energy";
  typeKey: "relaxation" | "sleep_aid" | "labor_prep" | "stress_relief" | "energy";
  description: string;
  pattern: {
    inhale: number;
    hold?: number;
    exhale: number;
    holdAfterExhale?: number;
  };
  cycles: number;
};

export const breathingExercises: BreathingExercise[] = [
  {
    name: "Deep Belly Breathing",
    duration: "5 min",
    durationMinutes: 5,
    type: "Relaxation",
    typeKey: "relaxation",
    description: "Perfect for relaxation and connecting with your baby. Breathe deeply into your belly, feeling it expand and contract.",
    pattern: { inhale: 4, exhale: 6 },
    cycles: 10,
  },
  {
    name: "4-7-8 Breathing",
    duration: "8 min",
    durationMinutes: 8,
    type: "Sleep Aid",
    typeKey: "sleep_aid",
    description: "A natural tranquilizer for the nervous system. Inhale for 4, hold for 7, exhale for 8.",
    pattern: { inhale: 4, hold: 7, exhale: 8 },
    cycles: 8,
  },
  {
    name: "Labor Breathing Pattern",
    duration: "10 min",
    durationMinutes: 10,
    type: "Labor Prep",
    typeKey: "labor_prep",
    description: "Practice the breathing pattern for active labor. Slow, deep breaths to manage contractions.",
    pattern: { inhale: 3, exhale: 5 },
    cycles: 15,
  },
  {
    name: "Box Breathing",
    duration: "6 min",
    durationMinutes: 6,
    type: "Stress Relief",
    typeKey: "stress_relief",
    description: "Equal parts breathing for balance and calm. Inhale, hold, exhale, hold - all for 4 counts.",
    pattern: { inhale: 4, hold: 4, exhale: 4, holdAfterExhale: 4 },
    cycles: 10,
  },
  {
    name: "Pursed Lip Breathing",
    duration: "5 min",
    durationMinutes: 5,
    type: "Energy",
    typeKey: "energy",
    description: "Energizing breath to boost oxygen flow. Inhale through nose, exhale slowly through pursed lips.",
    pattern: { inhale: 2, exhale: 4 },
    cycles: 12,
  },
  {
    name: "Triangle Breathing",
    duration: "6 min",
    durationMinutes: 6,
    type: "Relaxation",
    typeKey: "relaxation",
    description: "Three-part breathing for calm and balance. Inhale, hold, exhale in equal measures.",
    pattern: { inhale: 4, hold: 4, exhale: 4 },
    cycles: 12,
  },
  {
    name: "Golden Thread Breathing",
    duration: "7 min",
    durationMinutes: 7,
    type: "Labor Prep",
    typeKey: "labor_prep",
    description: "Advanced labor technique with long, controlled exhale. Imagine breathing out through a thin golden thread.",
    pattern: { inhale: 3, exhale: 7 },
    cycles: 12,
  },
  {
    name: "Calming 5-5 Breath",
    duration: "5 min",
    durationMinutes: 5,
    type: "Stress Relief",
    typeKey: "stress_relief",
    description: "Simple and effective stress relief. Equal inhale and exhale for 5 counts each.",
    pattern: { inhale: 5, exhale: 5 },
    cycles: 10,
  },
  {
    name: "Extended Exhale",
    duration: "6 min",
    durationMinutes: 6,
    type: "Sleep Aid",
    typeKey: "sleep_aid",
    description: "Longer exhale activates the parasympathetic nervous system for deep relaxation and sleep.",
    pattern: { inhale: 3, exhale: 6 },
    cycles: 12,
  },
  {
    name: "Energizing Breath",
    duration: "4 min",
    durationMinutes: 4,
    type: "Energy",
    typeKey: "energy",
    description: "Quick, rhythmic breathing to boost energy and alertness. Short inhales and exhales.",
    pattern: { inhale: 2, exhale: 2 },
    cycles: 15,
  },
  {
    name: "Coherent Breathing",
    duration: "10 min",
    durationMinutes: 10,
    type: "Relaxation",
    typeKey: "relaxation",
    description: "Breathe at 5 breaths per minute for optimal heart-rate variability and deep calm.",
    pattern: { inhale: 6, exhale: 6 },
    cycles: 8,
  },
  {
    name: "Slow Labor Breathing",
    duration: "8 min",
    durationMinutes: 8,
    type: "Labor Prep",
    typeKey: "labor_prep",
    description: "Very slow, controlled breathing for early labor contractions. Focus on long, steady breaths.",
    pattern: { inhale: 4, exhale: 6 },
    cycles: 12,
  },
  {
    name: "Anxiety Relief Breathing",
    duration: "5 min",
    durationMinutes: 5,
    type: "Stress Relief",
    typeKey: "stress_relief",
    description: "Specific pattern to reduce anxiety and panic. Longer exhale calms the nervous system.",
    pattern: { inhale: 4, hold: 2, exhale: 6 },
    cycles: 10,
  },
];
