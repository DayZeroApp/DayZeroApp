// components/LogHabitModal.tsx
import * as Haptics from "expo-haptics";
import React, { useMemo, useState } from "react";
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import type { Mood } from "../utils/habits";

type Props = {
  visible: boolean;
  habitTitle: string;
  onClose: () => void;
  onSubmit: (note?: string, mood?: Mood) => void; // UPDATED
};

const moods: { key: Mood; emoji: string; label: string }[] = [
  { key: "great", emoji: "🔥", label: "Great" },
  { key: "ok", emoji: "🙂", label: "Okay" },
  { key: "hard", emoji: "😮‍💨", label: "Hard" },
  { key: "skip", emoji: "⏭️", label: "Skip" },
];

export default function LogHabitModal({ visible, habitTitle, onClose, onSubmit }: Props) {
  const [note, setNote] = useState("");
  const [mood, setMood] = useState<Mood | undefined>(undefined);
  const remaining = useMemo(() => 200 - (note?.length || 0), [note]);

  const reset = () => {
    setNote("");
    setMood(undefined);
  };

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSubmit(note.trim() ? note.trim() : undefined, mood);
    reset();
    onClose();
  };

  const handleMarkDone = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit(undefined, "great"); // quick positive log
    reset();
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View
          style={{
            backgroundColor: "#0B0F1A",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 16,
            borderWidth: 1,
            borderColor: "#1f2937",
          }}
        >
          {/* handle bar */}
          <View
            style={{
              alignSelf: "center",
              width: 44,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#334155",
              marginBottom: 10,
            }}
          />
          <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
            Log today — {habitTitle}
          </Text>
          <Text style={{ color: "#9CA3AF", fontSize: 12, marginTop: 4, marginBottom: 12 }}>
            Add a quick note and pick how it felt.
          </Text>

          {/* mood chips */}
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
            {moods.map((m) => {
              const active = mood === m.key;
              return (
                <TouchableOpacity
                  key={m.key}
                  onPress={() => setMood(active ? undefined : m.key)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: active ? "#1E3A8A" : "#111827",
                    borderColor: active ? "#3B82F6" : "#1f2937",
                    borderWidth: 1,
                    borderRadius: 12,
                    paddingVertical: 8,
                    paddingHorizontal: 10,
                  }}
                >
                  <Text style={{ fontSize: 14, marginRight: 6 }}>{m.emoji}</Text>
                  <Text style={{ color: "white", fontWeight: active ? "700" : "500", fontSize: 12 }}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* note input */}
          <View style={{ backgroundColor: "#0A0F18", borderColor: "#1f2937", borderWidth: 1, borderRadius: 12 }}>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="What happened today?"
              placeholderTextColor="#64748B"
              multiline
              maxLength={200}
              style={{ color: "white", minHeight: 96, padding: 12, textAlignVertical: "top" }}
            />
          </View>
          <Text style={{ color: "#64748B", fontSize: 11, alignSelf: "flex-end", marginTop: 6 }}>
            {remaining} chars
          </Text>

          {/* actions */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 12 }}>
            <TouchableOpacity
              onPress={() => {
                reset();
                onClose();
              }}
              style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#1F2937" }}
            >
              <Text style={{ color: "white" }}>Cancel</Text>
            </TouchableOpacity>

            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={handleMarkDone}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 14,
                  borderRadius: 12,
                  backgroundColor: "#10B981",
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Mark done</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                style={{ paddingVertical: 12, paddingHorizontal: 14, borderRadius: 12, backgroundColor: "#2563EB" }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
