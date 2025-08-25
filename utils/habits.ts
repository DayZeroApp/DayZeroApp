// utils/habits.ts

export type Mood = "great" | "ok" | "bad";

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
