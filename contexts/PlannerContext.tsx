import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Task, Project, User, BudgetCategory, BudgetExpense, Event } from "@/types";

const TASKS_KEY = "@planner_tasks";
const PROJECTS_KEY = "@planner_projects";
const BUDGET_CATEGORIES_KEY = "@planner_budget_categories";
const BUDGET_EXPENSES_KEY = "@planner_budget_expenses";
const EVENTS_KEY = "@planner_events";
const SELECTED_EVENT_KEY = "@planner_selected_event";

const defaultProjects: Project[] = [];

const mockUsers: User[] = [];

const defaultBudgetCategories: BudgetCategory[] = [
  {
    id: "venue",
    name: "Venue",
    icon: "building",
    allocated: 0,
    spent: 0,
    color: "#EC4899",
  },
  {
    id: "catering",
    name: "Catering",
    icon: "utensils",
    allocated: 0,
    spent: 0,
    color: "#F59E0B",
  },
  {
    id: "photography",
    name: "Photography",
    icon: "camera",
    allocated: 0,
    spent: 0,
    color: "#8B5CF6",
  },
  {
    id: "makeup",
    name: "Makeup & Beauty",
    icon: "sparkles",
    allocated: 0,
    spent: 0,
    color: "#10B981",
  },
  {
    id: "flowers",
    name: "Flowers & Decor",
    icon: "flower",
    allocated: 0,
    spent: 0,
    color: "#06B6D4",
  },
  {
    id: "music",
    name: "Music & Entertainment",
    icon: "music",
    allocated: 0,
    spent: 0,
    color: "#F97316",
  },
  {
    id: "attire",
    name: "Attire",
    icon: "shirt",
    allocated: 0,
    spent: 0,
    color: "#EF4444",
  },
  {
    id: "transportation",
    name: "Transportation",
    icon: "car",
    allocated: 0,
    spent: 0,
    color: "#6366F1",
  },
];

export const [PlannerContext, usePlanner] = createContextHook(() => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [budgetCategories, setBudgetCategories] = useState<BudgetCategory[]>(defaultBudgetCategories);
  const [budgetExpenses, setBudgetExpenses] = useState<BudgetExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Helper function to map task titles to budget categories
  const getCategoryFromTaskTitle = (title: string): string => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("venue") || lowerTitle.includes("location")) return "venue";
    if (lowerTitle.includes("cater") || lowerTitle.includes("food") || lowerTitle.includes("meal")) return "catering";
    if (lowerTitle.includes("photo") || lowerTitle.includes("video") || lowerTitle.includes("camera")) return "photography";
    if (lowerTitle.includes("makeup") || lowerTitle.includes("beauty") || lowerTitle.includes("hair") || lowerTitle.includes("make up")) return "makeup";
    if (lowerTitle.includes("flower") || lowerTitle.includes("decor") || lowerTitle.includes("decoration")) return "flowers";
    if (lowerTitle.includes("music") || lowerTitle.includes("dj") || lowerTitle.includes("entertainment")) return "music";
    if (lowerTitle.includes("dress") || lowerTitle.includes("suit") || lowerTitle.includes("attire") || lowerTitle.includes("outfit")) return "attire";
    if (lowerTitle.includes("car") || lowerTitle.includes("transport") || lowerTitle.includes("limo")) return "transportation";
    return "venue"; // default
  };

  useEffect(() => {
    loadData();
  }, []);

  // Sync task prices to budget expenses
  useEffect(() => {
    if (!tasks.length && budgetExpenses.length === 0) return;
    
    const tasksWithPrices = tasks.filter((t) => t.price && t.price > 0);
    const existingExpenseTaskIds = new Set(
      budgetExpenses.filter((e) => e.title.startsWith("Task: ")).map((e) => e.id.replace("task-", ""))
    );

    const newExpenses: BudgetExpense[] = tasksWithPrices
      .filter((task) => !existingExpenseTaskIds.has(task.id))
      .map((task) => {
        // Map task title to category
        const categoryId = getCategoryFromTaskTitle(task.title);
        return {
          id: `task-${task.id}`,
          categoryId,
          title: `Task: ${task.title}`,
          amount: task.price!,
          date: task.createdAt,
          isPaid: task.status === "completed",
          createdAt: task.createdAt,
        };
      });

    // Update existing task expenses
    const updatedExpenses = budgetExpenses.map((expense) => {
      if (expense.title.startsWith("Task: ")) {
        const taskId = expense.id.replace("task-", "");
        const task = tasks.find((t) => t.id === taskId);
        if (task && task.price) {
          return {
            ...expense,
            amount: task.price,
            isPaid: task.status === "completed",
            categoryId: getCategoryFromTaskTitle(task.title),
          };
        }
      }
      return expense;
    });

    // Remove expenses for deleted tasks or tasks without prices
    const validTaskIds = new Set(tasksWithPrices.map((t) => t.id));
    const filteredExpenses = updatedExpenses.filter(
      (e) => !e.title.startsWith("Task: ") || validTaskIds.has(e.id.replace("task-", ""))
    );

    // Add new expenses
    const finalExpenses = [...filteredExpenses, ...newExpenses];

    // Only update if there are actual changes
    const hasChanges = 
      newExpenses.length > 0 ||
      finalExpenses.length !== budgetExpenses.length ||
      JSON.stringify(finalExpenses.sort((a, b) => a.id.localeCompare(b.id))) !== 
      JSON.stringify(budgetExpenses.sort((a, b) => a.id.localeCompare(b.id)));

    if (hasChanges) {
      saveBudgetExpenses(finalExpenses);
    }
  }, [tasks, budgetExpenses]);

  // Update category spent amounts
  useEffect(() => {
    const updatedCategories = budgetCategories.map((category) => {
      const categoryExpenses = budgetExpenses.filter((e) => e.categoryId === category.id);
      const totalSpent = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
      return { ...category, spent: totalSpent };
    });
    if (JSON.stringify(updatedCategories) !== JSON.stringify(budgetCategories)) {
      setBudgetCategories(updatedCategories);
    }
  }, [budgetExpenses]);

  const loadData = async () => {
    try {
      const [tasksData, projectsData, eventsData, selectedEventData, categoriesData, expensesData] = await Promise.all([
        AsyncStorage.getItem(TASKS_KEY),
        AsyncStorage.getItem(PROJECTS_KEY),
        AsyncStorage.getItem(EVENTS_KEY),
        AsyncStorage.getItem(SELECTED_EVENT_KEY),
        AsyncStorage.getItem(BUDGET_CATEGORIES_KEY),
        AsyncStorage.getItem(BUDGET_EXPENSES_KEY),
      ]);

      if (tasksData) {
        setTasks(JSON.parse(tasksData));
      }
      if (projectsData) {
        setProjects(JSON.parse(projectsData));
      }
      if (eventsData) {
        setEvents(JSON.parse(eventsData));
      }
      if (selectedEventData) {
        setSelectedEventId(selectedEventData);
      }
      if (categoriesData) {
        const loadedCategories = JSON.parse(categoriesData);
        // Merge with defaults if categories are empty
        if (loadedCategories.length === 0) {
          setBudgetCategories(defaultBudgetCategories);
        } else {
          setBudgetCategories(loadedCategories);
        }
      } else {
        // First time - set default categories
        setBudgetCategories(defaultBudgetCategories);
      }
      if (expensesData) {
        setBudgetExpenses(JSON.parse(expensesData));
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(newTasks));
      setTasks(newTasks);
    } catch (error) {
      console.error("Failed to save tasks:", error);
    }
  };

  const saveProjects = async (newProjects: Project[]) => {
    try {
      await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(newProjects));
      setProjects(newProjects);
    } catch (error) {
      console.error("Failed to save projects:", error);
    }
  };

  const addTask = useCallback(
    (task: Omit<Task, "id" | "createdAt">) => {
      const newTask: Task = {
        ...task,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      saveTasks([...tasks, newTask]);
    },
    [tasks]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      const updatedTasks = tasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      );
      saveTasks(updatedTasks);
    },
    [tasks]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      saveTasks(tasks.filter((task) => task.id !== taskId));
    },
    [tasks]
  );

  const toggleTaskStatus = useCallback(
    (taskId: string) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newStatus: Task["status"] =
        task.status === "completed"
          ? "todo"
          : task.status === "todo"
          ? "in_progress"
          : "completed";

      const updates: Partial<Task> = {
        status: newStatus,
        ...(newStatus === "completed" && { completedAt: new Date().toISOString() }),
      };

      updateTask(taskId, updates);
    },
    [tasks, updateTask]
  );

  const addProject = useCallback(
    (project: Omit<Project, "id" | "createdAt">) => {
      const newProject: Project = {
        ...project,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      saveProjects([...projects, newProject]);
    },
    [projects]
  );

  const getTasksByProject = useCallback(
    (projectId: string) => {
      return tasks.filter((task) => task.projectId === projectId);
    },
    [tasks]
  );

  const getSharedTasks = useCallback(() => {
    const sharedProjects = projects.filter((p) => p.sharedWith.length > 0);
    return tasks.filter((task) =>
      sharedProjects.some((p) => p.id === task.projectId)
    );
  }, [tasks, projects]);

  const saveBudgetCategories = async (newCategories: BudgetCategory[]) => {
    try {
      await AsyncStorage.setItem(BUDGET_CATEGORIES_KEY, JSON.stringify(newCategories));
      setBudgetCategories(newCategories);
    } catch (error) {
      console.error("Failed to save budget categories:", error);
    }
  };

  const saveBudgetExpenses = async (newExpenses: BudgetExpense[]) => {
    try {
      await AsyncStorage.setItem(BUDGET_EXPENSES_KEY, JSON.stringify(newExpenses));
      setBudgetExpenses(newExpenses);
    } catch (error) {
      console.error("Failed to save budget expenses:", error);
    }
  };

  const addBudgetCategory = useCallback(
    (category: Omit<BudgetCategory, "id">) => {
      const newCategory: BudgetCategory = {
        ...category,
        id: Date.now().toString(),
      };
      saveBudgetCategories([...budgetCategories, newCategory]);
    },
    [budgetCategories]
  );

  const addBudgetExpense = useCallback(
    (expense: Omit<BudgetExpense, "id" | "createdAt">) => {
      const newExpense: BudgetExpense = {
        ...expense,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      saveBudgetExpenses([...budgetExpenses, newExpense]);
    },
    [budgetExpenses]
  );

  const updateBudgetExpense = useCallback(
    (expenseId: string, updates: Partial<BudgetExpense>) => {
      const updatedExpenses = budgetExpenses.map((expense) =>
        expense.id === expenseId ? { ...expense, ...updates } : expense
      );
      saveBudgetExpenses(updatedExpenses);
    },
    [budgetExpenses]
  );

  const deleteBudgetExpense = useCallback(
    (expenseId: string) => {
      saveBudgetExpenses(budgetExpenses.filter((expense) => expense.id !== expenseId));
    },
    [budgetExpenses]
  );

  const updateBudgetCategory = useCallback(
    (categoryId: string, updates: Partial<BudgetCategory>) => {
      const updatedCategories = budgetCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, ...updates } : cat
      );
      saveBudgetCategories(updatedCategories);
    },
    [budgetCategories]
  );

  // Event management
  const saveEvents = async (newEvents: Event[]) => {
    try {
      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(newEvents));
      setEvents(newEvents);
    } catch (error) {
      console.error("Failed to save events:", error);
    }
  };

  const addEvent = useCallback(
    (event: Omit<Event, "id" | "createdAt">) => {
      const newEvent: Event = {
        ...event,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      const updatedEvents = [...events, newEvent];
      saveEvents(updatedEvents);
      // Auto-select the new event
      setSelectedEventId(newEvent.id);
      AsyncStorage.setItem(SELECTED_EVENT_KEY, newEvent.id);
    },
    [events]
  );

  const deleteEvent = useCallback(
    (eventId: string) => {
      const updatedEvents = events.filter((e) => e.id !== eventId);
      saveEvents(updatedEvents);
      // If deleted event was selected, clear selection
      if (selectedEventId === eventId) {
        setSelectedEventId(null);
        AsyncStorage.removeItem(SELECTED_EVENT_KEY);
      }
    },
    [events, selectedEventId]
  );

  const updateEvent = useCallback(
    (eventId: string, updates: Partial<Event>) => {
      const updatedEvents = events.map((event) =>
        event.id === eventId ? { ...event, ...updates } : event
      );
      saveEvents(updatedEvents);
    },
    [events]
  );

  const selectEvent = useCallback((eventId: string | null) => {
    setSelectedEventId(eventId);
    if (eventId) {
      AsyncStorage.setItem(SELECTED_EVENT_KEY, eventId);
    } else {
      AsyncStorage.removeItem(SELECTED_EVENT_KEY);
    }
  }, []);

  // Get tasks for selected event
  const getTasksForSelectedEvent = useCallback(() => {
    if (!selectedEventId) return tasks;
    const eventProjects = projects.filter((p) => p.eventId === selectedEventId);
    return tasks.filter((task) => eventProjects.some((p) => p.id === task.projectId));
  }, [tasks, projects, selectedEventId]);

  return useMemo(
    () => ({
      tasks,
      projects,
      events,
      selectedEventId,
      selectedProjectId,
      isLoading,
      setSelectedProjectId,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      addProject,
      getTasksByProject,
      getSharedTasks,
      getTasksForSelectedEvent,
      users: mockUsers,
      budgetCategories,
      budgetExpenses,
      addBudgetCategory,
      addBudgetExpense,
      updateBudgetExpense,
      deleteBudgetExpense,
      updateBudgetCategory,
      addEvent,
      updateEvent,
      deleteEvent,
      selectEvent,
    }),
    [
      tasks,
      projects,
      events,
      selectedEventId,
      isLoading,
      selectedProjectId,
      addTask,
      updateTask,
      deleteTask,
      toggleTaskStatus,
      addProject,
      getTasksByProject,
      getSharedTasks,
      getTasksForSelectedEvent,
      budgetCategories,
      budgetExpenses,
      addBudgetCategory,
      addBudgetExpense,
      updateBudgetExpense,
      deleteBudgetExpense,
      updateBudgetCategory,
      addEvent,
      updateEvent,
      deleteEvent,
      selectEvent,
    ]
  );
});
