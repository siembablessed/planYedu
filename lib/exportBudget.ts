import * as XLSX from "xlsx";
import { BudgetCategory, BudgetExpense } from "@/types";
import { Platform } from "react-native";

// Lazy load mobile-only modules
let FileSystemModule: any = null;
let SharingModule: any = null;

async function getMobileModules() {
  if (Platform.OS === "web") {
    return { FileSystem: null, Sharing: null };
  }
  
  // Load modules if not already loaded
  if (!FileSystemModule || !SharingModule) {
    try {
      // Use dynamic import with proper error handling
      const fileSystemPromise = import("expo-file-system").catch((err) => {
        console.warn("Failed to load expo-file-system:", err);
        return null;
      });
      
      const sharingPromise = import("expo-sharing").catch((err) => {
        console.warn("Failed to load expo-sharing:", err);
        return null;
      });
      
      const [fileSystem, sharing] = await Promise.all([fileSystemPromise, sharingPromise]);
      
      if (!fileSystem || !sharing) {
        console.warn("expo-file-system or expo-sharing not available:", { fileSystem: !!fileSystem, sharing: !!sharing });
        return { FileSystem: null, Sharing: null };
      }
      
      // Handle both default and named exports
      FileSystemModule = fileSystem.default || fileSystem;
      SharingModule = sharing.default || sharing;
      
      // Verify the modules have the required properties
      if (!FileSystemModule.documentDirectory || !FileSystemModule.writeAsStringAsync) {
        console.warn("expo-file-system module missing required properties");
        return { FileSystem: null, Sharing: null };
      }
      
      if (!SharingModule.shareAsync) {
        console.warn("expo-sharing module missing required properties");
        return { FileSystem: null, Sharing: null };
      }
    } catch (error) {
      console.warn("Error loading mobile modules:", error);
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

      // Check if required methods exist
      if (!FileSystem.documentDirectory || !FileSystem.writeAsStringAsync) {
        throw new Error("expo-file-system is not properly installed or initialized");
      }

      if (!Sharing.shareAsync) {
        throw new Error("expo-sharing is not properly installed or initialized");
      }

      const wbout = XLSX.write(workbook, { type: "base64", bookType: "xlsx" });
      const fileUri = FileSystem.documentDirectory + fileName;
      
      // Write file to device storage
      await FileSystem.writeAsStringAsync(fileUri, wbout, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Check if sharing is available and share the file
      if (Sharing.isAvailableAsync) {
        const isAvailable = await Sharing.isAvailableAsync();
        if (!isAvailable) {
          throw new Error("Sharing is not available on this device");
        }
      }
      
      await Sharing.shareAsync(fileUri);
    }
  } catch (error) {
    console.error("Export error:", error);
    throw error;
  }
}

