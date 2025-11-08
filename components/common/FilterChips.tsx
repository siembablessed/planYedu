import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import colors from "@/constants/colors";

export type FilterOption<T = string> = {
  id: T;
  label: string;
  count?: number;
};

interface FilterChipsProps<T = string> {
  options: FilterOption<T>[];
  selected: T | null;
  onSelect: (id: T) => void;
  multiSelect?: boolean;
  selectedIds?: T[];
}

export default function FilterChips<T extends string | number = string>({
  options,
  selected,
  onSelect,
  multiSelect = false,
  selectedIds = [],
}: FilterChipsProps<T>) {
  const isSelected = (id: T) => {
    if (multiSelect) {
      return selectedIds.includes(id);
    }
    return selected === id;
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {options.map((option) => {
        const selected = isSelected(option.id);
        return (
          <TouchableOpacity
            key={String(option.id)}
            style={[
              styles.chip,
              selected && styles.chipSelected,
            ]}
            onPress={() => onSelect(option.id)}
          >
            <Text
              style={[
                styles.chipText,
                selected && styles.chipTextSelected,
              ]}
            >
              {option.label}
            </Text>
            {option.count !== undefined && (
              <View style={[styles.badge, selected && styles.badgeSelected]}>
                <Text
                  style={[
                    styles.badgeText,
                    selected && styles.badgeTextSelected,
                  ]}
                >
                  {option.count}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  badge: {
    backgroundColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  badgeSelected: {
    backgroundColor: colors.surface,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.textSecondary,
  },
  badgeTextSelected: {
    color: colors.primary,
  },
});

