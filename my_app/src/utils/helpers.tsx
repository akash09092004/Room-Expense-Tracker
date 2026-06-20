import { CURRENCY } from "./constants";
import type { Expense } from "../types";

export const formatCurrency = (amount: number | string | null | undefined) => {
  const numericAmount = Number(amount || 0);
  const hasDecimals = !Number.isInteger(numericAmount);
  const formatter = new Intl.NumberFormat("en-IN", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  });

  return `${CURRENCY}${formatter.format(numericAmount)}`;
};

export const formatDate = (date: string | number | Date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export const calculateTotalExpense = (expenses: Expense[] = []) => {
  return expenses.reduce((total, expense) => total + Number(expense.amount || 0), 0);
};

export const normalizeCategory = (category = "") => {
  return category.trim().toLowerCase();
};

export const formatCategoryLabel = (category = "") => {
  const normalized = normalizeCategory(category);

  if (!normalized) return "General";

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const getPerHeadAmount = (
  totalAmount: number,
  totalMembers: number
) => {
  if (!totalMembers) return 0;

  return (totalAmount / totalMembers).toFixed(2);
};

export const capitalize = (text = "") => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const generateAvatar = (name = "") => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};
