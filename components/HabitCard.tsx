import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { calcProgress, calcStreak, Habit, HabitLog, hasLoggedToday } from "../utils/habits";
import ProgressRing from "./ProgressRing";

type Props = {
  habit: Habit;
  logs: HabitLog[];
  onLog: (h: Habit) => void;       // opens modal
  onQuickLog: (h: Habit) => void;  // instant log, no note
  onDetails?: (h: Habit) => void;
  onDelete?: (id: string) => void; // delete handler
  onEdit?: (h: Habit) => void;     // edit handler
};

export default function HabitCard({
  habit,
  logs,
  onLog,
  onQuickLog,
  onDetails,
  onDelete,
  onEdit,
}: Props) {
  const streak = calcStreak(habit, logs);
  const { count, pct } = calcProgress(habit, logs);
  const loggedToday = hasLoggedToday(habit.id, logs); // NEW

  const confirmDelete = () => {
    if (!onDelete) return;
    Alert.alert(
      "Delete Habit",
      `Are you sure you want to delete "${habit.title}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => onDelete(habit.id) },
      ]
    );
  };

  return (
    <View style={{ backgroundColor: "#111827", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: "#1f2937" }}>
      {/* top row */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <ProgressRing
          progress={pct}
          label={<MaterialCommunityIcons name={habit.icon as any} size={18} color="#60A5FA" /> as any}
          subLabel={`${Math.round(pct * 100)}%`}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>{habit.title}</Text>
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
            {count} / {habit.targetPerWeek} this week • <Text style={{ color: "#60A5FA" }}>{streak}🔥</Text>
          </Text>
        </View>

        {/* Quick log */}
        <TouchableOpacity
          disabled={loggedToday}
          onPress={() => onQuickLog(habit)}
          style={{
            backgroundColor: loggedToday ? "#374151" : "#10B981",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            marginRight: 8,
            opacity: loggedToday ? 0.9 : 1,
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>
            {loggedToday ? "Logged ✓" : "Quick log"}
          </Text>
        </TouchableOpacity>

        {/* Edit */}
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(habit)}
            style={{ backgroundColor: "#1E40AF", padding: 8, borderRadius: 8, marginRight: 8 }}
          >
            <Ionicons name="create-outline" size={16} color="white" />
          </TouchableOpacity>
        )}

        {/* Delete */}
        {onDelete && (
          <TouchableOpacity
            onPress={confirmDelete}
            style={{ backgroundColor: "#B91C1C", padding: 8, borderRadius: 8 }}
          >
            <Ionicons name="trash-outline" size={16} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* actions */}
      <View style={{ flexDirection: "row", marginTop: 12 }}>
        <TouchableOpacity
          onPress={() => onLog(habit)} // still lets them add a note/mood even if already logged
          style={{ backgroundColor: "#2563EB", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>Log today</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onDetails?.(habit)}
          style={{ backgroundColor: "#1F2937", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "white" }}>Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
