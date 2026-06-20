import React from "react";
import { View, Text, Pressable } from "react-native";
import {
  formatCurrency,
  formatDate,
  formatCategoryLabel,
} from "../utils/helpers";
import type { Expense } from "../types";

type ExpenseCardProps = {
  expense: Expense;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
};

const ExpenseCard = ({
  expense,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}: ExpenseCardProps) => {
  const ownerName =
    expense.user?.name ||
    expense.userId?.name ||
    "Unknown";

  return (
    <View className="mb-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-soft">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-slate-900">
            {expense.itemName}
          </Text>

          <Text className="mt-1 text-sm text-slate-500">
            {formatCategoryLabel(expense.category)}
          </Text>
        </View>

        <View className="rounded-2xl bg-brand-50 px-3 py-2">
          <Text className="text-sm font-bold text-brand-700">
            {formatCurrency(expense.amount)}
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row flex-wrap items-center justify-between gap-2">
        <Text className="text-sm text-slate-500">
          Added by {ownerName}
        </Text>

        {expense.createdAt ? (
          <Text className="text-sm text-slate-400">
            {formatDate(expense.createdAt)}
          </Text>
        ) : null}
      </View>

      {(onEdit && canEdit) || (onDelete && canDelete) ? (
        <View className="mt-4 flex-row gap-3">
          {onEdit && canEdit ? (
            <Pressable
              onPress={onEdit}
              className="flex-1 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3"
            >
              <Text className="text-center text-sm font-semibold text-brand-700">
                Edit
              </Text>
            </Pressable>
          ) : null}

          {onDelete && canDelete ? (
            <Pressable
              onPress={onDelete}
              className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
            >
              <Text className="text-center text-sm font-semibold text-rose-700">
                Delete
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default ExpenseCard;
