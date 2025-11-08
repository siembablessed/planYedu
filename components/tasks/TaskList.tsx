import { View, StyleSheet, FlatList } from "react-native";
import { Task } from "@/types";
import TaskCard from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  projects: Array<{ id: string; name: string; color: string }>;
  onTaskPress: (taskId: string) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskEdit: (task: Task) => void;
  showProject?: boolean;
  ListEmptyComponent?: React.ReactElement;
}

export default function TaskList({
  tasks,
  projects,
  onTaskPress,
  onTaskDelete,
  onTaskEdit,
  showProject = false,
  ListEmptyComponent,
}: TaskListProps) {
  const getProject = (projectId: string) => {
    return projects.find((p) => p.id === projectId);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            project={getProject(item.projectId)}
            onPress={() => onTaskPress(item.id)}
            onDelete={() => onTaskDelete(item.id)}
            onEdit={() => onTaskEdit(item)}
            showProject={showProject}
          />
        )}
        ListEmptyComponent={ListEmptyComponent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 20,
  },
});

