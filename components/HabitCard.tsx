import { Ionicons } from "@expo/vector-icons";
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
  // Calculate habit statistics using utility functions
  const streak = calcStreak(habit, logs); // Current consecutive day streak
  const { count, pct } = calcProgress(habit, logs); // Weekly progress count and percentage
  const loggedToday = hasLoggedToday(habit.id, logs); // Check if habit was already logged today

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
      {/* Main content row with progress ring, habit info, and action buttons */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {/* Progress ring showing weekly completion percentage */}
        <ProgressRing
          progress={pct}
          label={<Text style={{ fontSize: 18 }}>{habit.icon}</Text> as any}
          subLabel={`${Math.round(pct * 100)}%`}
        />
        {/* Habit title and progress information */}
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={{ color: "white", fontWeight: "700", fontSize: 16 }}>{habit.title}</Text>
          <Text style={{ color: "#9CA3AF", fontSize: 12 }}>
            {count} / {habit.targetPerWeek} this week • <Text style={{ color: "#60A5FA" }}>{streak}🔥</Text>
          </Text>
        </View>

        {/* Edit button - only shown if onEdit handler is provided */}
        {onEdit && (
          <TouchableOpacity
            onPress={() => onEdit(habit)}
            style={{ backgroundColor: "#1E40AF", padding: 8, borderRadius: 8, marginRight: 8 }}
          >
            <Ionicons name="create-outline" size={25} color="white" />
          </TouchableOpacity>
        )}

        {/* Delete button - only shown if onDelete handler is provided, with confirmation dialog */}
        {onDelete && (
          <TouchableOpacity
            onPress={confirmDelete}
            style={{ backgroundColor: "#B91C1C", padding: 8, borderRadius: 8 }}
          >
            <Ionicons name="trash-outline" size={25} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom action buttons row */}
      <View style={{ alignItems: "center", marginTop: 12 }}>
        {/* Log today button - opens modal for adding notes/mood, always available */}
        <TouchableOpacity
          onPress={() => onLog(habit)} // still lets them add a note/mood even if already logged
          style={{ backgroundColor: "#2563EB", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, marginRight: 10, width: "50%" }}
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Log today</Text>
        </TouchableOpacity>
        {/* Details button - shows habit details/history */}
      </View>
    </View>
  );
}
