import { useMemo } from "react";
import { usePlanner } from "@/contexts/PlannerContext";

export function useBudget() {
  const { budgetCategories, budgetExpenses, tasks } = usePlanner();

  // Calculate totals
  const totals = useMemo(() => {
    // Total from tasks (this is the actual budget)
    const taskBasedTotal = tasks.reduce((sum, t) => sum + (t.price || 0), 0);
    
    // Total from categories (allocated budget)
    const allocated = budgetCategories.reduce((sum, cat) => sum + cat.allocated, 0);
    
    // Total spent from expenses
    const spent = budgetCategories.reduce((sum, cat) => sum + cat.spent, 0);
    
    // Use task-based total as primary budget if no allocation set
    const effectiveBudget = allocated > 0 ? allocated : taskBasedTotal;
    const remaining = effectiveBudget - spent;
    
    return {
      allocated: effectiveBudget,
      spent,
      remaining,
      taskBasedTotal,
      percentSpent: effectiveBudget > 0 ? (spent / effectiveBudget) * 100 : 0,
    };
  }, [budgetCategories, budgetExpenses, tasks]);

  // Get expenses by category
  const expensesByCategory = useMemo(() => {
    const categoryMap = new Map<string, typeof budgetExpenses>();
    
    budgetCategories.forEach((category) => {
      const categoryExpenses = budgetExpenses.filter(
        (expense) => expense.categoryId === category.id
      );
      categoryMap.set(category.id, categoryExpenses);
    });

    return categoryMap;
  }, [budgetCategories, budgetExpenses]);

  // Get tasks with prices
  const tasksWithPrices = useMemo(() => {
    return tasks.filter((t) => t.price !== undefined && t.price > 0);
  }, [tasks]);

  return {
    categories: budgetCategories,
    expenses: budgetExpenses,
    totals,
    expensesByCategory,
    tasksWithPrices,
  };
}

