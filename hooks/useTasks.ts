import { useMemo } from "react";
import { usePlanner } from "@/contexts/PlannerContext";
import { Task } from "@/types";

export function useTasks() {
  const { tasks, projects, selectedEventId } = usePlanner();

  // Get tasks for selected event
  const eventTasks = useMemo(() => {
    if (!selectedEventId) return tasks;
    const eventProjects = projects.filter((p) => p.eventId === selectedEventId);
    return tasks.filter((task) => eventProjects.some((p) => p.id === task.projectId));
  }, [tasks, projects, selectedEventId]);

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = eventTasks.filter((t) => t.status === "completed").length;
    const inProgress = eventTasks.filter((t) => t.status === "in_progress").length;
    const todo = eventTasks.filter((t) => t.status === "todo").length;
    const totalPrice = eventTasks.reduce((sum, t) => sum + (t.price || 0), 0);
    const completedPrice = eventTasks
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + (t.price || 0), 0);

    return {
      total: eventTasks.length,
      completed,
      inProgress,
      todo,
      totalPrice,
      completedPrice,
      percentComplete: eventTasks.length > 0 ? (completed / eventTasks.length) * 100 : 0,
    };
  }, [eventTasks]);

  // Get upcoming tasks (with due dates, sorted)
  const upcomingTasks = useMemo(() => {
    return eventTasks
      .filter((t) => t.status !== "completed" && t.dueDate)
      .sort((a, b) => {
        const dateA = new Date(a.dueDate!);
        const dateB = new Date(b.dueDate!);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [eventTasks]);

  // Get recent tasks (sorted by creation date)
  const recentTasks = useMemo(() => {
    return eventTasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);
  }, [eventTasks]);

  // Get tasks by status
  const tasksByStatus = useMemo(() => {
    return {
      todo: eventTasks.filter((t) => t.status === "todo"),
      inProgress: eventTasks.filter((t) => t.status === "in_progress"),
      completed: eventTasks.filter((t) => t.status === "completed"),
    };
  }, [eventTasks]);

  // Get tasks by priority
  const tasksByPriority = useMemo(() => {
    return {
      high: eventTasks.filter((t) => t.priority === "high"),
      medium: eventTasks.filter((t) => t.priority === "medium"),
      low: eventTasks.filter((t) => t.priority === "low"),
    };
  }, [eventTasks]);

  return {
    tasks: eventTasks,
    stats,
    upcomingTasks,
    recentTasks,
    tasksByStatus,
    tasksByPriority,
  };
}

