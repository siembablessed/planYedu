import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Circle, G, Text as SvgText } from "react-native-svg";
import colors from "@/constants/colors";

const { width } = Dimensions.get("window");
const CHART_SIZE = Math.min(width - 64, 200);
const CENTER_X = CHART_SIZE / 2;
const CENTER_Y = CHART_SIZE / 2;
const RADIUS = (CHART_SIZE - 40) / 2;
const INNER_RADIUS = RADIUS * 0.65;
const STROKE_WIDTH = RADIUS - INNER_RADIUS;

interface DonutChartData {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutChartData[];
  total: number;
}

export function DonutChart({ data, total }: DonutChartProps) {
  if (data.length === 0 || total === 0) {
    return (
      <View style={styles.emptyChart}>
        <Text style={styles.emptyText}>No data to display</Text>
      </View>
    );
  }

  // Calculate angles and dash arrays for each segment
  let currentOffset = 0;
  const circumference = 2 * Math.PI * RADIUS;
  const segments = data.map((item) => {
    const percentage = (item.value / total) * 100;
    const segmentLength = (percentage / 100) * circumference;
    const gap = 2; // Small gap between segments
    const dashArray = `${segmentLength} ${circumference}`;
    const dashOffset = -currentOffset - (circumference / 4); // Start from top (-90 degrees)
    
    currentOffset += segmentLength + gap;

    return {
      ...item,
      percentage,
      dashArray,
      dashOffset,
      segmentLength,
    };
  });

  return (
    <View style={styles.container}>
      <Svg width={CHART_SIZE} height={CHART_SIZE} viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}>
        <G>
          {segments.map((segment, index) => (
            <Circle
              key={index}
              cx={CENTER_X}
              cy={CENTER_Y}
              r={RADIUS}
              fill="none"
              stroke={segment.color}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={segment.dashArray}
              strokeDashoffset={segment.dashOffset}
              strokeLinecap="round"
            />
          ))}
        </G>
        {/* Center text */}
        <SvgText
          x={CENTER_X}
          y={CENTER_Y - 8}
          fontSize="24"
          fontWeight="700"
          fill={colors.text}
          textAnchor="middle"
        >
          {data.length}
        </SvgText>
        <SvgText
          x={CENTER_X}
          y={CENTER_Y + 12}
          fontSize="12"
          fill={colors.textSecondary}
          textAnchor="middle"
        >
          Categories
        </SvgText>
      </Svg>
      {/* Legend */}
      <View style={styles.legend}>
        {data.slice(0, 6).map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: item.color }]} />
              <Text style={styles.legendLabel} numberOfLines={1}>
                {item.label}
              </Text>
              <Text style={styles.legendValue}>{percentage}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  emptyChart: {
    width: CHART_SIZE,
    height: CHART_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  legend: {
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: "500" as const,
  },
  legendValue: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: "600" as const,
  },
});

