// hooks/useTasks.ts
import { useCallback, useEffect, useState } from "react";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  // optional: remindAt?: string
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    // In-memory storage - no persistence needed
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addTask = useCallback(async (title: string) => {
    const id = Math.random().toString(36).slice(2);
    const newTask: Task = { id, title, done: false };
    setTasks(prev => [newTask, ...prev]);
  }, []);

  const toggleTask = useCallback(async (id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, done: !task.done } : task
    ));
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  return { tasks, loading, addTask, toggleTask, deleteTask, refresh };
}
