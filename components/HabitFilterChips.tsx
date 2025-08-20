import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Habit } from "../utils/habits";

export default function HabitFilterChips({
  habits, selected, onSelect,
}:{
  habits: Habit[];
  selected: string; // "all" or habit.id
  onSelect: (id: string) => void;
}) {
  const options = [{ id:"all", title:"All" }, ...habits];
  return (
    <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8 }}>
      {options.map(h => {
        const active = h.id === selected;
        return (
          <TouchableOpacity
            key={h.id}
            onPress={() => onSelect(h.id)}
            style={{
              backgroundColor: active ? "#1E3A8A" : "#111827",
              borderColor: active ? "#3B82F6" : "#1f2937",
              borderWidth: 1,
              paddingVertical:8, paddingHorizontal:12, borderRadius:12
            }}
          >
            <Text style={{ color:"white", fontWeight: active ? "700" : "500" }}>{h.title}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
