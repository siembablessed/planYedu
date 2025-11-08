import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { Trash2 } from "lucide-react-native";
import colors from "@/constants/colors";
import { usePlanner } from "@/contexts/PlannerContext";
import { eventTypes } from "@/constants/eventTypes";

interface EventSheetProps {
  onClose: () => void;
  onSelectEvent: (eventId: string) => void;
  onCreateEvent: () => void;
}

export default function EventSheet({
  onClose,
  onSelectEvent,
  onCreateEvent,
}: EventSheetProps) {
  const { events, selectedEventId, deleteEvent } = usePlanner();

  const handleDelete = (eventId: string) => {
    Alert.alert(
      "Delete Event",
      "Are you sure you want to delete this event? All tasks and budget data will be preserved.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEvent(eventId);
          },
        },
      ]
    );
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.background} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Select Event</Text>

        <ScrollView style={{ maxHeight: 400 }}>
          {events.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No events yet</Text>
              <Text style={styles.emptySubtitle}>
                Create your first event to get started
              </Text>
              <TouchableOpacity style={styles.createButton} onPress={onCreateEvent}>
                <Text style={styles.createButtonText}>Create Event</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {events.map((event) => {
                const eventType = eventTypes.find((et) => et.id === event.type);
                const isSelected = event.id === selectedEventId;

                return (
                  <TouchableOpacity
                    key={event.id}
                    style={[
                      styles.eventOption,
                      isSelected && styles.eventOptionSelected,
                    ]}
                    onPress={() => {
                      onSelectEvent(event.id);
                      onClose();
                    }}
                  >
                    <View style={[styles.eventColorDot, { backgroundColor: event.color }]} />
                    <View style={styles.eventInfo}>
                      <Text style={styles.eventOptionName}>{event.name}</Text>
                      <Text style={styles.eventOptionType}>
                        {eventType?.name || "Custom"}
                      </Text>
                    </View>
                    {events.length > 1 && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDelete(event.id)}
                      >
                        <Trash2 size={18} color={colors.error} />
                      </TouchableOpacity>
                    )}
                  </TouchableOpacity>
                );
              })}
              <TouchableOpacity style={styles.createButton} onPress={onCreateEvent}>
                <Text style={styles.createButtonText}>+ Create New Event</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  background: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "85%",
    zIndex: 1001,
    elevation: 1001,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 20,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
  },
  eventOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  eventOptionSelected: {
    backgroundColor: colors.primary + "15",
    borderWidth: 2,
    borderColor: colors.primary,
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
  eventOptionName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  eventOptionType: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deleteButton: {
    padding: 8,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.surface,
  },
});

