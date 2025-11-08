import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { useRef, useState } from "react";
import {
  CheckCircle2,
  Circle,
  Clock,
  DollarSign,
  Calendar,
  MoreVertical,
  Edit,
  Trash2,
} from "lucide-react-native";
import { Alert } from "react-native";
import colors from "@/constants/colors";
import { Task, TaskPriority } from "@/types";
import * as Haptics from "expo-haptics";

interface TaskCardProps {
  task: Task;
  project?: { id: string; name: string; color: string };
  onPress: () => void;
  onDelete: () => void;
  onEdit: () => void;
  showProject?: boolean;
}

export default function TaskCard({
  task,
  project,
  onPress,
  onDelete,
  onEdit,
  showProject,
}: TaskCardProps) {
  const [showOptions, setShowOptions] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleDelete = () => {
    Alert.alert(
      "Delete Task",
      `Are you sure you want to delete "${task.title}"? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
          onPress: () => setShowOptions(false),
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            if (Platform.OS !== "web") {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            }
            onDelete();
            setShowOptions(false);
          },
        },
      ]
    );
  };

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  const priorityColor = {
    low: colors.success,
    medium: colors.warning,
    high: colors.error,
  }[task.priority];

  const StatusIcon =
    task.status === "completed"
      ? CheckCircle2
      : task.status === "in_progress"
      ? Clock
      : Circle;
  const iconColor =
    task.status === "completed"
      ? colors.success
      : task.status === "in_progress"
      ? colors.warning
      : colors.textTertiary;

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <View style={[styles.priorityIndicator, { backgroundColor: priorityColor }]} />
      <TouchableOpacity style={styles.content} onPress={handlePress}>
        <StatusIcon size={24} color={iconColor} />
        <View style={styles.textContainer}>
          <Text
            style={[
              styles.title,
              task.status === "completed" && styles.titleCompleted,
            ]}
          >
            {task.title}
          </Text>
          {task.description && (
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
          )}
          <View style={styles.meta}>
            {showProject && project && (
              <View style={styles.badge}>
                <View
                  style={[styles.dot, { backgroundColor: project.color }]}
                />
                <Text style={styles.badgeText}>{project.name}</Text>
              </View>
            )}
            {task.dueDate && (
              <View style={styles.badge}>
                <Calendar size={12} color={colors.textTertiary} />
                <Text style={styles.badgeText}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            {task.price !== undefined && task.price > 0 && (
              <View style={styles.badge}>
                <DollarSign size={12} color={colors.textTertiary} />
                <Text style={styles.badgeText}>${task.price.toLocaleString()}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.options}
        onPress={() => {
          if (Platform.OS !== "web") {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
          setShowOptions(!showOptions);
        }}
      >
        <MoreVertical size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      {showOptions && (
        <View style={styles.optionsMenu}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              onEdit();
              setShowOptions(false);
            }}
          >
            <Edit size={16} color={colors.primary} />
            <Text style={styles.optionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.optionButton, styles.optionButtonDelete]}
            onPress={handleDelete}
          >
            <Trash2 size={16} color={colors.error} />
            <Text style={[styles.optionText, styles.optionTextDelete]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityIndicator: {
    width: 4,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    alignItems: "flex-start",
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500",
  },
  options: {
    padding: 16,
    justifyContent: "center",
  },
  optionsMenu: {
    position: "absolute",
    right: 8,
    top: 48,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 120,
  },
  optionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  optionButtonDelete: {
    backgroundColor: colors.error + "15",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },
  optionTextDelete: {
    color: colors.error,
  },
});

