import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { usePlanner } from "@/contexts/PlannerContext";
import { Stack, useRouter } from "expo-router";
import { Users, CheckCircle2, Clock, Circle, User } from "lucide-react-native";
import colors from "@/constants/colors";
import { Task } from "@/types";
import * as Haptics from "expo-haptics";

export default function SharedScreen() {
  const router = useRouter();
  const { getSharedTasks, users, projects, toggleTaskStatus } = usePlanner();

  const sharedTasks = getSharedTasks();
  const sharedProjects = projects.filter((p) => p.sharedWith.length > 0);

  const handleTaskPress = (taskId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    toggleTaskStatus(taskId);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Shared",
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                router.push("/(tabs)/profile");
              }}
              style={{ marginRight: 16 }}
            >
              <User size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Users size={24} color={colors.secondary} />
          </View>
          <Text style={styles.headerTitle}>Shared Tasks</Text>
          <Text style={styles.headerSubtitle}>
            Collaborate with your team on projects
          </Text>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Team Members</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.membersRow}
            >
              {users.map((user) => (
                <View key={user.id} style={styles.memberCard}>
                  <Image source={{ uri: user.avatar }} style={styles.memberAvatar} />
                  <Text style={styles.memberName}>{user.name}</Text>
                  <View
                    style={[styles.memberStatus, { backgroundColor: user.color }]}
                  >
                    <View style={styles.statusDot} />
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>

          {sharedProjects.length > 0 ? (
            sharedProjects.map((project) => {
              const projectTasks = sharedTasks.filter(
                (t) => t.projectId === project.id
              );

              if (projectTasks.length === 0) return null;

              return (
                <View key={project.id} style={styles.section}>
                  <View style={styles.projectHeader}>
                    <View
                      style={[
                        styles.projectColorDot,
                        { backgroundColor: project.color },
                      ]}
                    />
                    <Text style={styles.projectName}>{project.name}</Text>
                    <Text style={styles.projectTaskCount}>
                      {projectTasks.length} tasks
                    </Text>
                  </View>

                  {projectTasks.map((task) => (
                    <SharedTaskCard
                      key={task.id}
                      task={task}
                      users={users}
                      onPress={() => handleTaskPress(task.id)}
                    />
                  ))}
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Users size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>No shared tasks yet</Text>
              <Text style={styles.emptySubtitle}>
                Share projects with team members to collaborate on tasks together
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
}

function SharedTaskCard({
  task,
  users,
  onPress,
}: {
  task: Task;
  users: { id: string; name: string; avatar: string; color: string }[];
  onPress: () => void;
}) {
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

  const assignedUsers = task.assignedTo
    ? users.filter((u) => task.assignedTo?.includes(u.id))
    : [];

  return (
    <TouchableOpacity style={styles.taskCard} onPress={onPress}>
      <View style={styles.taskIcon}>
        <StatusIcon size={20} color={iconColor} />
      </View>
      <View style={styles.taskContent}>
        <Text
          style={[
            styles.taskTitle,
            task.status === "completed" && styles.taskTitleCompleted,
          ]}
        >
          {task.title}
        </Text>
        {task.description && (
          <Text style={styles.taskDescription} numberOfLines={1}>
            {task.description}
          </Text>
        )}
        {assignedUsers.length > 0 && (
          <View style={styles.assignedRow}>
            {assignedUsers.slice(0, 3).map((user, index) => (
              <Image
                key={user.id}
                source={{ uri: user.avatar }}
                style={[styles.assignedAvatar, { marginLeft: index * -8 }]}
              />
            ))}
            {assignedUsers.length > 3 && (
              <View style={[styles.assignedAvatar, styles.assignedMore]}>
                <Text style={styles.assignedMoreText}>
                  +{assignedUsers.length - 3}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: "center",
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 12,
  },
  membersRow: {
    gap: 12,
  },
  memberCard: {
    width: 100,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memberAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.text,
    textAlign: "center",
  },
  memberStatus: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surface,
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  projectColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  projectName: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text,
    flex: 1,
  },
  projectTaskCount: {
    fontSize: 13,
    color: colors.textTertiary,
    fontWeight: "500" as const,
  },
  taskCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskIcon: {
    marginTop: 2,
  },
  taskContent: {
    flex: 1,
    gap: 4,
  },
  taskTitle: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: colors.text,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: colors.textTertiary,
  },
  taskDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  assignedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  assignedAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  assignedMore: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  assignedMoreText: {
    fontSize: 10,
    fontWeight: "700" as const,
    color: colors.surface,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  bottomSpacer: {
    height: 40,
  },
});
