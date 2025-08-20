import React, { useMemo } from "react";
import { Text, View } from "react-native";
import { Habit, HabitLog, isCompletedLog, withinWeek } from "../utils/habits";

export default function WeeklyCompletionBarCard({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: HabitLog[];
}) {
  const { completed, target, pct } = useMemo(() => {
    const target = habits.reduce((sum, h) => sum + Math.max(1, h.targetPerWeek), 0);
    const completed = habits.reduce((sum, h) => {
      const c = logs.filter(
        (l) => l.habitId === h.id && withinWeek(l.date) && isCompletedLog(l)
      ).length;
      return sum + c;
    }, 0);
    const pct = Math.min(1, completed / Math.max(1, target));
    return { completed, target, pct };
  }, [habits, logs]);

  return (
    <View
      style={{
        backgroundColor: "#111827",
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: "#1f2937",
      }}
    >
      <Text style={{ color: "white", fontWeight: "700", marginBottom: 8 }}>
        Weekly completion
      </Text>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: "#1f2937", overflow: "hidden" }}>
        <View style={{ width: `${pct * 100}%`, height: 8, backgroundColor: "#60A5FA" }} />
      </View>
      <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 8 }}>
        {completed} / {target} targets reached ({Math.round(pct * 100)}%)
      </Text>
    </View>
  );
}
