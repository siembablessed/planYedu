import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform } from "react-native";
import colors from "@/constants/colors";
import { usePlanner } from "@/contexts/PlannerContext";
import { eventTypes, EventType } from "@/constants/eventTypes";
import * as Haptics from "expo-haptics";

interface CreateEventSheetProps {
  onClose: () => void;
  onEventCreated: () => void;
}

export default function CreateEventSheet({
  onClose,
  onEventCreated,
}: CreateEventSheetProps) {
  const { addEvent } = usePlanner();
  const [eventName, setEventName] = useState("");
  const [selectedType, setSelectedType] = useState<EventType>("wedding");

  const handleCreate = () => {
    if (!eventName.trim()) return;

    const eventTypeConfig = eventTypes.find((et) => et.id === selectedType);
    addEvent({
      name: eventName.trim(),
      type: selectedType,
      color: eventTypeConfig?.color || colors.primary,
    });

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onEventCreated();
  };

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.background} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Create Event</Text>

        <TextInput
          style={styles.input}
          placeholder="Event name (e.g., Sarah's Wedding)"
          placeholderTextColor={colors.textTertiary}
          value={eventName}
          onChangeText={setEventName}
          autoFocus
        />

        <Text style={styles.label}>Event Type</Text>
        <View style={styles.eventTypesGrid}>
          {eventTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.eventTypeChip,
                selectedType === type.id && {
                  backgroundColor: type.color,
                  borderColor: type.color,
                },
              ]}
              onPress={() => {
                setSelectedType(type.id);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <Text
                style={[
                  styles.eventTypeChipText,
                  selectedType === type.id && { color: colors.surface },
                ]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createButton, !eventName.trim() && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={!eventName.trim()}
          >
            <Text style={styles.createButtonText}>Create Event</Text>
          </TouchableOpacity>
        </View>
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
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 12,
  },
  eventTypesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  eventTypeChip: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: "45%",
    flex: 1,
    maxWidth: "48%",
    alignItems: "center",
    justifyContent: "center",
  },
  eventTypeChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
  },
  createButton: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.surface,
  },
});

