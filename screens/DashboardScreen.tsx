// screens/DashboardScreen.tsx
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import * as ReactNav from "react"; // alias for callback
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { cancelHabitNotifications, ensureNotificationSetup, rescheduleHabitNotifications, scheduleHabitNotifications } from "../lib/notifications";
import { getOnboarded, loadLogs, saveLogs } from "../lib/storage";

import { useTasks } from "@/context/TasksProvider";
import AddHabitModal from "../components/AddHabitModal";
import HabitCard from "../components/HabitCard";
import LogHabitModal from "../components/LogHabitModal";
import { ThemedView } from "../components/ThemedView";
import { HabitLog, Mood, hasLoggedToday, isoToday } from "../utils/habits";
import ProgressTab from "./ProgressTab";
import ReflectionTab from "./ReflectionTab";

export default function DashboardScreen(): React.JSX.Element {
  const [tab, setTab] = useState<"dashboard"|"progress"|"reflection">("dashboard");
  const { tasks, hydrated, addTask, toggleTask, deleteTask } = useTasks();
  const [logs, setLogs] = useState<HabitLog[]>([]);
  
  const [addOpen, setAddOpen] = useState(false);
  const [logOpen, setLogOpen] = useState<{ open: boolean; habit?: any }>({
    open: false,
  });

  // state for edit
  const [editOpen, setEditOpen] = useState<{ open: boolean; habit?: any }>({ open: false });

  // Hydrate logs when screen focuses (coming from onboarding, etc.)
  useFocusEffect(
    ReactNav.useCallback(() => {
      let active = true;
      (async () => {
        const onboarded = await getOnboarded();
        const l = await loadLogs();
        if (!active) return;

        setLogs(l ?? []);
      })();
      return () => { active = false; };
    }, [])
  );

  // Persist logs ONLY after hydration
  useEffect(() => {
    if (!hydrated) return;               // 👈 guard
    saveLogs(logs);
  }, [logs, hydrated]);

  // Notification setup on mount
  useEffect(() => {
    (async () => {
      await ensureNotificationSetup();
      // Optional: reschedule on launch to be safe (if you persist habits)
      // await rescheduleAll(tasks);
    })();
  }, []);

  // --- CRUD handlers ---
  // ADD
  const handleAddHabit = async (p: { title: string; icon: string; targetPerWeek: number; targetTimes?: string[] }) => {
    await addTask(p.title, p.icon, p.targetPerWeek, p.targetTimes);

    // schedule reminders for the new habit
    const newHabit = { id: Math.random().toString(36).slice(2), ...p };
    await scheduleHabitNotifications(newHabit);
  };

  // EDIT
  const handleEditHabit = async (id: string, p: { title: string; icon: string; targetPerWeek: number; targetTimes?: string[] }) => {
    // TODO: Implement edit functionality in TasksProvider
    // For now, we'll delete and recreate
    await deleteTask(id);
    await addTask(p.title, p.icon, p.targetPerWeek, p.targetTimes);
    
    const updated = { id, ...p };
    await rescheduleHabitNotifications(updated);
  };

  // DELETE
  const deleteHabit = async (id: string) => {
    await deleteTask(id);
    setLogs(prev => prev.filter(l => l.habitId !== id));
    await cancelHabitNotifications(id);
  };

  // quick one-tap log from the card (no note, default mood)
  const quickLog = async (habit: any) => {
    if (hasLoggedToday(habit.id, logs)) return; // guard: already logged today
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLogs((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        habitId: habit.id,
        date: isoToday(),
        mood: "great",
      },
      ...prev,
    ]);
  };

  // modal submit (supports note + mood)
  const handleLogHabit = async (habit: any, note?: string, mood?: Mood) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLogs((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        habitId: habit.id,
        date: isoToday(),
        note,
        mood,
      },
      ...prev,
    ]);
  };

  // render from tasks; guard while hydrating
  if (!hydrated) return <ThemedView><Text style={{color:"#fff"}}>Loading…</Text></ThemedView>;

  return (
    <ThemedView style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Tab Navigation */}
        <View style={{ flexDirection: "row", marginBottom: 8, marginTop: 20 }}>
          {(["dashboard","progress","reflection"] as const).map((t, idx) => {
            const active = tab === t;
            const label = t === "dashboard" ? "Dashboard" : t === "progress" ? "Progress" : "Reflection";
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTab(t)}
                style={{
                  backgroundColor: active ? "#1E3A8A" : "#111827",
                  borderColor: active ? "#3B82F6" : "#1f2937",
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: idx < 2 ? 8 : 0, // replace 'gap'
                }}
              >
                <Text style={{ color: "white", fontWeight: active ? "700" : "500" }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 0,
            marginBottom: 12,
          }}
        >
          <View>
            <Text style={{ color: "#9CA3AF", fontSize: 14 }}>Welcome back,</Text>
            <Text style={{ color: "white", fontSize: 22, fontWeight: "bold" }}>
              James 👋
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              // TODO: Navigate to settings
              console.log("Settings pressed");
            }}
            style={{
              backgroundColor: "#1F2937",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <Ionicons name="settings-outline" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {tab === "dashboard" && (
          <View style={{ marginVertical: 20 }}>
            {tasks.map((task) => (
              <HabitCard
                key={task.id}
                habit={task}
                logs={logs}
                onLog={(h) => setLogOpen({ open: true, habit: h })}
                onQuickLog={quickLog}
                onDetails={() => {
                  // TODO: push details screen
                }}
                onDelete={deleteHabit}
                onEdit={(h) => setEditOpen({ open: true, habit: h })}
              />
            ))}
          </View>
        )}
        {tab === "progress" && (
          <ProgressTab habits={tasks} logs={logs} />
        )}
        {tab === "reflection" && (
          <ReflectionTab habits={tasks} logs={logs} />
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        onPress={() => setAddOpen(true)}
        style={{
          position: "absolute",
          right: 24,
          bottom: 32,
          backgroundColor: "#2563EB",
          width: 56,
          height: 56,
          borderRadius: 28,
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#2563EB",
          shadowOpacity: 0.4,
          shadowRadius: 10,
        }}
      >
        <Text style={{ color: "white", fontSize: 28, lineHeight: 28 }}>＋</Text>
      </TouchableOpacity>

      {/* Modals */}
      <AddHabitModal
        visible={addOpen}
        onClose={() => setAddOpen(false)}
        onSubmit={handleAddHabit}
      />

      {/* Edit habit */}
      <AddHabitModal
        visible={editOpen.open}
        onClose={() => setEditOpen({ open: false })}
        initial={editOpen.habit ? {
          title: editOpen.habit.title,
          icon: editOpen.habit.icon,
          targetPerWeek: editOpen.habit.targetPerWeek,
          targetTimes: editOpen.habit.targetTimes ?? [],
        } : undefined}
        onSubmit={(data) => {
          if (editOpen.habit) handleEditHabit(editOpen.habit.id, data);
        }}
      />

      <LogHabitModal
        visible={logOpen.open}
        onClose={() => setLogOpen({ open: false })}
        habitTitle={logOpen.habit?.title ?? ""}
        onSubmit={(note, mood) =>
          logOpen.habit && handleLogHabit(logOpen.habit, note, mood)
        }
      />
    </ThemedView>
  );
}
