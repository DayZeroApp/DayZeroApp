import { ReactNode, createContext, useContext, useState } from 'react';
import { HabitLog, Mood, isoToday } from '../utils/habits';

interface LogsContextType {
  logs: HabitLog[];
  addLog: (habitId: string, note?: string, mood?: Mood) => void;
  setLogs: (logs: HabitLog[]) => void;
}

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export function LogsProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<HabitLog[]>([]);

  const addLog = (habitId: string, note?: string, mood?: Mood) => {
    const newLog: HabitLog = {
      id: Math.random().toString(36).slice(2),
      habitId,
      date: isoToday(),
      note,
      mood,
    };
    setLogs(prev => [newLog, ...prev]);
  };

  return (
    <LogsContext.Provider value={{ logs, addLog, setLogs }}>
      {children}
    </LogsContext.Provider>
  );
}

export function useLogs() {
  const context = useContext(LogsContext);
  if (context === undefined) {
    throw new Error('useLogs must be used within a LogsProvider');
  }
  return context;
}
