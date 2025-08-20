import React, { useMemo } from "react";
import { Text, View } from "react-native";

function iso(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function StreakCalendarDots({
  title,
  days = 28,
  completedDates, // Set<string> of ISO yyyy-mm-dd
}: {
  title: string;
  days?: number;
  completedDates: Set<string>;
}) {
  // Build last N days ending today, column = week, row = weekday (Mon→Sun)
  const cells = useMemo(() => {
    const arr: { iso: string; dow: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      // Make Monday=0 … Sunday=6
      const js = d.getDay();
      const dow = (js + 6) % 7;
      arr.push({ iso: iso(d), dow });
    }
    return arr;
  }, [days]);

  // Arrange into columns by week
  const columns: { iso: string; dow: number }[][] = [];
  let col: { iso: string; dow: number }[] = [];
  cells.forEach((c, idx) => {
    col.push(c);
    // start new column every 7 days or at end
    if ((idx + 1) % 7 === 0) {
      columns.push(col);
      col = [];
    }
  });
  if (col.length) columns.push(col); // (when days not multiple of 7)

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
      <Text style={{ color: "white", fontWeight: "700", marginBottom: 10 }}>{title}</Text>
      <View style={{ flexDirection: "row" }}>
        {columns.map((week, wi) => (
          <View key={wi} style={{ marginRight: 6 }}>
            {Array.from({ length: 7 }).map((_, r) => {
              const cell = week.find((c) => c.dow === r);
              const done = cell ? completedDates.has(cell.iso) : false;
              return (
                <View
                  key={r}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 7,
                    marginBottom: 6,
                    backgroundColor: done ? "#60A5FA" : "#1f2937",
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* To switch to a heatmap later, replace the circle with a square and scale color by count */}
    </View>
  );
}
