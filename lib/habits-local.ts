// lib/habits-local.ts
import { Local } from '@/lib/local';
import { localDayId } from '@/lib/time';

export async function createHabitLocal(title: string, icon: string = 'meditation', targetPerWeek: number = 5, targetTimes: string[] = ['08:00'], opts?: { dayId?: string; tz?: string }) {
  const id = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const habits = await Local.getHabits();
  
  // Determine timezone and createdDayId
  const profile = await Local.getProfile();
  const tz = opts?.tz ?? profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const createdDayId = opts?.dayId ?? localDayId(tz);
  
  habits.push({ 
    id, 
    title, 
    icon,
    targetPerWeek,
    targetTimes,
    type: 'yes_no', 
    active: true, 
    streakCount: 0, 
    createdAt: Date.now(), 
    updatedAt: Date.now(),
    createdDayId
  });
  await Local.setHabits(habits);
  return id;
}

export async function setHabitTodayLocal(tz: string, habitId: string, value: 'yes'|'no'|'none' = 'yes') {
  const day = localDayId(tz);
  const log = await Local.getLog(day);
  log[habitId] = value;
  await Local.setLog(day, log);

  // naive streak increment (optional): recompute from last N days if you want
  const habits = await Local.getHabits();
  const idx = habits.findIndex(h => h.id === habitId);
  if (idx >= 0) {
    habits[idx].streakCount = value === 'yes' ? (habits[idx].streakCount ?? 0) + 1 : 0;
    habits[idx].updatedAt = Date.now();
    await Local.setHabits(habits);
  }
}
