import React, { useState, useMemo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  Alert,
} from "react-native";
import { Sparkles, AlertCircle, Plus } from "lucide-react-native";
import colors from "@/constants/colors";
import { usePlanner } from "@/contexts/PlannerContext";
import { Task, TaskPriority } from "@/types";
import { smartTaskTemplates, isDuplicateTask, getTemplatesForEventType } from "@/constants/smartTasks";
import { EventType } from "@/constants/eventTypes";
import * as Haptics from "expo-haptics";

interface AddTaskSheetProps {
  projectId: string | null;
  editingTask: Task | null;
  onClose: () => void;
}

export default function AddTaskSheet({
  projectId,
  editingTask,
  onClose,
}: AddTaskSheetProps) {
  const { addTask, updateTask, addProject, projects, tasks, selectedEventId, events } = usePlanner();
  const [title, setTitle] = useState(editingTask?.title || "");
  const [description, setDescription] = useState(editingTask?.description || "");
  const [priority, setPriority] = useState<TaskPriority>(editingTask?.priority || "medium");
  const [price, setPrice] = useState(editingTask?.price?.toString() || "");
  const [selectedProject, setSelectedProject] = useState(
    editingTask?.projectId || projectId || projects[0]?.id || ""
  );
  const [showTemplates, setShowTemplates] = useState(!editingTask);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [showProjectSelector, setShowProjectSelector] = useState(false);

  // Get event-specific templates
  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const eventType = selectedEvent?.type as EventType | undefined;
  const availableTemplates = useMemo(() => {
    return eventType ? getTemplatesForEventType(eventType) : smartTaskTemplates;
  }, [eventType]);

  const [filteredTemplates, setFilteredTemplates] = useState<typeof smartTaskTemplates>([]);

  // Update templates when event changes
  useEffect(() => {
    setFilteredTemplates(availableTemplates);
  }, [availableTemplates]);

  // Get tasks for selected event (for duplicate checking)
  const eventTasksForCheck = useMemo(() => {
    if (!selectedEventId) return tasks;
    const eventProjects = projects.filter((p) => p.eventId === selectedEventId);
    return tasks.filter((task) => eventProjects.some((p) => p.id === task.projectId));
  }, [tasks, projects, selectedEventId]);

  // Check for duplicates within the event
  const checkDuplicate = (taskTitle: string): boolean => {
    const normalizedTitle = taskTitle.trim().toLowerCase();
    return eventTasksForCheck.some((task) => {
      if (editingTask && task.id === editingTask.id) return false;
      return isDuplicateTask(task.title, normalizedTitle);
    });
  };

  // Handle template selection
  const handleTemplateSelect = (template: typeof smartTaskTemplates[0]) => {
    setTitle(template.title);
    setDescription(template.description);
    setPrice(template.price?.toString() || "");
    setPriority(template.priority);
    setShowTemplates(false);
    setDuplicateWarning(null);

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  // Handle title change with duplicate checking
  const handleTitleChange = (text: string) => {
    setTitle(text);
    setShowTemplates(text.length === 0);

    if (text.trim().length > 0) {
      const filtered = availableTemplates.filter((t) =>
        t.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredTemplates(filtered.length > 0 ? filtered : availableTemplates);

      if (checkDuplicate(text)) {
        setDuplicateWarning("A similar task already exists. Are you sure you want to create a duplicate?");
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setFilteredTemplates(availableTemplates);
      setDuplicateWarning(null);
    }
  };

  const handleCreate = () => {
    if (!title.trim()) return;

    if (!editingTask && checkDuplicate(title)) {
      setDuplicateWarning("This task already exists! Please use a different title or edit the existing task.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    let finalProjectId = selectedProject;

    // Ensure we have a project for the selected event
    if (!finalProjectId || !projects.find((p) => p.id === finalProjectId)) {
      const colors_list = ["#EC4899", "#8B5CF6", "#F59E0B", "#10B981", "#06B6D4"];

      let eventProject = projects.find((p) => p.eventId === selectedEventId);

      if (!eventProject && selectedEventId) {
        const event = events.find((e) => e.id === selectedEventId);
        const newProject = {
          name: event?.name || "General",
          color: event?.color || colors_list[projects.length % colors_list.length],
          icon: "list",
          sharedWith: [],
          eventId: selectedEventId,
        };
        addProject(newProject);
        finalProjectId = Date.now().toString();
      } else if (!eventProject) {
        const newProject = {
          name: "General",
          color: colors_list[projects.length % colors_list.length],
          icon: "list",
          sharedWith: [],
        };
        addProject(newProject);
        finalProjectId = Date.now().toString();
      } else {
        finalProjectId = eventProject.id;
      }
    }

    if (editingTask) {
      updateTask(editingTask.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        projectId: finalProjectId,
        price: price.trim() ? parseFloat(price) : undefined,
      });
    } else {
      addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        status: "todo",
        priority,
        projectId: finalProjectId,
        price: price.trim() ? parseFloat(price) : undefined,
      });
    }

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  };

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: "low", label: "Low", color: "#10B981" },
    { value: "medium", label: "Medium", color: "#F59E0B" },
    { value: "high", label: "High", color: "#EF4444" },
  ];

  const eventProjects = useMemo(() => {
    if (!selectedEventId) return projects;
    return projects.filter((p) => p.eventId === selectedEventId);
  }, [projects, selectedEventId]);

  return (
    <View style={styles.overlay}>
      <TouchableOpacity style={styles.background} onPress={onClose} />
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.handle} />
        <Text style={styles.title}>{editingTask ? "Edit Task" : "New Task"}</Text>

        {showTemplates && filteredTemplates.length > 0 && (
          <View style={styles.templatesSection}>
            <View style={styles.templatesHeader}>
              <Sparkles size={20} color={colors.primary} />
              <Text style={styles.templatesTitle}>Smart Tasks</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.templatesScroll}
              contentContainerStyle={styles.templatesScrollContent}
            >
              {filteredTemplates
                .filter((template) => {
                  return !eventTasksForCheck.some((task) =>
                    isDuplicateTask(task.title, template.title)
                  );
                })
                .slice(0, 8)
                .map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateCard}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <Text style={styles.templateTitle} numberOfLines={2}>
                      {template.title}
                    </Text>
                    {template.price && (
                      <Text style={styles.templatePrice}>${template.price.toLocaleString()}</Text>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, duplicateWarning && styles.inputError]}
            placeholder="Task title or select a template above"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={handleTitleChange}
            onFocus={() => {
              if (title.trim().length === 0) {
                setShowTemplates(true);
              }
            }}
            autoFocus={!showTemplates}
          />
          {duplicateWarning && (
            <View style={styles.warningContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.warningText}>{duplicateWarning}</Text>
            </View>
          )}
        </View>

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Description (optional)"
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />

        <View style={{ marginBottom: 16 }} />

        <TextInput
          style={styles.input}
          placeholder="Price (optional)"
          placeholderTextColor={colors.textTertiary}
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Priority</Text>
          <View style={styles.priorityContainer}>
            {priorityOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.priorityChip,
                  priority === option.value && {
                    backgroundColor: option.color,
                    borderColor: option.color,
                  },
                ]}
                onPress={() => setPriority(option.value)}
              >
                <Text
                  style={[
                    styles.priorityChipText,
                    priority === option.value && { color: colors.surface },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionLabel}>Project</Text>
            <TouchableOpacity
              style={styles.addProjectButton}
              onPress={() => setShowProjectSelector(!showProjectSelector)}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={styles.addProjectButtonText}>New</Text>
            </TouchableOpacity>
          </View>
          {showProjectSelector ? (
            <View style={styles.projectInputContainer}>
              <TextInput
                style={styles.projectInput}
                placeholder="Project name"
                placeholderTextColor={colors.textTertiary}
                autoFocus
                onSubmitEditing={(e) => {
                  const projectName = e.nativeEvent.text.trim();
                  if (projectName) {
                    const colors_list = ["#EC4899", "#8B5CF6", "#F59E0B", "#10B981", "#06B6D4"];
                    const newProject = {
                      name: projectName,
                      color: colors_list[projects.length % colors_list.length],
                      icon: "list",
                      sharedWith: [],
                      eventId: selectedEventId || undefined,
                    };
                    addProject(newProject);
                    setSelectedProject(Date.now().toString());
                    setShowProjectSelector(false);
                  }
                }}
              />
            </View>
          ) : (
            <View style={styles.projectsContainer}>
              {eventProjects.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.projectChip,
                    selectedProject === p.id && styles.projectChipSelected,
                  ]}
                  onPress={() => setSelectedProject(p.id)}
                >
                  <View style={[styles.projectChipDot, { backgroundColor: p.color }]} />
                  <Text
                    style={[
                      styles.projectChipText,
                      selectedProject === p.id && styles.projectChipTextSelected,
                    ]}
                  >
                    {p.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!title.trim() || duplicateWarning) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || (duplicateWarning !== null && duplicateWarning.includes("already exists"))}
          >
            <Text style={styles.createButtonText}>
              {editingTask ? "Save Changes" : "Create Task"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    maxHeight: "90%",
    zIndex: 1001,
    elevation: 1001,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
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
  templatesSection: {
    marginBottom: 20,
  },
  templatesHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  templatesTitle: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
  },
  templatesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  templatesScrollContent: {
    gap: 12,
    paddingRight: 20,
  },
  templateCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    width: 160,
    marginRight: 12,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  templatePrice: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.primary,
  },
  inputContainer: {
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  inputMultiline: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
    padding: 12,
    backgroundColor: colors.error + "15",
    borderRadius: 8,
  },
  warningText: {
    fontSize: 13,
    color: colors.error,
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 12,
  },
  priorityContainer: {
    flexDirection: "row",
    gap: 8,
  },
  priorityChip: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
  },
  priorityChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  addProjectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.primary + "15",
    borderRadius: 8,
  },
  addProjectButtonText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  projectInputContainer: {
    marginTop: 8,
  },
  projectInput: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  projectsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  projectChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  projectChipSelected: {
    backgroundColor: colors.primary + "15",
    borderColor: colors.primary,
  },
  projectChipDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  projectChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  projectChipTextSelected: {
    color: colors.primary,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
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

