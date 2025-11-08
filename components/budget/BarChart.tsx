import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Rect, G, Text as SvgText } from "react-native-svg";
import colors from "@/constants/colors";

const { width } = Dimensions.get("window");
const CHART_WIDTH = width - 64;
const CHART_HEIGHT = 200;
const BAR_HEIGHT = 12;
const BAR_SPACING = 24;
const MAX_BAR_WIDTH = CHART_WIDTH - 120; // Leave space for labels

interface BarChartData {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}

interface BarChartProps {
  data: BarChartData[];
}

export function BarChart({ data }: BarChartProps) {
  if (data.length === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.maxValue), 1);

  return (
    <View style={styles.container}>
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT} viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}>
        <G>
          {data.map((item, index) => {
            const barWidth = (item.value / maxValue) * MAX_BAR_WIDTH;
            const y = index * BAR_SPACING + 20;
            const percentage = item.maxValue > 0 ? (item.value / item.maxValue) * 100 : 0;

            return (
              <G key={index}>
                {/* Background bar (max value) */}
                <Rect
                  x={100}
                  y={y}
                  width={MAX_BAR_WIDTH}
                  height={BAR_HEIGHT}
                  fill={colors.surfaceSecondary}
                  rx={6}
                />
                {/* Value bar */}
                <Rect
                  x={100}
                  y={y}
                  width={Math.max(barWidth, 4)}
                  height={BAR_HEIGHT}
                  fill={item.color}
                  rx={6}
                />
                {/* Label */}
                <SvgText
                  x={0}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize="12"
                  fill={colors.text}
                  fontWeight="600"
                >
                  {item.label.length > 12 ? item.label.substring(0, 12) + "..." : item.label}
                </SvgText>
                {/* Value text */}
                <SvgText
                  x={105 + barWidth}
                  y={y + BAR_HEIGHT / 2 + 4}
                  fontSize="11"
                  fill={colors.textSecondary}
                  fontWeight="600"
                >
                  ${item.value.toLocaleString()} / ${item.maxValue.toLocaleString()} ({percentage.toFixed(0)}%)
                </SvgText>
              </G>
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  emptyChart: {
    width: CHART_WIDTH,
    height: CHART_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
});

