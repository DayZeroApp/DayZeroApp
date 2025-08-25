// hooks/useTasks.ts
import { loadTasks, addTask as sAdd, deleteTask as sDel, toggleTask as sToggle, Task } from "@/lib/storage";
import { useCallback, useEffect, useState } from "react";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setTasks(await loadTasks());
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const addTask = useCallback(async (title: string) => {
    await sAdd(title);
    await refresh();
  }, [refresh]);

  const toggleTask = useCallback(async (id: string) => {
    await sToggle(id);
    await refresh();
  }, [refresh]);

  const deleteTask = useCallback(async (id: string) => {
    await sDel(id);
    await refresh();
  }, [refresh]);

  return { tasks, loading, addTask, toggleTask, deleteTask, refresh };
}
