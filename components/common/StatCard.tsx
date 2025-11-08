import { View, Text, StyleSheet } from "react-native";
import { LucideIcon } from "lucide-react-native";
import colors from "@/constants/colors";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  color: string;
}

export default function StatCard({ icon: Icon, value, label, color }: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: color }]}>
      <Icon size={24} color={colors.surface} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    minHeight: 100,
    justifyContent: "center",
  },
  value: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.surface,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.surface,
    opacity: 0.9,
    textAlign: "center",
  },
});

