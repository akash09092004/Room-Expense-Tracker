import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  type LayoutChangeEvent,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "../../hooks/useAuth";
import { useExpenses } from "../../hooks/useExpenses";
import CustomButton from "../../component/CustomButton";
import CustomInput from "../../component/CustomInput";
import ExpenseCard from "../../component/ExpenseCard";
import EmptyState from "../../component/EmptyState";
import Loader from "../../component/Loader";
import UserNoteCard from "../../component/UserNoteCard";
import { APP_NAME } from "../../utils/constants";
import {
  calculateTotalExpense,
  formatCurrency,
  normalizeCategory,
} from "../../utils/helpers";
import type { Expense } from "../../types";
type IconName = React.ComponentProps<typeof Ionicons>["name"];

const DashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { expenses, loading, error, removeExpense, updateExpenseById, fetchExpenses } =
    useExpenses();
  const scrollRef = useRef<ScrollView | null>(null);
  const [recentSectionY, setRecentSectionY] = useState(0);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [editItemName, setEditItemName] = useState("");
  const [editAmount, setEditAmount] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const list: Expense[] = expenses;
  const totalExpense = calculateTotalExpense(list);
  const perHead = list.length ? totalExpense / Math.max(list.length, 1) : 0;
  const recentExpenses = list.slice(0, 4);

  const canManageExpense = (expense: Expense) => {
    const ownerId = expense.user?._id || expense.userId?._id;
    const ownerEmail = expense.user?.email || expense.userId?.email;

    return (
      !!user &&
      (user.role === "admin" ||
        ownerId === user._id ||
        ownerEmail === user.email)
    );
  };

  if (loading) {
    return <Loader text="Loading dashboard..." />;
  }

  const stats: Array<{
    label: string;
    value: string;
    icon: IconName;
    tone: string;
  }> = [
    {
      label: "Total spent",
      value: formatCurrency(totalExpense),
      icon: "card-outline",
      tone: "bg-brand-600",
    },
    {
      label: "Entries",
      value: String(list.length),
      icon: "layers-outline",
      tone: "bg-emerald-500",
    },
    {
      label: "Avg / item",
      value: formatCurrency(perHead),
      icon: "trending-up-outline",
      tone: "bg-amber-500",
    },
  ];

  const jumpToRecentExpenses = () => {
    scrollRef.current?.scrollTo({
      y: Math.max(recentSectionY - 16, 0),
      animated: true,
    });
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setEditItemName(expense.itemName || "");
    setEditAmount(String(expense.amount ?? ""));
    setEditCategory(expense.category || "");
    scrollRef.current?.scrollTo({
      y: Math.max(recentSectionY - 16, 0),
      animated: true,
    });
  };

  const cancelEditExpense = () => {
    setEditingExpense(null);
    setEditItemName("");
    setEditAmount("");
    setEditCategory("");
  };

  const handleSaveExpense = async () => {
    if (!editingExpense) return;

    if (!editItemName.trim() || !editAmount.trim()) {
      Alert.alert("Missing info", "Item name aur amount dono bharna zaroori hai.");
      return;
    }

    try {
      setSavingEdit(true);
      await updateExpenseById(editingExpense._id, {
        itemName: editItemName.trim(),
        amount: Number(editAmount),
        category: normalizeCategory(editCategory),
      });
      await fetchExpenses();
      cancelEditExpense();
      Alert.alert("Updated", "Expense successfully update ho gaya.");
    } catch (error: any) {
      Alert.alert(
        "Update failed",
        error?.response?.data?.message || "Expense update nahi ho saka."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteExpense = async (expense: Expense) => {
    Alert.alert(
      "Delete expense",
      `Delete "${expense.itemName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await removeExpense(expense._id);
              if (editingExpense?._id === expense._id) {
                cancelEditExpense();
              }
            } catch (error: any) {
              Alert.alert(
                "Delete failed",
                error?.response?.data?.message || "Expense delete nahi hua."
              );
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    (async () => {
      try {
        await logout();
      } catch (error) {
        Alert.alert("Logout failed", "Please try again.");
      }
    })();
  };

  return (
    <ScrollView ref={scrollRef} className="flex-1 bg-slate-50">
      <View className="px-4 pb-56 pt-4 sm:px-6 lg:px-8 lg:pt-8">
        <View className="overflow-hidden rounded-[32px] border border-slate-200 bg-slate-950 shadow-soft">
          <View className="absolute -left-16 top-6 h-48 w-48 rounded-full bg-brand-500/20" />
          <View className="absolute -right-12 top-20 h-40 w-40 rounded-full bg-cyan-400/15" />
          <View className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-white/10" />

          <View className="px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
            <View className="flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <View className="max-w-3xl flex-1">
                <View className="mb-4 flex-row items-center gap-3">
                  <View className="h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <Ionicons name="analytics-outline" size={24} color="#fff" />
                  </View>
                  <View>
                    <Text className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-200">
                      {APP_NAME}
                    </Text>
                    <Text className="text-sm text-slate-300">
                      Shared expense workspace
                    </Text>
                  </View>
                </View>

                <Text className="text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl">
                  Welcome back, {user?.name || "User"}
                </Text>
                <Text className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                  Keep room expenses organized with a clean, responsive
                  dashboard. Track what was spent, check balances at a glance,
                  and settle up faster.
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-3 lg:w-[340px] lg:justify-end">
                <Pressable
                  onPress={() => navigation.navigate("Expenses")}
                  className="min-w-[150px] flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
                >
                  <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                    Focus
                  </Text>
                  <Text className="mt-2 text-xl font-black text-white">
                    {formatCurrency(totalExpense)}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("Settlement")}
                  className="min-w-[150px] flex-1 rounded-2xl border border-white/15 bg-white/10 px-4 py-3"
                >
                  <Text className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                    Next step
                  </Text>
                  <Text className="mt-2 text-xl font-black text-white">
                    Settle up
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="mt-8 flex-row flex-wrap gap-3">
              {stats.map((stat) => (
                <View
                  key={stat.label}
                  className="min-w-[160px] flex-1 rounded-3xl border border-white/10 bg-white/10 p-4"
                >
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-300">
                      {stat.label}
                    </Text>
                    <View
                      className={`h-10 w-10 items-center justify-center rounded-2xl ${stat.tone}`}
                    >
                      <Ionicons name={stat.icon} size={18} color="#fff" />
                    </View>
                  </View>
                  <Text className="mt-4 text-2xl font-black text-white sm:text-[28px]">
                    {stat.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-6 flex-col gap-4 lg:flex-row">
          <View className="flex-1 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <View className="flex-row items-center gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
                <Ionicons name="flash-outline" size={22} color="#2563eb" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  Quick actions
                </Text>
                <Text className="text-sm text-slate-500">
                  Jump to the most used sections without extra taps.
                </Text>
              </View>
            </View>

            <View className="mt-4 flex-row flex-wrap gap-3">
              <CustomButton
                title="Add expense"
                onPress={() => navigation.navigate("AddExpense")}
                className="flex-1 min-w-[150px]"
              />
              <CustomButton
                title="Update expenses"
                variant="secondary"
                onPress={jumpToRecentExpenses}
                className="flex-1 min-w-[150px]"
              />
              <CustomButton
                title="Settlement"
                variant="secondary"
                onPress={() => navigation.navigate("Settlement")}
                className="flex-1 min-w-[150px]"
              />
              <CustomButton
                title="Logout"
                variant="danger"
                onPress={handleLogout}
                className="flex-1 min-w-[150px]"
              />
            </View>
          </View>

          <View className="flex-1 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <View className="flex-row items-start gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                <Ionicons name="shield-checkmark-outline" size={22} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold text-slate-900">
                  Status
                </Text>
                <Text className="mt-1 text-sm leading-6 text-slate-500">
                  {error
                    ? "Showing demo data because the backend is not reachable yet."
                    : "Live data is connected and ready to use."}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mt-6">
          <UserNoteCard />
        </View>

        <View
          onLayout={(event: LayoutChangeEvent) =>
            setRecentSectionY(event.nativeEvent.layout.y)
          }
          className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft"
        >
          <View className="mb-4 flex-row flex-wrap items-center justify-between gap-3">
            <View>
              <Text className="text-lg font-bold text-slate-950">
                Recent expenses
              </Text>
              <Text className="text-sm text-slate-500">
                A clean overview of the latest spendings.
              </Text>
            </View>

            <Text className="text-sm font-semibold text-brand-700">
              {recentExpenses.length} shown
            </Text>
          </View>

          {editingExpense ? (
            <View className="mb-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <Text className="text-base font-bold text-slate-950">
                Edit expense
              </Text>
              <Text className="mt-1 text-sm text-slate-500">
                Change item details or remove the record from the list.
              </Text>

              <View className="mt-4">
                <CustomInput
                  label="Item name"
                  placeholder="Item name"
                  value={editItemName}
                  onChangeText={setEditItemName}
                  autoCapitalize="words"
                />
                <CustomInput
                  label="Amount"
                  placeholder="Amount"
                  value={editAmount}
                  onChangeText={setEditAmount}
                  keyboardType="numeric"
                />
                <CustomInput
                  label="Category"
                  placeholder="Category"
                  value={editCategory}
                  onChangeText={setEditCategory}
                  autoCapitalize="words"
                />

                <View className="flex-row gap-3">
                  <CustomButton
                    title="Save update"
                    onPress={handleSaveExpense}
                    loading={savingEdit}
                    className="flex-1"
                  />
                  <CustomButton
                    title="Cancel"
                    variant="secondary"
                    onPress={cancelEditExpense}
                    className="flex-1"
                  />
                </View>
              </View>
            </View>
          ) : null}

          <View>
            {recentExpenses.length ? (
              recentExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                canEdit={canManageExpense(expense)}
                canDelete={canManageExpense(expense)}
                onEdit={
                  canManageExpense(expense)
                    ? () => startEditExpense(expense)
                    : undefined
                }
                onDelete={
                  canManageExpense(expense)
                    ? () => handleDeleteExpense(expense)
                    : undefined
                }
              />
            ))
            ) : (
              <EmptyState title="No expenses yet" />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default DashboardScreen;
