import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Plus } from "lucide-react-native";
import colors from "@/constants/colors";
import { usePlanner } from "@/contexts/PlannerContext";
import { eventTypes } from "@/constants/eventTypes";

interface EventSelectorProps {
  onShowEventSheet: () => void;
  onShowCreateEvent: () => void;
}

export default function EventSelector({
  onShowEventSheet,
  onShowCreateEvent,
}: EventSelectorProps) {
  const { events, selectedEventId } = usePlanner();
  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Current Event</Text>
      {selectedEvent ? (
        <TouchableOpacity
          style={[styles.eventCard, { borderColor: selectedEvent.color }]}
          onPress={onShowEventSheet}
        >
          <View style={[styles.eventColorDot, { backgroundColor: selectedEvent.color }]} />
          <View style={styles.eventInfo}>
            <Text style={styles.eventName}>{selectedEvent.name}</Text>
            <Text style={styles.eventType}>
              {eventTypes.find((et) => et.id === selectedEvent.type)?.name || "Custom"}
            </Text>
          </View>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.noEventCard} onPress={onShowCreateEvent}>
          <Plus size={20} color={colors.primary} />
          <Text style={styles.noEventText}>Create or Select Event</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.textTertiary,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  eventCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
  },
  eventColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  eventType: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  noEventCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: "dashed",
    gap: 8,
  },
  noEventText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.primary,
  },
});

