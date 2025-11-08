export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  dueDate?: string;
  price?: number;
  createdAt: string;
  completedAt?: string;
  assignedTo?: string[];
}

export interface Event {
  id: string;
  name: string;
  type: string; // EventType from eventTypes
  color: string;
  createdAt: string;
  budget?: number;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
  sharedWith: string[];
  eventId?: string; // Link project to event
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  color: string;
}

export interface AIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  allocated: number;
  spent: number;
  color: string;
}

export interface BudgetExpense {
  id: string;
  categoryId: string;
  title: string;
  amount: number;
  vendor?: string;
  date: string;
  notes?: string;
  isPaid: boolean;
  createdAt: string;
}
