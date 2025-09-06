import { useMemo, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Habit, HabitLog } from "../utils/habits";

const moodEmoji = (m?: string) =>
  m === "great" ? "🔥" : m === "ok" ? "🙂" : m === "hard" ? "😮‍💨" : m === "skip" ? "⏭️" : "•";

export default function ReflectionTab({
  habits,
  logs,
}: {
  habits: Habit[];
  logs: HabitLog[];
}) {
  const [selected, setSelected] = useState<string>("all");

  const items = useMemo(() => {
    const filtered = selected === "all" ? logs : logs.filter((l) => l.habitId === selected);
    // newest first
    return filtered.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [selected, logs]);

  const titleMap = useMemo(() => new Map(habits.map((h) => [h.id, h.title])), [habits]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: 'black' }}>
      <ScrollView contentContainerStyle={{ marginTop: 25, marginLeft: 20, paddingBottom: 32 }}>
        {/* Inline filter chips */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 12 }}>
          {[{ id: "all", title: "All" }, ...habits].map((h) => {
            const active = selected === h.id;
            return (
              <TouchableOpacity
                key={h.id}
                onPress={() => setSelected(h.id)}
                style={{
                  backgroundColor: active ? "#1E3A8A" : "#111827",
                  borderColor: active ? "#3B82F6" : "#1f2937",
                  borderWidth: 1,
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: active ? "700" : "500" }}>{h.title}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View>
          {items.length === 0 ? (
            <Text style={{ color: "#9CA3AF" }}>No reflections yet.</Text>
          ) : (
            items.map((l) => (
              <View
                key={l.id}
                style={{
                  backgroundColor: "#111827",
                  borderRadius: 12,
                  padding: 12,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                  marginBottom: 10,
                }}
              >
                <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
                  {titleMap.get(l.habitId)} • {l.date} • {moodEmoji(l.mood)}
                </Text>
                {l.note ? <Text style={{ color: "white", marginTop: 6 }}>{l.note}</Text> : null}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
