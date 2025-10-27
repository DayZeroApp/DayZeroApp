// context/LogsProvider.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { HabitLog, Mood, isoToday } from "../utils/habits";

interface LogsContextType {
  logs: HabitLog[];
  addLog: (habitId: string, note?: string, mood?: Mood, date?: string) => Promise<void>;
  setLogs: (logs: HabitLog[]) => void;
  hydrated: boolean;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export function LogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<HabitLog[]>([]);
  const [hydrated, setHydrated] = useState(false);

  const STORAGE_KEY = "dayzero:logs";

  // --- Load logs from AsyncStorage on mount ---
  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setLogs(JSON.parse(saved));
      } catch (e) {
        console.warn("Failed to load logs:", e);
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  // --- Save logs whenever they change ---
  useEffect(() => {
    if (!hydrated) return; // avoid saving before hydration
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs)).catch((e) =>
      console.warn("Failed to save logs:", e)
    );
  }, [logs, hydrated]);

  // --- Add new log ---
  const addLog = async (habitId: string, note?: string, mood?: Mood, date?: string) => {
    const newLog: HabitLog = {
      id: Math.random().toString(36).slice(2),
      habitId,
      date: date || isoToday(),
      note,
      mood,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  return (
    <LogsContext.Provider value={{ logs, addLog, setLogs, hydrated }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogsContext);
  if (context === undefined) {
    throw new Error("useLogs must be used within a LogsProvider");
  }
  return context;
}
