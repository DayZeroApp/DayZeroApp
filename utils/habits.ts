// utils/habits.ts

export type Mood = "great" | "ok" | "hard" | "skip";

export type Habit = {
  id: string;
  title: string;
  icon: string;
  targetPerWeek: number;
  targetTimes?: string[];
  createdAt?: number;
  updatedAt?: number;
  createdDayId: string; // YYYY-MM-DD format
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // ISO date string
  note?: string;
  mood?: Mood;
};

// Helpers
export function isoToday(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function hasLoggedToday(habitId: string, logs: HabitLog[]): boolean {
  return logs.some(l => l.habitId === habitId && l.date === isoToday());
}

export function isCompletedLog(log: HabitLog): boolean {
  // A log is considered completed if it has a mood and the mood is not "skip"
  return log.mood !== undefined && log.mood !== "skip";
}

export function withinWeek(date: string): boolean {
  const today = new Date();
  const logDate = new Date(date + 'T00:00:00'); // Parse as local time
  
  // Get start of current week (Sunday)
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Get end of current week (Saturday)
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return logDate >= startOfWeek && logDate <= endOfWeek;
}

function prevDay(dayId: string): string {
  // dayId = "YYYY-MM-DD"
  const [y, m, d] = dayId.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().slice(0, 10); // "YYYY-MM-DD"
}

/**
 * Count consecutive completed days for a habit, ending today.
 * Assumes HabitLog.date uses the same format as isoToday() ("YYYY-MM-DD").
 * Updated to accept either a Habit object or habitId string for flexibility.
 */
export function calcStreak(habitOrId: Habit | string, logs: HabitLog[]): number {
  if (!Array.isArray(logs) || logs.length === 0) return 0;

  // Extract habitId from either Habit object or string
  const habitId = typeof habitOrId === 'string' ? habitOrId : habitOrId.id;

  // Build a Set of completed dayIds for this habit
  const doneDays = new Set(
    logs
      .filter(l => l.habitId === habitId && isCompletedLog(l))
      .map(l => l.date)
  );

  // Count backwards from today until a day is missing
  let count = 0;
  let day = isoToday();
  while (doneDays.has(day)) {
    count += 1;
    day = prevDay(day);
  }
  return count;
}

/** Optional: how many completed this week (Sun–Sat) */
export function weekCompletions(habitId: string, logs: HabitLog[]): number {
  return logs.filter(l => l.habitId === habitId && isCompletedLog(l) && withinWeek(l.date)).length;
}

/**
 * Calculate progress for a habit this week
 * Returns both the count of completed logs and the percentage of target achieved
 */
export function calcProgress(habit: Habit, logs: HabitLog[]): { count: number; pct: number } {
  // Count completed logs for this habit within the current week
  const completedThisWeek = logs.filter(l => 
    l.habitId === habit.id && 
    isCompletedLog(l) && 
    withinWeek(l.date)
  ).length;
  
  // Calculate percentage of weekly target achieved
  const percentage = habit.targetPerWeek > 0 ? completedThisWeek / habit.targetPerWeek : 0;
  
  return {
    count: completedThisWeek,
    pct: Math.min(percentage, 1) // Cap at 100%
  };
}