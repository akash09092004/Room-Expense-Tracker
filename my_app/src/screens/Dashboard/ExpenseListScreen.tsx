import React, { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useExpenses } from "../../hooks/useExpenses";
import { useAuth } from "../../hooks/useAuth";
import ExpenseCard from "../../component/ExpenseCard";
import EmptyState from "../../component/EmptyState";
import Loader from "../../component/Loader";
import {
  calculateTotalExpense,
  formatCurrency,
  normalizeCategory,
} from "../../utils/helpers";
import type { Expense } from "../../types";

const filters = ["All", "Food", "Electricity", "Internet", "Other"];

const ExpenseListScreen = () => {
  const { expenses, loading, error } = useExpenses();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");

  const list: Expense[] = expenses;

  const filteredExpenses = useMemo(() => {
    if (activeFilter === "All") return list;
    const selectedFilter = normalizeCategory(activeFilter);

    return list.filter((expense) => {
      const category = normalizeCategory(expense.category || "Other");

      return category === selectedFilter;
    });
  }, [activeFilter, list]);

  const total = calculateTotalExpense(filteredExpenses);

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
    return <Loader text="Loading expenses..." />;
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="mb-6 rounded-[28px] bg-white p-5 shadow-soft">
          <Text className="text-3xl font-black text-slate-950">
            Expense list
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Filter, review, and track every expense from one responsive page.
          </Text>

          <View className="mt-4 flex-row flex-wrap gap-2">
            {filters.map((item) => (
              <Text
                key={item}
                onPress={() => setActiveFilter(item)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  activeFilter === item
                    ? "bg-brand-600 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item}
              </Text>
            ))}
          </View>

          <View className="mt-4 flex-row flex-wrap gap-3">
            <View className="min-w-[180px] flex-1 rounded-3xl bg-slate-950 px-4 py-4">
              <Text className="text-xs uppercase tracking-widest text-slate-300">
                Filtered total
              </Text>
              <Text className="mt-2 text-2xl font-black text-white">
                {formatCurrency(total)}
              </Text>
            </View>
            <View className="min-w-[180px] flex-1 rounded-3xl bg-brand-50 px-4 py-4">
              <Text className="text-xs uppercase tracking-widest text-brand-700">
                Items
              </Text>
              <Text className="mt-2 text-2xl font-black text-brand-900">
                {filteredExpenses.length}
              </Text>
            </View>
          </View>
        </View>

        {error ? (
          <View className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
            <Text className="text-sm text-amber-800">
              {error}. Showing sample entries for now.
            </Text>
          </View>
        ) : null}

        <View className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons name="receipt-outline" size={20} color="#2563eb" />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-950">
                All expenses
              </Text>
              <Text className="text-sm text-slate-500">
                Every item is shown in a clean card layout.
              </Text>
            </View>
          </View>

          {filteredExpenses.length ? (
            filteredExpenses.map((expense) => (
              <ExpenseCard
                key={expense._id}
                expense={expense}
                canEdit={canManageExpense(expense)}
                canDelete={canManageExpense(expense)}
              />
            ))
          ) : (
            <EmptyState
              title="No matching expenses"
              subtitle="Try another filter or add a fresh expense."
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
};

export default ExpenseListScreen;
