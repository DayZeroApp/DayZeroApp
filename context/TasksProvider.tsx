import { createHabitLocal } from "@/lib/habits-local";
import { Local } from "@/lib/local";
import { localDayId } from "@/lib/time";
import { Habit } from "@/utils/habits";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// optional: import notifications helpers and call them inside add/toggle/delete

type Ctx = {
  tasks: Habit[];
  hydrated: boolean;
  addTask: (title: string, icon?: string, targetPerWeek?: number, targetTimes?: string[], opts?: { dayId?: string; tz?: string }) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const TasksCtx = createContext<Ctx | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    try {
      console.log('🔄 Loading habits from AsyncStorage...');
      const habits = await Local.getHabits();
      console.log('📦 Raw habits from storage:', habits);
      
      // Get timezone for migration
      const profile = await Local.getProfile();
      const tz = profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Migration: backfill missing createdDayId
      let changed = false;
      const migratedHabits = habits.map(h => {
        if (!('createdDayId' in h) || !h.createdDayId) {
          const dayFromCreatedAt = h.createdAt ? localDayId(tz, new Date(h.createdAt)) : localDayId(tz);
          changed = true;
          console.log(`🔄 Migrating habit ${h.id}: adding createdDayId=${dayFromCreatedAt}`);
          return { ...h, createdDayId: dayFromCreatedAt };
        }
        return h;
      });
      
      // Persist migrated habits if any changes
      if (changed) {
        console.log('💾 Saving migrated habits...');
        await Local.setHabits(migratedHabits);
      }
      
      // Convert from Local storage format to Habit format
      const convertedHabits: Habit[] = migratedHabits.map(h => ({
        id: h.id,
        title: h.title,
        icon: h.icon || '🧘‍♂️', // Use stored icon or default emoji
        targetPerWeek: h.targetPerWeek || 5, // Use stored value or default
        targetTimes: h.targetTimes || ['08:00'], // Use stored value or default
        createdAt: h.createdAt,
        updatedAt: h.updatedAt,
        createdDayId: h.createdDayId
      }));
      
      console.log('✅ Converted habits for UI:', convertedHabits);
      setTasks(convertedHabits);
      setHydrated(true);
    } catch (error) {
      console.error('❌ Failed to load habits:', error);
      setHydrated(true);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const addTask = useCallback(async (title: string, icon: string = "🧘‍♂️", targetPerWeek: number = 5, targetTimes: string[] = ["08:00"], opts?: { dayId?: string; tz?: string }) => {
    try {
      console.log('➕ Creating new habit:', { title, icon, targetPerWeek, targetTimes, opts });
      const id = await createHabitLocal(title, icon, targetPerWeek, targetTimes, opts);
      console.log('🆔 Generated habit ID:', id);
      
      // Determine timezone and createdDayId for the new habit
      const profile = await Local.getProfile();
      const tz = opts?.tz ?? profile?.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
      const createdDayId = opts?.dayId ?? localDayId(tz);
      
      const newHabit: Habit = {
        id,
        title,
        icon,
        targetPerWeek,
        targetTimes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        createdDayId
      };
      
      console.log('💾 Saving habit to AsyncStorage...');
      setTasks(prev => [newHabit, ...prev]);
      console.log('✅ Habit created and saved successfully!');
      // optional: schedule notification here
    } catch (error) {
      console.error('❌ Failed to create habit:', error);
    }
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    // For habits, we might want to track completion differently
    // For now, we'll just toggle a completion state if needed
    console.log("Toggle task:", id);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      const habits = await Local.getHabits();
      const updatedHabits = habits.filter(h => h.id !== id);
      await Local.setHabits(updatedHabits);
      setTasks(prev => prev.filter(t => t.id !== id));
      // optional: cancel notification here
    } catch (error) {
      console.error('Failed to delete habit:', error);
    }
  }, []);

  const value = useMemo(() => ({ tasks, hydrated, addTask, toggleTask, deleteTask, refresh }), [tasks, hydrated, addTask, toggleTask, deleteTask, refresh]);

  return <TasksCtx.Provider value={value}>{children}</TasksCtx.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksCtx);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
