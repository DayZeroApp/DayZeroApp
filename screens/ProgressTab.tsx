import React, { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import StreakCalendarDots from "../components/StreakCalendarDots";
import WeeklyCompletionBarCard from "../components/WeeklyCompletionBarCard";
import { Habit, HabitLog, isCompletedLog } from "../utils/habits";

export default function ProgressTab({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: HabitLog[];
}) {
  const [selected, setSelected] = useState<string>(habits[0]?.id ?? "");

  const completedDates = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.habitId === selected && isCompletedLog(l)) set.add(l.date);
    });
    return set;
  }, [logs, selected]);

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
      <WeeklyCompletionBarCard habits={habits} logs={logs} />

      {/* Habit selector chips */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 14 }}>
        {habits.map((h) => {
          const active = h.id === selected;
          return (
            <TouchableOpacity
              key={h.id}
              onPress={() => setSelected(h.id)}
              style={{
                backgroundColor: active ? "#1E3A8A" : "#111827",
                borderColor: active ? "#3B82F6" : "#1f2937",
                borderWidth: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 12,
                marginRight: 8,
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: active ? "700" : "500" }}>{h.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ marginTop: 14 }}>
        <StreakCalendarDots title="Streak calendar (last 4 weeks)" completedDates={completedDates} />
      </View>

      {/* Placeholder card for AI weekly recap (disabled for now) */}
      <View
        style={{
          backgroundColor: "#0B0F1A",
          borderRadius: 16,
          padding: 14,
          borderWidth: 1,
          borderColor: "#1f2937",
          marginTop: 14,
          opacity: 0.6,
        }}
      >
        <Text style={{ color: "#9CA3AF" }}>
          Weekly recap (AI) — coming soon. You’ll see a summary, one insight, and a nudge here.
        </Text>
      </View>
    </ScrollView>
  );
}
