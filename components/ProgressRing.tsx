import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;              // outer size in px
  stroke?: number;            // ring thickness
  progress: number;           // 0..1
  label?: string;             // center label (e.g., icon)
  subLabel?: string;          // small text under label (e.g., “3🔥”)
};

export default function ProgressRing({
  size = 64,
  stroke = 6,
  progress,
  label,
  subLabel,
}: Props) {
  const clamped = Math.max(0, Math.min(1, progress || 0));
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = c * clamped;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        {/* track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#374151"
          strokeWidth={stroke}
          fill="none"
        />
        {/* progress */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="#60A5FA"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${dash}, ${c - dash}`}
          strokeLinecap="round"
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>

      <View style={{ alignItems: "center", justifyContent: "center" }}>
        {label ? (
          <Text style={{ color: "white", fontWeight: "700" }}>{label}</Text>
        ) : null}
        {subLabel ? (
          <Text style={{ color: "#9CA3AF", fontSize: 10, marginTop: 2 }}>{subLabel}</Text>
        ) : null}
      </View>
    </View>
  );
}
