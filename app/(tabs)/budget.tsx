import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useRef, useMemo, useEffect } from "react";
import { usePlanner } from "@/contexts/PlannerContext";
import { useBudget } from "@/hooks/useBudget";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  PieChart,
  BarChart3,
  Check,
  User,
} from "lucide-react-native";
import colors from "@/constants/colors";
import * as Haptics from "expo-haptics";
import { Stack, useRouter } from "expo-router";
import { normalizeText, isDuplicateTask } from "@/constants/smartTasks";
import { exportBudgetToExcel } from "@/lib/exportBudget";
import { DonutChart } from "@/components/budget/DonutChart";
import { BarChart } from "@/components/budget/BarChart";

export default function BudgetScreen() {
  const router = useRouter();
  const { budgetCategories, budgetExpenses } = usePlanner();
  const { totals } = useBudget();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState<"charts" | "list">("charts");
  const pageSize = 4;
  
  // Filter categories that have budget or expenses
  const activeCategories = useMemo(() => {
    return budgetCategories.filter(
      (cat) => cat.allocated > 0 || cat.spent > 0
    );
  }, [budgetCategories]);
  
  // Prepare data for donut chart (by allocated budget)
  const donutChartData = useMemo(() => {
    return activeCategories
      .filter((cat) => cat.allocated > 0)
      .map((cat) => ({
        label: cat.name,
        value: cat.allocated,
        color: cat.color,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categories
  }, [activeCategories]);

  const donutTotal = useMemo(() => {
    return donutChartData.reduce((sum, item) => sum + item.value, 0);
  }, [donutChartData]);

  // Prepare data for bar chart (spending vs budget)
  const barChartData = useMemo(() => {
    return activeCategories
      .filter((cat) => cat.allocated > 0)
      .map((cat) => ({
        label: cat.name,
        value: cat.spent,
        maxValue: cat.allocated,
        color: cat.color,
      }))
      .sort((a, b) => b.maxValue - a.maxValue)
      .slice(0, 8); // Top 8 categories
  }, [activeCategories]);
  
  // Paginate categories
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return activeCategories.slice(startIndex, endIndex);
  }, [activeCategories, currentPage, pageSize]);
  
  const totalPages = Math.ceil(activeCategories.length / pageSize);
  
  // Reset to page 1 when categories change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategories.length]);

  const handleExportBudget = async () => {
    setIsExporting(true);
    try {
      const date = new Date().toISOString().split("T")[0];
      await exportBudgetToExcel(budgetCategories, budgetExpenses, `budget-${date}.xlsx`);
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      Alert.alert("Success", "Budget exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export budget. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Budget",
          headerStyle: {
            backgroundColor: colors.surface,
          },
          headerShadowVisible: false,
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginRight: 16 }}>
              <TouchableOpacity
                onPress={handleExportBudget}
                style={{ padding: 8 }}
                disabled={isExporting}
              >
                {isExporting ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Download size={24} color={colors.primary} />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  router.push("/(tabs)/profile");
                }}
                style={{ padding: 8 }}
              >
                <User size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.summaryCard}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>Total Budget</Text>
              </View>
              <View style={styles.summaryAmountContainer}>
                <Text style={styles.summaryAmount}>
                  ${totals.allocated.toLocaleString()}
                </Text>
              </View>
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${Math.min(totals.percentSpent, 100)}%`,
                      backgroundColor:
                        totals.percentSpent > 100
                          ? colors.error
                          : totals.percentSpent > 90
                          ? colors.warning
                          : totals.percentSpent > 70
                          ? "#F59E0B"
                          : colors.success,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressBarLabels}>
                <Text style={styles.progressBarLabel}>0%</Text>
                <Text style={styles.progressBarLabel}>
                  {Math.round(totals.percentSpent)}% spent
                </Text>
                <Text style={styles.progressBarLabel}>100%</Text>
              </View>
            </View>

            <View style={styles.summaryGrid}>
              <View style={styles.summaryGridItem}>
                <View style={[styles.summaryIconContainer, { backgroundColor: colors.error + "15" }]}>
                  <TrendingDown size={24} color={colors.error} />
                </View>
                <Text style={styles.summaryGridLabel}>Spent</Text>
                <Text style={[styles.summaryGridValue, { color: colors.error }]}>
                  ${totals.spent.toLocaleString()}
                </Text>
              </View>
              <View style={styles.summaryGridItem}>
                <View style={[styles.summaryIconContainer, { backgroundColor: colors.success + "15" }]}>
                  <TrendingUp size={24} color={colors.success} />
                </View>
                <Text style={styles.summaryGridLabel}>Remaining</Text>
                <Text style={[styles.summaryGridValue, { color: colors.success }]}>
                  ${totals.remaining.toLocaleString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Visualization Section */}
          {activeCategories.length > 0 && (
            <>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionHeaderRow}>
                  <View>
                    <Text style={styles.sectionTitle}>Budget Overview</Text>
                    <Text style={styles.sectionSubtitle}>
                      Visual breakdown of your budget
                    </Text>
                  </View>
                  <View style={styles.viewModeToggle}>
                    <TouchableOpacity
                      style={[
                        styles.viewModeButton,
                        viewMode === "charts" && styles.viewModeButtonActive,
                      ]}
                      onPress={() => {
                        setViewMode("charts");
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <PieChart size={16} color={viewMode === "charts" ? colors.surface : colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.viewModeButton,
                        viewMode === "list" && styles.viewModeButtonActive,
                      ]}
                      onPress={() => {
                        setViewMode("list");
                        if (Platform.OS !== "web") {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }
                      }}
                    >
                      <BarChart3 size={16} color={viewMode === "list" ? colors.surface : colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {viewMode === "charts" ? (
                <>
                  {/* Donut Chart Card */}
                  {donutChartData.length > 0 && (
                    <View style={styles.chartCard}>
                      <Text style={styles.chartTitle}>Budget Distribution</Text>
                      <Text style={styles.chartSubtitle}>Allocated budget by category</Text>
                      <DonutChart data={donutChartData} total={donutTotal} />
                    </View>
                  )}

                  {/* Bar Chart Card */}
                  {barChartData.length > 0 && (
                    <View style={styles.chartCard}>
                      <Text style={styles.chartTitle}>Spending vs Budget</Text>
                      <Text style={styles.chartSubtitle}>Compare spending to allocated budget</Text>
                      <BarChart data={barChartData} />
                    </View>
                  )}
                </>
              ) : (
                <>
                  <View style={styles.sectionHeader}>
                    <View>
                      <Text style={styles.sectionTitle}>Budget Categories</Text>
                      <Text style={styles.sectionSubtitle}>
                        {activeCategories.length} active categories
                      </Text>
                    </View>
                  </View>

                  {paginatedCategories.map((category) => {
            const percentUsed =
              category.allocated > 0
                ? (category.spent / category.allocated) * 100
                : 0;

            return (
              <View
                key={category.id}
                style={[
                  styles.categoryCard,
                  { borderLeftColor: category.color, borderLeftWidth: 4 },
                ]}
              >
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </View>

                <View style={styles.categoryAmounts}>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Budgeted</Text>
                    <Text style={styles.amountValue}>
                      ${category.allocated.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Spent</Text>
                    <Text style={[styles.amountValue, { color: colors.error }]}>
                      ${category.spent.toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Left</Text>
                    <Text
                      style={[
                        styles.amountValue,
                        {
                          color:
                            category.allocated - category.spent < 0
                              ? colors.error
                              : colors.success,
                        },
                      ]}
                    >
                      ${(category.allocated - category.spent).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.categoryProgressBar}>
                  <View
                    style={[
                      styles.categoryProgressFill,
                      {
                        width: `${Math.min(percentUsed, 100)}%`,
                        backgroundColor:
                          percentUsed > 100
                            ? colors.error
                            : percentUsed > 90
                            ? colors.warning
                            : category.color,
                      },
                    ]}
                  />
                </View>

              </View>
            );
          })}

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
                      Showing {paginatedCategories.length} of {activeCategories.length} categories
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

          {activeCategories.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No budget categories yet</Text>
              <Text style={styles.emptySubtitle}>
                Add tasks with prices to see budget categories
              </Text>
            </View>
          )}

          <View style={styles.bottomSpacer} />
        </ScrollView>

        <TouchableOpacity
          style={styles.fab}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }
            setShowAddExpense(true);
          }}
        >
          <Plus size={28} color={colors.surface} />
        </TouchableOpacity>

        {showAddExpense && (
          <AddExpenseSheet onClose={() => setShowAddExpense(false)} />
        )}
      </View>
    </>
  );
}


// Wedding expense suggestions
const expenseSuggestions = [
  { title: "Makeup Artist", category: "makeup", amount: "" },
  { title: "Hair Stylist", category: "makeup", amount: "" },
  { title: "Bridal Makeup", category: "makeup", amount: "" },
  { title: "Photographer", category: "photography", amount: "" },
  { title: "Videographer", category: "photography", amount: "" },
  { title: "Wedding Venue", category: "venue", amount: "" },
  { title: "Reception Venue", category: "venue", amount: "" },
  { title: "Catering Service", category: "catering", amount: "" },
  { title: "Wedding Cake", category: "catering", amount: "" },
  { title: "Florist", category: "flowers", amount: "" },
  { title: "Wedding Decorations", category: "flowers", amount: "" },
  { title: "DJ", category: "music", amount: "" },
  { title: "Live Band", category: "music", amount: "" },
  { title: "Wedding Dress", category: "attire", amount: "" },
  { title: "Groom's Suit", category: "attire", amount: "" },
  { title: "Bridal Party Attire", category: "attire", amount: "" },
  { title: "Limousine", category: "transportation", amount: "" },
  { title: "Wedding Car", category: "transportation", amount: "" },
];

function AddExpenseSheet({ onClose }: { onClose: () => void }) {
  const { budgetCategories, addBudgetExpense, budgetExpenses } = usePlanner();
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [vendor, setVendor] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(budgetCategories[0]?.id || "");
  const [isPaid, setIsPaid] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState(expenseSuggestions);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Check for duplicate expenses
  const checkDuplicateExpense = (expenseTitle: string): boolean => {
    return budgetExpenses.some((expense) => {
      return isDuplicateTask(expense.title, expenseTitle);
    });
  };

  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (text.trim().length > 0) {
      const filtered = expenseSuggestions.filter((s) =>
        s.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredSuggestions(filtered.length > 0 ? filtered : expenseSuggestions);
      setShowSuggestions(true);
      
      // Check for duplicates
      if (checkDuplicateExpense(text)) {
        setDuplicateWarning("A similar expense already exists. Are you sure you want to create a duplicate?");
      } else {
        setDuplicateWarning(null);
      }
    } else {
      setShowSuggestions(false);
      setDuplicateWarning(null);
    }
  };

  const handleSuggestionSelect = (suggestion: typeof expenseSuggestions[0]) => {
    // Check if this suggestion would be a duplicate
    if (checkDuplicateExpense(suggestion.title)) {
      setDuplicateWarning("This expense already exists! Please use a different title or edit the existing expense.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      setShowSuggestions(false);
      return;
    }
    
    setTitle(suggestion.title);
    const category = budgetCategories.find((c) => c.id === suggestion.category) || budgetCategories[0];
    if (category) {
      setSelectedCategory(category.id);
    }
    setShowSuggestions(false);
    setDuplicateWarning(null);
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleCreate = () => {
    if (!title.trim() || !amount.trim() || !selectedCategory) return;

    // Final duplicate check
    if (checkDuplicateExpense(title.trim())) {
      setDuplicateWarning("This expense already exists! Please use a different title or edit the existing expense.");
      if (Platform.OS !== "web") {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    addBudgetExpense({
      title: title.trim(),
      amount: parsedAmount,
      vendor: vendor.trim() || undefined,
      categoryId: selectedCategory,
      date: new Date().toISOString(),
      isPaid,
    });

    if (Platform.OS !== "web") {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onClose();
  };

  return (
    <View style={styles.sheetOverlay}>
      <TouchableOpacity style={styles.sheetBackground} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>Add Expense</Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={[styles.input, duplicateWarning && styles.inputError]}
            placeholder="Expense title (e.g., Makeup Artist)"
            placeholderTextColor={colors.textTertiary}
            value={title}
            onChangeText={handleTitleChange}
            onFocus={() => {
              if (title.trim().length > 0) {
                setShowSuggestions(true);
              }
            }}
            onBlur={() => {
              // Delay hiding suggestions to allow tap
              setTimeout(() => setShowSuggestions(false), 200);
            }}
            autoFocus
          />
          {duplicateWarning && (
            <View style={styles.warningContainer}>
              <AlertCircle size={16} color={colors.error} />
              <Text style={styles.warningText}>{duplicateWarning}</Text>
            </View>
          )}
          {showSuggestions && filteredSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <ScrollView
                style={styles.suggestionsList}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
              >
                {filteredSuggestions
                  .filter((suggestion) => {
                    // Filter out suggestions that already exist as expenses
                    return !checkDuplicateExpense(suggestion.title);
                  })
                  .slice(0, 5)
                  .map((suggestion, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionSelect(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion.title}</Text>
                      <View
                        style={[
                          styles.suggestionCategoryDot,
                          {
                            backgroundColor:
                              budgetCategories.find((c) => c.id === suggestion.category)?.color ||
                              colors.primary,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            </View>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Amount"
          placeholderTextColor={colors.textTertiary}
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
        />

        <TextInput
          style={styles.input}
          placeholder="Vendor (optional)"
          placeholderTextColor={colors.textTertiary}
          value={vendor}
          onChangeText={setVendor}
        />

        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {budgetCategories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                selectedCategory === cat.id && {
                  backgroundColor: cat.color,
                  borderColor: cat.color,
                },
              ]}
              onPress={() => {
                if (Platform.OS !== "web") {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                setSelectedCategory(cat.id);
              }}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === cat.id && { color: colors.surface },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.paidToggle}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setIsPaid(!isPaid);
          }}
        >
          <View style={[styles.checkbox, isPaid && styles.checkboxChecked]}>
            {isPaid && <Check size={16} color={colors.surface} />}
          </View>
          <Text style={styles.paidLabel}>Mark as paid</Text>
        </TouchableOpacity>

        <View style={styles.sheetActions}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.createButton,
              (!title.trim() || !amount.trim() || (duplicateWarning && duplicateWarning.includes("already exists"))) && styles.createButtonDisabled,
            ]}
            onPress={handleCreate}
            disabled={!title.trim() || !amount.trim() || (duplicateWarning !== null && duplicateWarning.includes("already exists"))}
          >
            <Text style={styles.createButtonText}>Add Expense</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  summarySubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  summaryAmountContainer: {
    alignItems: "flex-end",
  },
  summaryAmount: {
    fontSize: 36,
    fontWeight: "700" as const,
    color: colors.primary,
  },
  progressBarContainer: {
    marginBottom: 24,
  },
  progressBarBg: {
    height: 14,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 7,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 7,
    transition: "width 0.3s ease",
  },
  progressBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  progressBarLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    fontWeight: "500" as const,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 16,
  },
  summaryGridItem: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  summaryGridLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: "500" as const,
    marginBottom: 4,
  },
  summaryGridValue: {
    fontSize: 20,
    fontWeight: "700" as const,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  viewModeToggle: {
    flexDirection: "row",
    gap: 8,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    padding: 4,
  },
  viewModeButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: colors.primary,
  },
  chartCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  categoryCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: colors.text,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.primary + "15",
    borderRadius: 8,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.primary,
  },
  categoryAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  amountItem: {
    flex: 1,
    alignItems: "center",
  },
  amountLabel: {
    fontSize: 11,
    color: colors.textTertiary,
    marginBottom: 4,
    fontWeight: "500" as const,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: "700" as const,
    color: colors.text,
  },
  categoryProgressBar: {
    height: 6,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  categoryProgressFill: {
    height: "100%",
    borderRadius: 3,
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
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: colors.text,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
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
  sheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheetBackground: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: colors.text,
    marginBottom: 20,
  },
  inputContainer: {
    position: "relative",
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  inputError: {
    borderWidth: 1,
    borderColor: colors.error,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
    padding: 8,
    backgroundColor: colors.error + "15",
    borderRadius: 8,
  },
  warningText: {
    fontSize: 12,
    color: colors.error,
    flex: 1,
  },
  suggestionsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: colors.border,
  },
  suggestionsList: {
    maxHeight: 200,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  suggestionText: {
    fontSize: 15,
    color: colors.text,
    flex: 1,
  },
  suggestionCategoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.textSecondary,
    marginBottom: 8,
    marginTop: 8,
  },
  categoriesScroll: {
    marginBottom: 16,
  },
  categoriesContent: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "600" as const,
    color: colors.text,
  },
  paidToggle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paidLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: "500" as const,
  },
  sheetActions: {
    flexDirection: "row",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.surfaceSecondary,
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.text,
  },
  createButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  createButtonDisabled: {
    opacity: 0.5,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: colors.surface,
  },
});
