export const MATRIVERSE_COACH_NAME = "MatriVerse Coach";

// Get week-specific recommendation
function getWeekRecommendation(week: number | null): string {
  if (!week) return "";

  if (week <= 4) {
    return `\n\nAt week ${week}, I recommend focusing on gentle breathing exercises and staying well hydrated. This is a great time to establish healthy habits.`;
  } else if (week <= 8) {
    return `\n\nAt week ${week}, try light walking and pelvic floor exercises. Small, frequent meals can help with any nausea you may be experiencing.`;
  } else if (week <= 12) {
    return `\n\nAt week ${week}, continue gentle exercises and start tracking your symptoms regularly. The MatriVerse symptom tracker can help with this.`;
  } else if (week <= 16) {
    return `\n\nAt week ${week}, this is a great time to start using the AR Trainer for squats and positioning exercises. Your energy levels should be improving!`;
  } else if (week <= 20) {
    return `\n\nAt week ${week}, focus on posture exercises and hip-opening stretches. Try side-lying positions for better sleep.`;
  } else if (week <= 26) {
    return `\n\nAt week ${week}, I recommend watching the labour preparation videos and practicing with the birthing ball. You can also start learning about perineal massage.`;
  } else if (week <= 30) {
    return `\n\nAt week ${week}, it's time to practice labour breathing techniques and birth positions in the AR Trainer. Have you started thinking about your hospital bag?`;
  } else if (week <= 34) {
    return `\n\nAt week ${week}, intensify your breathing exercises and try the Labour Rehearsal mode. Remember to monitor your baby's movements regularly.`;
  } else if (week <= 38) {
    return `\n\nAt week ${week}, focus on final labour preparation and relaxation techniques. Review your birth plan and conserve your energy for the big day.`;
  } else {
    return `\n\nAt week ${week}, you're almost there! Stay active with gentle walks, practice all the techniques you've learned, and stay calm. Your baby will arrive soon!`;
  }
}

export function getMatriverseWelcomeMessage(firstName: string, currentWeek?: number | null): string {
  const baseMessage = `Hello ${firstName}, I'm your ${MATRIVERSE_COACH_NAME}. I'm here to support you through pregnancy with guidance on movement, breathing, wellbeing, and preparing for labour.`;
  const weekRecommendation = getWeekRecommendation(currentWeek ?? null);
  const disclaimer = `\n\nAsk me anything — and remember that for medical concerns you should always speak with your midwife or doctor.`;

  return baseMessage + weekRecommendation + disclaimer;
}

export const SUGGESTED_COACH_QUESTIONS = [
  "What exercises should I do this week?",
  "How do I use breathing exercises for labour prep?",
  "What helps with sleep in the third trimester?",
  "When should I contact my midwife?",
  "Gentle ways to ease back pain during pregnancy",
];
