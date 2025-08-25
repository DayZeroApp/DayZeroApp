import { Habit, HabitLog } from "@/utils/habits";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type Task = {
  id: string;
  title: string;
  done: boolean;
  // optional: remindAt?: string
};

const TASKS_KEY = "dayzero:tasks:v1";
const HABITS_KEY = "dayzero:habits:v1";
const LOGS_KEY = "dayzero:logs:v1";
const ONBOARDED_KEY = "dayzero:onboarded";

export async function loadTasks(): Promise<Task[]> {
  const raw = await AsyncStorage.getItem(TASKS_KEY);
  return raw ? (JSON.parse(raw) as Task[]) : [];
}
export async function saveTasks(tasks: Task[]) {
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
}

export async function loadHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABITS_KEY);
  return raw ? (JSON.parse(raw) as Habit[]) : [];
}

export async function saveHabits(habits: Habit[]) {
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function loadLogs(): Promise<HabitLog[]> {
  const raw = await AsyncStorage.getItem(LOGS_KEY);
  return raw ? (JSON.parse(raw) as HabitLog[]) : [];
}

export async function saveLogs(logs: HabitLog[]) {
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

export async function getOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(ONBOARDED_KEY)) === "true";
}
export async function setOnboarded() {
  await AsyncStorage.setItem(ONBOARDED_KEY, "true");
}
