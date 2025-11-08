import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { useState, useMemo } from "react";
import { usePlanner } from "@/contexts/PlannerContext";
import {
  Plus,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  ListTodo,
  ChevronLeft,
  ChevronRight,
  Filter,
  Circle,
} from "lucide-react-native";
import colors from "@/constants/colors";
import { Task, TaskStatus } from "@/types";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useTasks } from "@/hooks/useTasks";
import { useBudget } from "@/hooks/useBudget";
import TaskCard from "@/components/tasks/TaskCard";
import EventSelector from "@/components/events/EventSelector";
import EventSheet from "@/components/events/EventSheet";
import CreateEventSheet from "@/components/events/CreateEventSheet";
import AddTaskSheet from "@/components/tasks/AddTaskSheet";

export default function OverviewScreen() {
  const {
    projects,
    selectedEventId,
    toggleTaskStatus,
    deleteTask,
    selectEvent,
  } = usePlanner();
  
  const { stats, upcomingTasks, tasks: allTasks, tasksByStatus } = useTasks();
  const { totals } = useBudget();
  
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEventSheet, setShowEventSheet] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  
  // Filter and pagination state
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all" | "with_price" | "without_price">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  
  // Filter tasks based on selected filter
  const filteredTasks = useMemo(() => {
    let filtered = [...allTasks];
    
    // Apply status filter
    if (statusFilter === "todo") {
      filtered = tasksByStatus.todo;
    } else if (statusFilter === "in_progress") {
      filtered = tasksByStatus.inProgress;
    } else if (statusFilter === "completed") {
      filtered = tasksByStatus.completed;
    } else if (statusFilter === "with_price") {
      filtered = filtered.filter((t) => t.price && t.price > 0);
    } else if (statusFilter === "without_price") {
      filtered = filtered.filter((t) => !t.price || t.price === 0);
    }
    
    // Sort by creation date (newest first)
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [allTasks, statusFilter, tasksByStatus]);
  
  // Paginate tasks
  const paginatedTasks = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredTasks.slice(startIndex, endIndex);
  }, [filteredTasks, currentPage, pageSize]);
  
  const totalPages = Math.ceil(filteredTasks.length / pageSize);
  
  // Reset to page 1 when filter changes
  const handleFilterChange = (filter: typeof statusFilter) => {
    setStatusFilter(filter);
    setCurrentPage(1);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

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
          title: "planYedu",
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.greeting}>Welcome to planYedu</Text>

          {/* Event Selection */}
          <EventSelector
            onShowEventSheet={() => setShowEventSheet(true)}
            onShowCreateEvent={() => setShowCreateEvent(true)}
          />

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: "#EC4899" }]}>
              <ListTodo size={24} color={colors.surface} />
              <Text style={styles.statCardNumber}>{stats.total}</Text>
              <Text style={styles.statCardLabel}>Total Tasks</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#10B981" }]}>
              <CheckCircle2 size={24} color={colors.surface} />
              <Text style={styles.statCardNumber}>{stats.completed}</Text>
              <Text style={styles.statCardLabel}>Completed</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#F59E0B" }]}>
              <Clock size={24} color={colors.surface} />
              <Text style={styles.statCardNumber}>{stats.inProgress}</Text>
              <Text style={styles.statCardLabel}>In Progress</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: "#8B5CF6" }]}>
              <DollarSign size={24} color={colors.surface} />
              <Text style={styles.statCardNumber}>
                ${stats.totalPrice.toLocaleString()}
              </Text>
              <Text style={styles.statCardLabel}>Total Cost</Text>
            </View>
          </View>

          {/* Task Progress Card */}
          {stats.total > 0 && (
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View>
                  <Text style={styles.progressTitle}>Task Progress</Text>
                  <Text style={styles.progressSubtitle}>
                    {stats.completed} of {stats.total} tasks completed
                  </Text>
                </View>
                <View style={styles.progressPercentContainer}>
                  <Text style={styles.progressPercent}>
                    {Math.round(stats.percentComplete)}%
                  </Text>
                </View>
              </View>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(stats.percentComplete, 100)}%`,
                      backgroundColor: stats.percentComplete === 100 ? "#10B981" : "#3B82F6",
                    },
                  ]}
                />
              </View>
              <View style={styles.progressStats}>
                <View style={styles.progressStatItem}>
                  <View style={[styles.progressStatDot, { backgroundColor: "#10B981" }]} />
                  <Text style={styles.progressStatText}>
                    {stats.completed} Completed
                  </Text>
                </View>
                <View style={styles.progressStatItem}>
                  <View style={[styles.progressStatDot, { backgroundColor: "#F59E0B" }]} />
                  <Text style={styles.progressStatText}>
                    {stats.inProgress} In Progress
                  </Text>
                </View>
                <View style={styles.progressStatItem}>
                  <View style={[styles.progressStatDot, { backgroundColor: colors.textTertiary }]} />
                  <Text style={styles.progressStatText}>
                    {stats.todo} To Do
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Budget Overview */}
          {totals.taskBasedTotal > 0 && (
            <View style={styles.budgetCard}>
              <Text style={styles.sectionTitle}>Budget Overview</Text>
              <View style={styles.budgetRow}>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Total Budget</Text>
                  <Text style={styles.budgetAmount}>
                    ${totals.allocated.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Spent</Text>
                  <Text style={[styles.budgetAmount, { color: colors.error }]}>
                    ${totals.spent.toLocaleString()}
                  </Text>
                </View>
                <View style={styles.budgetItem}>
                  <Text style={styles.budgetLabel}>Remaining</Text>
                  <Text style={[styles.budgetAmount, { color: colors.success }]}>
                    ${totals.remaining.toLocaleString()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Upcoming Tasks */}
          {upcomingTasks.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Calendar size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>Upcoming Tasks</Text>
              </View>
              {upcomingTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  project={projects.find((p) => p.id === task.projectId)}
                  onPress={() => handleTaskPress(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => {
                    setEditingTask(task);
                    setShowAddTask(true);
                  }}
                  showProject
                />
              ))}
            </View>
          )}

          {/* All Tasks */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionHeaderLeft}>
                <ListTodo size={20} color={colors.primary} />
                <Text style={styles.sectionTitle}>
                  {filteredTasks.length === 0 ? "Get Started" : "All Tasks"}
                </Text>
              </View>
              {filteredTasks.length > 0 && (
                <Text style={styles.taskCount}>
                  {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                </Text>
              )}
            </View>

            {!selectedEventId ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Select an event to view tasks</Text>
                <Text style={styles.emptySubtitle}>
                  Create or select an event to start planning
                </Text>
              </View>
            ) : allTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <CheckCircle2 size={64} color={colors.border} />
                <Text style={styles.emptyTitle}>No tasks yet</Text>
                <Text style={styles.emptySubtitle}>
                  Start planning by adding your first task
                </Text>
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => {
                    if (Platform.OS !== "web") {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    }
                    setShowAddTask(true);
                  }}
                >
                  <Plus size={20} color={colors.surface} />
                  <Text style={styles.addFirstButtonText}>Add Your First Task</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* Filter Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterContainer}
                  contentContainerStyle={styles.filterContent}
                >
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      statusFilter === "all" && styles.filterChipActive,
                    ]}
                    onPress={() => handleFilterChange("all")}
                  >
                    <Filter size={14} color={statusFilter === "all" ? colors.surface : colors.textSecondary} />
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === "all" && styles.filterChipTextActive,
                      ]}
                    >
                      All
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      statusFilter === "todo" && styles.filterChipActive,
                    ]}
                    onPress={() => handleFilterChange("todo")}
                  >
                    <Circle size={14} color={statusFilter === "todo" ? colors.surface : colors.textTertiary} />
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === "todo" && styles.filterChipTextActive,
                      ]}
                    >
                      Pending ({tasksByStatus.todo.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      statusFilter === "in_progress" && styles.filterChipActive,
                    ]}
                    onPress={() => handleFilterChange("in_progress")}
                  >
                    <Clock size={14} color={statusFilter === "in_progress" ? colors.surface : colors.warning} />
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === "in_progress" && styles.filterChipTextActive,
                      ]}
                    >
                      In Progress ({tasksByStatus.inProgress.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      statusFilter === "completed" && styles.filterChipActive,
                    ]}
                    onPress={() => handleFilterChange("completed")}
                  >
                    <CheckCircle2 size={14} color={statusFilter === "completed" ? colors.surface : colors.success} />
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === "completed" && styles.filterChipTextActive,
                      ]}
                    >
                      Completed ({tasksByStatus.completed.length})
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      statusFilter === "with_price" && styles.filterChipActive,
                    ]}
                    onPress={() => handleFilterChange("with_price")}
                  >
                    <DollarSign size={14} color={statusFilter === "with_price" ? colors.surface : colors.primary} />
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === "with_price" && styles.filterChipTextActive,
                      ]}
                    >
                      With Budget
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterChip,
                      statusFilter === "without_price" && styles.filterChipActive,
                    ]}
                    onPress={() => handleFilterChange("without_price")}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === "without_price" && styles.filterChipTextActive,
                      ]}
                    >
                      Without Budget
                    </Text>
                  </TouchableOpacity>
                </ScrollView>

                {/* Task List */}
                {filteredTasks.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyTitle}>No tasks found</Text>
                    <Text style={styles.emptySubtitle}>
                      Try selecting a different filter
                    </Text>
                  </View>
                ) : (
                  <>
                    {paginatedTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        project={projects.find((p) => p.id === task.projectId)}
                        onPress={() => handleTaskPress(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onEdit={() => {
                          setEditingTask(task);
                          setShowAddTask(true);
                        }}
                        showProject
                      />
                    ))}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <View style={styles.paginationContainer}>
                        <TouchableOpacity
                          style={[
                            styles.paginationButton,
                            currentPage === 1 && styles.paginationButtonDisabled,
                          ]}
                          onPress={() => {
                            if (currentPage > 1) {
                              setCurrentPage(currentPage - 1);
                              if (Platform.OS !== "web") {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }
                            }
                          }}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft size={18} color={currentPage === 1 ? colors.textTertiary : colors.text} />
                          <Text
                            style={[
                              styles.paginationButtonText,
                              currentPage === 1 && styles.paginationButtonTextDisabled,
                            ]}
                          >
                            Previous
                          </Text>
                        </TouchableOpacity>

                        <View style={styles.paginationInfo}>
                          <Text style={styles.paginationText}>
                            Page {currentPage} of {totalPages}
                          </Text>
                          <Text style={styles.paginationSubtext}>
                            Showing {paginatedTasks.length} of {filteredTasks.length} tasks
                          </Text>
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.paginationButton,
                            currentPage === totalPages && styles.paginationButtonDisabled,
                          ]}
                          onPress={() => {
                            if (currentPage < totalPages) {
                              setCurrentPage(currentPage + 1);
                              if (Platform.OS !== "web") {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                              }
                            }
                          }}
                          disabled={currentPage === totalPages}
                        >
                          <Text
                            style={[
                              styles.paginationButtonText,
                              currentPage === totalPages && styles.paginationButtonTextDisabled,
                            ]}
                          >
                            Next
                          </Text>
                          <ChevronRight size={18} color={currentPage === totalPages ? colors.textTertiary : colors.text} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </>
                )}
              </>
            )}
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* FAB Button */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setShowAddTask(true);
          }}
        >
          <Plus size={28} color={colors.surface} />
        </TouchableOpacity>

        {/* Modals */}
        {showAddTask && (
          <AddTaskSheet
            projectId={projects[0]?.id || null}
            editingTask={editingTask}
            onClose={() => {
              setShowAddTask(false);
              setEditingTask(null);
            }}
          />
        )}

        {showEventSheet && (
          <EventSheet
            onClose={() => setShowEventSheet(false)}
            onSelectEvent={(eventId) => {
              selectEvent(eventId);
              setShowEventSheet(false);
            }}
            onCreateEvent={() => {
              setShowEventSheet(false);
              setShowCreateEvent(true);
            }}
          />
        )}

        {showCreateEvent && (
          <CreateEventSheet
            onClose={() => setShowCreateEvent(false)}
            onEventCreated={() => setShowCreateEvent(false)}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    width: "47%",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardNumber: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.surface,
    marginTop: 8,
    marginBottom: 4,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: colors.surface,
    opacity: 0.9,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  progressSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  progressPercentContainer: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  progressPercent: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.primary,
  },
  progressBar: {
    height: 10,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    borderRadius: 5,
    transition: "width 0.3s ease",
  },
  progressStats: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  progressStatItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressStatDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressStatText: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.textSecondary,
  },
  budgetCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  budgetItem: {
    flex: 1,
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: "500" as const,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  budgetAmount: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
  },
  taskCount: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  filterContainer: {
    marginBottom: 16,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  filterContent: {
    gap: 8,
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.surface,
  },
  paginationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  paginationButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  paginationButtonTextDisabled: {
    color: colors.textTertiary,
  },
  paginationInfo: {
    alignItems: "center",
  },
  paginationText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 2,
  },
  paginationSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
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
    marginBottom: 24,
  },
  addFirstButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  addFirstButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.surface,
  },
  bottomSpacer: {
    height: 80,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
