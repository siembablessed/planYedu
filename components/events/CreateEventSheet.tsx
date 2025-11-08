import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Platform, ScrollView } from "react-native";
import { ChevronDown, ChevronUp, Check } from "lucide-react-native";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      <TouchableOpacity 
        style={styles.background} 
        activeOpacity={1}
        onPress={() => {
          setIsDropdownOpen(false);
          onClose();
        }} 
      />
      <View style={[styles.sheet, isDropdownOpen && styles.sheetExpanded]}>
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>
        <ScrollView 
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
          <View style={styles.dropdownContainer}>
            <TouchableOpacity
              style={styles.dropdownButton}
              onPress={() => {
                setIsDropdownOpen(!isDropdownOpen);
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
              }}
            >
              <View style={styles.dropdownButtonContent}>
                <View style={[styles.dropdownColorDot, { backgroundColor: eventTypes.find(et => et.id === selectedType)?.color || colors.primary }]} />
                <Text style={styles.dropdownButtonText}>
                  {eventTypes.find(et => et.id === selectedType)?.name || "Select Event Type"}
                </Text>
              </View>
              {isDropdownOpen ? (
                <ChevronUp size={20} color={colors.textSecondary} />
              ) : (
                <ChevronDown size={20} color={colors.textSecondary} />
              )}
            </TouchableOpacity>
            
            {isDropdownOpen && (
              <View style={styles.dropdownList}>
                <View style={styles.dropdownHeader}>
                  <Text style={styles.dropdownHeaderText}>Select Event Type</Text>
                  <TouchableOpacity
                    onPress={() => {
                      setIsDropdownOpen(false);
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                    }}
                    style={styles.dropdownCloseButton}
                  >
                    <Text style={styles.dropdownCloseText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView 
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                  style={styles.dropdownScrollView}
                  contentContainerStyle={styles.dropdownScrollContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {eventTypes.map((type, index) => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.dropdownItem,
                        selectedType === type.id && styles.dropdownItemSelected,
                        index === eventTypes.length - 1 && styles.dropdownItemLast,
                      ]}
                      onPress={() => {
                        setSelectedType(type.id);
                        setIsDropdownOpen(false);
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <View style={[styles.dropdownItemColorDot, { backgroundColor: type.color }]} />
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selectedType === type.id && styles.dropdownItemTextSelected,
                        ]}
                      >
                        {type.name}
                      </Text>
                      {selectedType === type.id && (
                        <View style={[styles.dropdownItemCheck, { backgroundColor: type.color }]}>
                          <Check size={14} color={colors.surface} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </ScrollView>

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
    zIndex: 1001,
    elevation: 1001,
    flexDirection: "column",
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 20,
    paddingBottom: 12,
  },
  handleContainer: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
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
  dropdownContainer: {
    marginBottom: 12,
    position: "relative",
    zIndex: 10,
  },
  sheetExpanded: {
    maxHeight: "90%",
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dropdownButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  dropdownColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: "500" as const,
    color: colors.text,
    flex: 1,
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
    maxHeight: 320,
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownHeaderText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  dropdownCloseButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dropdownCloseText: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  dropdownScrollView: {
    maxHeight: 250,
  },
  dropdownScrollContent: {
    paddingBottom: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemLast: {
    borderBottomWidth: 0,
  },
  dropdownItemSelected: {
    backgroundColor: colors.surfaceSecondary,
  },
  dropdownItemColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  dropdownItemText: {
    fontSize: 15,
    fontWeight: "500" as const,
    color: colors.text,
    flex: 1,
  },
  dropdownItemTextSelected: {
    fontWeight: "600" as const,
  },
  dropdownItemCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
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

