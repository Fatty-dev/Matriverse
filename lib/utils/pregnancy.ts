// Calculate EDD from LMP (Last Menstrual Period)
// Formula: EDD = LMP + 280 days (Naegele's rule)
export function calculateEDDFromLMP(lmpDate: string): string {
  const lmp = new Date(lmpDate);
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280);
  return edd.toISOString().split('T')[0];
}

// Calculate current pregnancy week from due date
export function calculateCurrentWeek(dueDate: string): number | null {
  const due = new Date(dueDate);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const weeksRemaining = Math.ceil(diffDays / 7);
  const currentWeek = 40 - weeksRemaining;
  return currentWeek > 0 && currentWeek <= 42 ? currentWeek : null;
}

// Calculate trimester from week
export function getTrimester(week: number): number {
  if (week <= 12) return 1;
  if (week <= 26) return 2;
  return 3;
}
