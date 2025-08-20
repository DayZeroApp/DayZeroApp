import React, { useEffect, useMemo, useState } from "react";
import { FlatList, Modal, Text, TextInput, TouchableOpacity, View } from "react-native";

type HabitForm = {
  title: string;
  icon: string;
  targetPerWeek: number;
  targetTimes?: string[]; // NEW
};

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (p: HabitForm) => void; // UPDATED
  initial?: HabitForm;              // NEW: pass to edit
};

const ICONS = ["meditation", "book", "run-fast", "apple", "dumbbell", "yoga", "water", "brain"];

function isValidTime(s: string) {
  // "HH:MM" 24h
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(s.trim());
  return !!m;
}

export default function AddHabitModal({ visible, onClose, onSubmit, initial }: Props) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [icon, setIcon] = useState(initial?.icon ?? "meditation");
  const [tpw, setTpw] = useState(String(initial?.targetPerWeek ?? 5));
  const [targetTimes, setTargetTimes] = useState<string[]>(initial?.targetTimes ?? []);
  const [timeInput, setTimeInput] = useState("");

  // re-seed when opening (for edit mode)
  useEffect(() => {
    if (!visible) return;
    setTitle(initial?.title ?? "");
    setIcon(initial?.icon ?? "meditation");
    setTpw(String(initial?.targetPerWeek ?? 5));
    setTargetTimes(initial?.targetTimes ?? []);
    setTimeInput("");
  }, [visible, initial]);

  const canSave = useMemo(() => title.trim().length > 0 && Number(tpw) >= 1, [title, tpw]);

  const addTime = () => {
    const v = timeInput.trim();
    if (!isValidTime(v)) return;
    if (!targetTimes.includes(v)) setTargetTimes((prev) => [...prev, v].sort());
    setTimeInput("");
  };
  const removeTime = (t: string) => setTargetTimes((prev) => prev.filter((x) => x !== t));

  const submit = () => {
    if (!canSave) return;
    onSubmit({
      title: title.trim(),
      icon: icon.trim() || "meditation",
      targetPerWeek: Math.max(1, Math.min(7, Number(tpw) || 5)),
      targetTimes,
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.6)", justifyContent:"flex-end" }}>
        <View style={{ backgroundColor:"#111827", padding:16, borderTopLeftRadius:16, borderTopRightRadius:16, borderWidth:1, borderColor:"#1f2937" }}>
          {/* handle bar */}
          <View style={{ alignSelf:"center", width:44, height:4, backgroundColor:"#334155", borderRadius:2, marginBottom:12 }} />

          <Text style={{ color:"white", fontSize:18, fontWeight:"700", marginBottom:12 }}>
            {initial ? "Edit Habit" : "New Habit"}
          </Text>

          {/* Title */}
          <TextInput
            placeholder="Title (e.g., Meditate)"
            placeholderTextColor="#9CA3AF"
            value={title}
            onChangeText={setTitle}
            style={{ backgroundColor:"#1F2937", color:"white", padding:12, borderRadius:10, marginBottom:12 }}
          />

          {/* Icon (simple chip picker) */}
          <FlatList
            data={ICONS}
            keyExtractor={(i) => i}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom:8 }}
            renderItem={({ item }) => {
              const active = icon === item;
              return (
                <TouchableOpacity
                  onPress={() => setIcon(item)}
                  style={{
                    paddingVertical:8, paddingHorizontal:12, borderRadius:12,
                    backgroundColor: active ? "#1E3A8A" : "#111827",
                    borderColor: active ? "#3B82F6" : "#1f2937", borderWidth:1,
                    marginRight:8
                  }}
                >
                  <Text style={{ color:"white" }}>{item}</Text>
                </TouchableOpacity>
              );
            }}
          />

          {/* Target per week */}
          <TextInput
            placeholder="Target per week (1–7)"
            placeholderTextColor="#9CA3AF"
            keyboardType="number-pad"
            value={tpw}
            onChangeText={setTpw}
            style={{ backgroundColor:"#1F2937", color:"white", padding:12, borderRadius:10, marginTop:12 }}
          />

          {/* Target times (future reminders) */}
          <View style={{ marginTop:12 }}>
            <Text style={{ color:"#9CA3AF", marginBottom:6 }}>Target times (24h, e.g., 08:00)</Text>
            <View style={{ flexDirection:"row", alignItems:"center" }}>
              <TextInput
                value={timeInput}
                onChangeText={setTimeInput}
                placeholder="HH:MM"
                placeholderTextColor="#64748B"
                style={{ flex:1, backgroundColor:"#1F2937", color:"white", padding:12, borderRadius:10, marginRight:8 }}
              />
              <TouchableOpacity onPress={addTime} style={{ backgroundColor:"#2563EB", paddingVertical:10, paddingHorizontal:14, borderRadius:12 }}>
                <Text style={{ color:"white", fontWeight:"700" }}>Add</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection:"row", flexWrap:"wrap", marginTop:8 }}>
              {targetTimes.map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => removeTime(t)}
                  style={{ backgroundColor:"#111827", borderColor:"#1f2937", borderWidth:1, borderRadius:12, paddingVertical:6, paddingHorizontal:10, marginRight:8, marginBottom:8 }}
                >
                  <Text style={{ color:"white" }}>{t} ✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions */}
          <View style={{ flexDirection:"row", justifyContent:"flex-end", marginTop:16 }}>
            <TouchableOpacity onPress={onClose} style={{ marginRight:12 }}>
              <Text style={{ color:"#9CA3AF" }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={submit} disabled={!canSave}>
              <Text style={{ color: canSave ? "#60A5FA" : "#475569", fontWeight:"700" }}>
                {initial ? "Save" : "Add"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
