export const MATRIVERSE_COACH_NAME = "MatriVerse Coach";

export function getMatriverseWelcomeMessage(firstName: string): string {
  return `Hello ${firstName}, I'm your ${MATRIVERSE_COACH_NAME}. I'm here to support you through pregnancy with guidance on movement, breathing, wellbeing, and preparing for labour. Ask me anything — and remember that for medical concerns you should always speak with your midwife or doctor.`;
}

export const SUGGESTED_COACH_QUESTIONS = [
  "What can I practice in the AR trainer this week?",
  "How do I use breathing exercises for labour prep?",
  "What helps with sleep in the third trimester?",
  "When should I contact my midwife?",
  "Gentle ways to ease back pain during pregnancy",
];
