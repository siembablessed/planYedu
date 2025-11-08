import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { Sparkles, Send, Lightbulb, User } from "lucide-react-native";
import colors from "@/constants/colors";
import { useRorkAgent, createRorkTool } from "@/lib/rork-toolkit";
import { usePlanner } from "@/contexts/PlannerContext";
import { z } from "zod";
import * as Haptics from "expo-haptics";

export default function AIAssistantScreen() {
  const router = useRouter();
  const { addTask, projects, tasks } = usePlanner();
  const [input, setInput] = useState("");

  const { messages, sendMessage } = useRorkAgent({
    tools: {
      addTask: createRorkTool({
        description: "Add a new task to the planner",
        zodSchema: z.object({
          title: z.string().describe("Title of the task"),
          description: z.string().describe("Detailed description").optional(),
          projectId: z
            .string()
            .describe(
              `Project ID. Available projects: ${projects.map((p) => `${p.id} (${p.name})`).join(", ")}. If not provided, will use the first project.`
            )
            .optional(),
          priority: z
            .enum(["low", "medium", "high"])
            .describe("Priority level")
            .optional(),
        }),
        async execute(input) {
          const projectId = input.projectId || projects[0]?.id || "";
          if (!projectId) {
            return "No projects available. Please create a project first.";
          }
          addTask({
            title: input.title,
            description: input.description,
            projectId,
            priority: input.priority || "medium",
            status: "todo",
          });
          return `Task "${input.title}" added successfully${projects.find(p => p.id === projectId) ? ` to project "${projects.find(p => p.id === projectId)?.name}"` : ""}.`;
        },
      }),
      analyzeTasks: createRorkTool({
        description: "Analyze user's current tasks and provide insights",
        zodSchema: z.object({
          projectId: z
            .string()
            .describe("Project ID to analyze")
            .optional(),
        }),
        async execute(input) {
          const projectTasks = input.projectId
            ? tasks.filter((t) => t.projectId === input.projectId)
            : tasks;

          const completed = projectTasks.filter((t) => t.status === "completed").length;
          const inProgress = projectTasks.filter((t) => t.status === "in_progress").length;
          const todo = projectTasks.filter((t) => t.status === "todo").length;
          const highPriority = projectTasks.filter((t) => t.priority === "high").length;

          const stats = {
            total: projectTasks.length,
            completed,
            inProgress,
            todo,
            highPriority,
            completionRate:
              projectTasks.length > 0
                ? Math.round((completed / projectTasks.length) * 100)
                : 0,
          };

          return `Task Analysis:\n- Total: ${stats.total}\n- Completed: ${stats.completed} (${stats.completionRate}%)\n- In Progress: ${stats.inProgress}\n- Todo: ${stats.todo}\n- High Priority: ${stats.highPriority}`;
        },
      }),
    },
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    await sendMessage(input.trim());
    setInput("");
  };

  const suggestions = [
    "Break down my tasks into smaller steps",
    "Suggest tasks for today",
    "Analyze my productivity",
    "Help me prioritize tasks",
  ];

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "AI Assistant",
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
            <Sparkles size={24} color={colors.primary} />
          </View>
          <Text style={styles.headerTitle}>AI Assistant</Text>
          <Text style={styles.headerSubtitle}>
            Get help with task management, planning, and productivity
          </Text>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 ? (
            <View style={styles.emptyState}>
              <Lightbulb size={48} color={colors.primary} />
              <Text style={styles.emptyTitle}>How can I help you?</Text>
              <Text style={styles.emptySubtitle}>
                Ask me to add tasks, break down projects, or get productivity insights
              </Text>

              <View style={styles.suggestionsContainer}>
                <Text style={styles.suggestionsTitle}>Suggestions:</Text>
                {suggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionChip}
                    onPress={() => {
                      if (Platform.OS !== "web") {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }
                      setInput(suggestion);
                    }}
                  >
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <>
              {messages.map((message) => (
                <View key={message.id} style={styles.messageGroup}>
                  <View
                    style={[
                      styles.messageBubble,
                      message.role === "user"
                        ? styles.userBubble
                        : styles.assistantBubble,
                    ]}
                  >
                    {message.parts.map((part, index) => {
                      if (part.type === "text") {
                        return (
                          <Text
                            key={`${message.id}-${index}`}
                            style={[
                              styles.messageText,
                              message.role === "user" && styles.userMessageText,
                            ]}
                          >
                            {part.text}
                          </Text>
                        );
                      }

                      if (part.type === "tool") {
                        const toolName = part.toolName;

                        switch (part.state) {
                          case "input-streaming":
                          case "input-available":
                            return (
                              <View
                                key={`${message.id}-${index}`}
                                style={styles.toolCall}
                              >
                                <ActivityIndicator
                                  size="small"
                                  color={colors.primary}
                                />
                                <Text style={styles.toolText}>
                                  Calling {toolName}...
                                </Text>
                              </View>
                            );

                          case "output-available":
                            return (
                              <View
                                key={`${message.id}-${index}`}
                                style={styles.toolSuccess}
                              >
                                <Text style={styles.toolSuccessText}>
                                  ✓ {toolName} completed
                                </Text>
                              </View>
                            );

                          case "output-error":
                            return (
                              <View
                                key={`${message.id}-${index}`}
                                style={styles.toolError}
                              >
                                <Text style={styles.toolErrorText}>
                                  Error: {part.errorText}
                                </Text>
                              </View>
                            );
                        }
                      }
                      return null;
                    })}
                  </View>
                </View>
              ))}
            </>
          )}
          <View style={styles.bottomSpacer} />
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Ask me anything..."
            placeholderTextColor={colors.textTertiary}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, !input.trim() && styles.sendButtonDisabled]}
            onPress={handleSend}
            disabled={!input.trim()}
          >
            <Send size={20} color={colors.surface} />
          </TouchableOpacity>
        </View>
      </View>
    </>
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
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  emptyState: {
    alignItems: "center",
    paddingTop: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
    marginBottom: 32,
  },
  suggestionsContainer: {
    width: "100%",
    gap: 8,
  },
  suggestionsTitle: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  suggestionChip: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.text,
  },
  messageGroup: {
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: "85%",
    borderRadius: 16,
    padding: 14,
    gap: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
  },
  assistantBubble: {
    alignSelf: "flex-start",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  userMessageText: {
    color: colors.surface,
  },
  toolCall: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 8,
  },
  toolText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  toolSuccess: {
    padding: 8,
    backgroundColor: colors.success + "20",
    borderRadius: 8,
  },
  toolSuccessText: {
    fontSize: 13,
    color: colors.success,
    fontWeight: "600" as const,
  },
  toolError: {
    padding: 8,
    backgroundColor: colors.error + "20",
    borderRadius: 8,
  },
  toolErrorText: {
    fontSize: 13,
    color: colors.error,
  },
  bottomSpacer: {
    height: 20,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
    alignItems: "flex-end",
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
