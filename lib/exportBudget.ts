import * as XLSX from "xlsx";
import { BudgetCategory, BudgetExpense } from "@/types";
import { Platform } from "react-native";

// Lazy load mobile-only modules
let FileSystemModule: typeof import("expo-file-system") | null = null;
let SharingModule: typeof import("expo-sharing") | null = null;

async function getMobileModules() {
  if (Platform.OS === "web") {
    return { FileSystem: null, Sharing: null };
  }
  
  // Load modules if not already loaded
  if (!FileSystemModule || !SharingModule) {
    try {
      FileSystemModule = await import("expo-file-system");
      SharingModule = await import("expo-sharing");
    } catch (error) {
      // Silently fail - will show error when trying to export
      return { FileSystem: null, Sharing: null };
    }
  }
  
  return { 
    FileSystem: FileSystemModule, 
    Sharing: SharingModule 
  };
}

export async function exportBudgetToExcel(
  categories: BudgetCategory[],
  expenses: BudgetExpense[],
  fileName: string = "budget-export.xlsx"
): Promise<void> {
  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Sheet 1: Budget Summary
  const summaryData = [
    ["Budget Category", "Allocated", "Spent", "Remaining", "Percentage Used"],
    ...categories.map((cat) => [
      cat.name,
      cat.allocated,
      cat.spent,
      cat.allocated - cat.spent,
      cat.allocated > 0 ? ((cat.spent / cat.allocated) * 100).toFixed(2) + "%" : "0%",
    ]),
    [
      "TOTAL",
      categories.reduce((sum, cat) => sum + cat.allocated, 0),
      categories.reduce((sum, cat) => sum + cat.spent, 0),
      categories.reduce((sum, cat) => sum + (cat.allocated - cat.spent), 0),
      "",
    ],
  ];

  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, "Budget Summary");

  // Sheet 2: Expenses by Category
  const expensesByCategory = categories.map((category) => {
    const categoryExpenses = expenses.filter((e) => e.categoryId === category.id);
    const expenseData = [
      ["Expense", "Amount", "Vendor", "Date", "Paid"],
      ...categoryExpenses.map((exp) => [
        exp.title,
        exp.amount,
        exp.vendor || "",
        new Date(exp.date).toLocaleDateString(),
        exp.isPaid ? "Yes" : "No",
      ]),
      ["Subtotal", categoryExpenses.reduce((sum, e) => sum + e.amount, 0), "", "", ""],
    ];
    return { name: category.name, data: expenseData };
  });

  expensesByCategory.forEach(({ name, data }) => {
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, name.substring(0, 31)); // Excel sheet name limit
  });

  // Sheet 3: All Expenses
  const allExpensesData = [
    ["Category", "Expense", "Amount", "Vendor", "Date", "Paid"],
    ...expenses.map((exp) => {
      const category = categories.find((c) => c.id === exp.categoryId);
      return [
        category?.name || "",
        exp.title,
        exp.amount,
        exp.vendor || "",
        new Date(exp.date).toLocaleDateString(),
        exp.isPaid ? "Yes" : "No",
      ];
    }),
  ];

  const allExpensesSheet = XLSX.utils.aoa_to_sheet(allExpensesData);
  XLSX.utils.book_append_sheet(workbook, allExpensesSheet, "All Expenses");

  // Generate Excel file
  try {
    if (Platform.OS === "web") {
      // Web environment - direct download
      XLSX.writeFile(workbook, fileName);
    } else {
      // Mobile environment - save and share
      const { FileSystem, Sharing } = await getMobileModules();
      
      if (!FileSystem || !Sharing) {
        throw new Error("expo-file-system and expo-sharing are required for mobile export. Please install them: npx expo install expo-file-system expo-sharing");
      }

      const wbout = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write file to device storage
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(fileUri);
      } else {
        throw new Error("Sharing is not available on this device");
      }
    }
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
}

