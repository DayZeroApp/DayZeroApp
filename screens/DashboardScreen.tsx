// screens/DashboardScreen.tsx
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { SafeAreaView } from "react-native-safe-area-context";


import { cancelHabitNotifications, ensureNotificationSetup, rescheduleHabitNotifications, scheduleHabitNotifications } from "../lib/notifications";

import { useLogs } from "@/context/LogsProvider";
import { useTasks } from "@/context/TasksProvider";
import { useAuth } from "@/hooks/useAuth";
import AddHabitModal from "../components/AddHabitModal";
import HabitCard from "../components/HabitCard";
import LogHabitModal from "../components/LogHabitModal";
import { ThemedView } from "../components/ThemedView";
import { Mood, hasLoggedToday } from "../utils/habits";

// optional: dark calendar theme
const calendarTheme = {
  backgroundColor: '#000',
  calendarBackground: '#000',
  dayTextColor: '#fff',
  monthTextColor: '#fff',
  textDisabledColor: '#4b5563',
  selectedDayBackgroundColor: '#2563EB',
  selectedDayTextColor: '#fff',
  todayTextColor: '#60a5fa',
  arrowColor: '#9CA3AF',
  textSectionTitleColor: '#9CA3AF',
};

// helper to mark days with logs
const marksFromLogs = (logs: {date: string}[]) =>
  logs.reduce<Record<string, any>>((acc, l) => {
    acc[l.date] = { marked: true, dotColor: '#22c55e' };
    return acc;
  }, {});

export default function DashboardScreen(): React.JSX.Element {
  const router = useRouter();
  const [view, setView] = useState<"today"|"week"|"month">("today");
  const [selected, setSelected] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { tasks, hydrated, addTask, toggleTask, deleteTask } = useTasks();
  const { firstName, loading: authLoading } = useAuth();
  const { logs, addLog, setLogs } = useLogs();

  const shiftSelected = (days: number) => {
    const d = new Date(selected + 'T00:00:00'); // Ensure we're working with local time
    d.setDate(d.getDate() + days);
    setSelected(format(d, 'yyyy-MM-dd'));
  };
  const pretty = (dStr: string) => format(new Date(dStr), 'EEEE, MMM d');
  const resetToToday = () => setSelected(format(new Date(), 'yyyy-MM-dd'));
  
  const [addOpen, setAddOpen] = useState(false);
  const [logOpen, setLogOpen] = useState<{ open: boolean; habit?: any }>({
    open: false,
  });

  // state for edit
  const [editOpen, setEditOpen] = useState<{ open: boolean; habit?: any }>({ open: false });


  // Notification setup on mount
  useEffect(() => {
    (async () => {
      console.log('WEB ID:', process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.slice(0, 20));
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
    setLogs(logs.filter(l => l.habitId !== id));
    await cancelHabitNotifications(id);
  };

  // quick one-tap log from the card (no note, default mood)
  const quickLog = async (habit: any) => {
    if (hasLoggedToday(habit.id, logs)) return; // guard: already logged today
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addLog(habit.id, undefined, "great");
  };

  // modal submit (supports note + mood)
  const handleLogHabit = async (habit: any, note?: string, mood?: Mood) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    addLog(habit.id, note, mood);
  };

  // render from tasks; guard while hydrating
  if (!hydrated || authLoading) return <ThemedView><Text style={{color:"#fff"}}>Loading…</Text></ThemedView>;

  // Tasks for selected day
  const visibleTasks = tasks; 
  // later: filter by day if you add scheduling, e.g. tasks.filter(t => isDueOn(t, selected))

  return (
    <ThemedView style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <SafeAreaView edges={['top']}>
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
                {firstName || 'User'}  👋
              </Text>
            </View>
          </View>
        </SafeAreaView>

        {/* Segmented control: Today / Week / Month */}
        <View style={{ flexDirection:'row', marginBottom: 12, marginTop: 12 }}>
          {(['today','week','month'] as const).map((v, i) => {
            const active = view === v;
            const label = v === 'today' ? 'Day' : v === 'week' ? 'Week' : 'Month';
            return (
              <TouchableOpacity
                key={v}
                onPress={() => setView(v)}
                style={{
                  backgroundColor: active ? '#1E3A8A' : '#111827',
                  borderColor: active ? '#3B82F6' : '#1f2937',
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: i < 2 ? 8 : 0,
                }}
              >
                <Text style={{ color:'#fff', fontWeight: active ? '700' : '500' }}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Segmented control */}

        {/* Header for Today view (no full calendar) */}
        {view === 'today' && (
          <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => shiftSelected(-1)} style={{ padding: 8 }}>
              <Text style={{ color:'#9CA3AF', fontSize: 18 }}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={resetToToday}>
              <Text style={{ color:'#fff', fontSize:16, fontWeight:'700' }}>{pretty(selected)}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => shiftSelected(1)} style={{ padding: 8 }}>
              <Text style={{ color:'#9CA3AF', fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Week ribbon only for Week view (you already have this) */}
        {view === 'week' && (
          <View style={{ flexDirection:'row', justifyContent:'space-between', marginTop: 4, marginBottom: 8 }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const start = startOfWeek(new Date(selected), { weekStartsOn: 0 });
              const d = addDays(start, i);
              const key = format(d, 'yyyy-MM-dd');
              const active = key === selected;
              return (
                <TouchableOpacity key={key} onPress={() => setSelected(key)} style={{ alignItems:'center', flex:1 }}>
                  <Text style={{ color:'#9CA3AF', marginBottom: 4 }}>{format(d, 'EEE')}</Text>
                  <View style={{
                    backgroundColor: active ? '#2563EB' : '#111827',
                    borderWidth: 1,
                    borderColor: active ? '#3B82F6' : '#1f2937',
                    borderRadius: 10,
                    paddingVertical: 6,
                    marginHorizontal: 2,
                  }}>
                    <Text style={{ color:'#fff', textAlign:'center' }}>{format(d, 'd')}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Full month calendar only for Month view */}
        {view === 'month' && (
          <Calendar
            current={selected}
            onDayPress={(d) => setSelected(d.dateString)}
            markedDates={{ ...marksFromLogs(logs), [selected]: { selected: true, selectedColor: '#2563EB' } }}
            theme={calendarTheme}
            hideExtraDays
            disableAllTouchEventsForDisabledDays
            style={{ marginBottom: 8 }}
          />
        )}

        {/* Tasks for selected day */}
        <View style={{ marginTop: 16 }}>
          {(view === 'month' || view === 'week') && (
            <Text style={{ color:'#9CA3AF', marginBottom: 8 }}>
              {view === 'month'
                ? format(new Date(selected), 'MMMM yyyy')
                : `Week of ${format(startOfWeek(new Date(selected), { weekStartsOn: 0 }), 'MMM d')}`}
            </Text>
          )}

          {visibleTasks.length === 0 ? (
            <View style={{ alignItems:'center' }}>
              <Text style={{ color:'#6b7280', fontSize: 16, textAlign:'center'}}>
                No habits or goals yet for this day. Let's get started
              </Text>
              <Text style={{ color:'#6b7280', fontSize: 16, textAlign:'center', marginBottom: 50 }}>
               Let's get started
              </Text>
              <TouchableOpacity
                onPress={() => setAddOpen(true)}
                style={{
                  backgroundColor: '#2563EB',
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: '#3B82F6',
                }}
              >
                <Text style={{ color:'#fff', fontWeight:'700' }}>Add a habit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            visibleTasks.map((task) => (
              <HabitCard
                key={task.id}
                habit={task}
                // still show logs from the selected day
                logs={logs.filter(l => isSameDay(new Date(l.date), new Date(selected)))}
                onLog={(h) => setLogOpen({ open: true, habit: h })}
                onQuickLog={quickLog}
                onDetails={() => {}}
                onDelete={deleteHabit}
                onEdit={(h) => setEditOpen({ open: true, habit: h })}
              />
            ))
          )}
        </View>

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
