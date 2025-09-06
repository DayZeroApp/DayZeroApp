// utils/habits.ts

export type Mood = "great" | "ok" | "bad" | "skip";

export type Habit = {
  id: string;
  title: string;
  icon: string;
  targetPerWeek: number;
  targetTimes?: string[];
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
  return new Date().toISOString().slice(0, 10);
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
  const logDate = new Date(date);
  
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