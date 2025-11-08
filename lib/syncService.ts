import { supabase } from "./supabase";
import { Task, Project, Event, BudgetCategory, BudgetExpense } from "@/types";

export class SyncService {
  private userId: string | null = null;
  private realtimeSubscriptions: Map<string, any> = new Map();

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Events
  async syncEvents(): Promise<Event[]> {
    if (!this.userId) return [];
    
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error syncing events:", error);
      return [];
    }

    return (data || []).map((e) => ({
      id: e.id,
      name: e.name,
      type: e.type,
      color: e.color,
      createdAt: e.created_at,
      budget: e.budget,
    }));
  }

  async createEvent(event: Omit<Event, "id" | "createdAt">): Promise<Event | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from("events")
      .insert({
        user_id: this.userId,
        name: event.name,
        type: event.type,
        color: event.color,
        budget: event.budget,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating event:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      type: data.type,
      color: data.color,
      createdAt: data.created_at,
      budget: data.budget,
    };
  }

  async updateEvent(id: string, updates: Partial<Event>): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from("events")
      .update({
        name: updates.name,
        type: updates.type,
        color: updates.color,
        budget: updates.budget,
      })
      .eq("id", id)
      .eq("user_id", this.userId);

    return !error;
  }

  async deleteEvent(id: string): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from("events")
      .delete()
      .eq("id", id)
      .eq("user_id", this.userId);

    return !error;
  }

  // Projects
  async syncProjects(): Promise<Project[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .or(`user_id.eq.${this.userId},shared_with.cs.{${this.userId}}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error syncing projects:", error);
      return [];
    }

    return (data || []).map((p) => ({
      id: p.id,
      name: p.name,
      color: p.color,
      icon: p.icon,
      createdAt: p.created_at,
      sharedWith: p.shared_with || [],
      eventId: p.event_id,
    }));
  }

  async createProject(project: Omit<Project, "id" | "createdAt">): Promise<Project | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from("projects")
      .insert({
        user_id: this.userId,
        name: project.name,
        color: project.color,
        icon: project.icon,
        event_id: project.eventId,
        shared_with: project.sharedWith || [],
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating project:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      color: data.color,
      icon: data.icon,
      createdAt: data.created_at,
      sharedWith: data.shared_with || [],
      eventId: data.event_id,
    };
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from("projects")
      .update({
        name: updates.name,
        color: updates.color,
        icon: updates.icon,
        event_id: updates.eventId,
        shared_with: updates.sharedWith,
      })
      .eq("id", id);

    return !error;
  }

  async shareProject(projectId: string, userIds: string[]): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from("projects")
      .update({ shared_with: userIds })
      .eq("id", projectId);

    return !error;
  }

  // Tasks
  async syncTasks(): Promise<Task[]> {
    if (!this.userId) return [];

    // Get tasks from projects user owns or has access to
    const { data: projects } = await supabase
      .from("projects")
      .select("id")
      .or(`user_id.eq.${this.userId},shared_with.cs.{${this.userId}}`);

    if (!projects || projects.length === 0) return [];

    const projectIds = projects.map((p) => p.id);

    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .in("project_id", projectIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error syncing tasks:", error);
      return [];
    }

    return (data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      priority: t.priority,
      projectId: t.project_id,
      dueDate: t.due_date,
      price: t.price,
      createdAt: t.created_at,
      completedAt: t.completed_at,
    }));
  }

  async createTask(task: Omit<Task, "id" | "createdAt">): Promise<Task | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: this.userId,
        project_id: task.projectId,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        due_date: task.dueDate,
        price: task.price,
        completed_at: task.completedAt,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      return null;
    }

    return {
      id: data.id,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      projectId: data.project_id,
      dueDate: data.due_date,
      price: data.price,
      createdAt: data.created_at,
      completedAt: data.completed_at,
    };
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from("tasks")
      .update({
        title: updates.title,
        description: updates.description,
        status: updates.status,
        priority: updates.priority,
        due_date: updates.dueDate,
        price: updates.price,
        completed_at: updates.completedAt,
      })
      .eq("id", id);

    return !error;
  }

  async deleteTask(id: string): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase.from("tasks").delete().eq("id", id);

    return !error;
  }

  // Budget Categories
  async syncBudgetCategories(): Promise<BudgetCategory[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from("budget_categories")
      .select("*")
      .eq("user_id", this.userId);

    if (error) {
      console.error("Error syncing budget categories:", error);
      return [];
    }

    return (data || []).map((c) => ({
      id: c.id,
      name: c.name,
      icon: c.icon,
      allocated: c.allocated || 0,
      spent: c.spent || 0,
      color: c.color,
    }));
  }

  async upsertBudgetCategory(category: BudgetCategory): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase
      .from("budget_categories")
      .upsert({
        id: category.id,
        user_id: this.userId,
        name: category.name,
        icon: category.icon,
        allocated: category.allocated,
        spent: category.spent,
        color: category.color,
      });

    return !error;
  }

  // Budget Expenses
  async syncBudgetExpenses(): Promise<BudgetExpense[]> {
    if (!this.userId) return [];

    const { data, error } = await supabase
      .from("budget_expenses")
      .select("*")
      .eq("user_id", this.userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error syncing budget expenses:", error);
      return [];
    }

    return (data || []).map((e) => ({
      id: e.id,
      categoryId: e.category_id,
      title: e.title,
      amount: e.amount,
      vendor: e.vendor,
      date: e.date,
      notes: e.notes,
      isPaid: e.is_paid,
      createdAt: e.created_at,
    }));
  }

  async createBudgetExpense(expense: Omit<BudgetExpense, "id" | "createdAt">): Promise<BudgetExpense | null> {
    if (!this.userId) return null;

    const { data, error } = await supabase
      .from("budget_expenses")
      .insert({
        user_id: this.userId,
        category_id: expense.categoryId,
        title: expense.title,
        amount: expense.amount,
        vendor: expense.vendor,
        date: expense.date,
        notes: expense.notes,
        is_paid: expense.isPaid,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating budget expense:", error);
      return null;
    }

    return {
      id: data.id,
      categoryId: data.category_id,
      title: data.title,
      amount: data.amount,
      vendor: data.vendor,
      date: data.date,
      notes: data.notes,
      isPaid: data.is_paid,
      createdAt: data.created_at,
    };
  }

  async deleteBudgetExpense(id: string): Promise<boolean> {
    if (!this.userId) return false;

    const { error } = await supabase.from("budget_expenses").delete().eq("id", id);

    return !error;
  }

  // Real-time subscriptions
  subscribeToEvents(callback: (event: Event) => void) {
    if (!this.userId) return;

    const subscription = supabase
      .channel("events")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "events",
          filter: `user_id=eq.${this.userId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const event = payload.new as any;
            callback({
              id: event.id,
              name: event.name,
              type: event.type,
              color: event.color,
              createdAt: event.created_at,
              budget: event.budget,
            });
          }
        }
      )
      .subscribe();

    this.realtimeSubscriptions.set("events", subscription);
  }

  unsubscribeAll() {
    this.realtimeSubscriptions.forEach((sub) => {
      supabase.removeChannel(sub);
    });
    this.realtimeSubscriptions.clear();
  }
}

export const syncService = new SyncService();

