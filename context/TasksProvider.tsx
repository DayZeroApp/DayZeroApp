import { Habit } from "@/utils/habits";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// optional: import notifications helpers and call them inside add/toggle/delete

type Ctx = {
  tasks: Habit[];
  hydrated: boolean;
  addTask: (title: string, icon?: string, targetPerWeek?: number, targetTimes?: string[]) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const TasksCtx = createContext<Ctx | null>(null);

export function TasksProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Habit[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const refresh = useCallback(async () => {
    // In-memory storage - no persistence needed
    setHydrated(true);
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  // No persistence needed since we're using in-memory storage
  // useEffect(() => {
  //   if (!hydrated) return;
  //   void saveHabits(tasks);
  // }, [tasks, hydrated]);

  const addTask = useCallback(async (title: string, icon: string = "meditation", targetPerWeek: number = 5, targetTimes: string[] = ["08:00"]) => {
    const id = Math.random().toString(36).slice(2);
    const newHabit: Habit = {
      id,
      title,
      icon,
      targetPerWeek,
      targetTimes
    };
    setTasks(prev => [newHabit, ...prev]);
    // optional: schedule notification here
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    // For habits, we might want to track completion differently
    // For now, we'll just toggle a completion state if needed
    console.log("Toggle task:", id);
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    // optional: cancel notification here
  }, []);

  const value = useMemo(() => ({ tasks, hydrated, addTask, toggleTask, deleteTask, refresh }), [tasks, hydrated, addTask, toggleTask, deleteTask, refresh]);

  return <TasksCtx.Provider value={value}>{children}</TasksCtx.Provider>;
}

export function useTasks() {
  const ctx = useContext(TasksCtx);
  if (!ctx) throw new Error("useTasks must be used within TasksProvider");
  return ctx;
}
