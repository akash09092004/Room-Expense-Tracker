import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  getExpenses,
  deleteExpense,
  updateExpense,
} from "../services/expenseApi";
import type { Expense } from "../types";

export const useExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getExpenses();
      const items = Array.isArray(response)
        ? response
        : response?.expenses || response?.data || [];

      setExpenses(items);
      setError(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to load expenses");
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeExpense = async (id: string) => {
    try {
      setExpenses((prev) => prev.filter((item) => item._id !== id));
      await deleteExpense(id);
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  const updateExpenseById = async (
    id: string,
    payload: Record<string, unknown>
  ) => {
    try {
      await updateExpense(id, payload);
      await fetchExpenses();
    } catch (err) {
      console.log(err);
      throw err;
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [fetchExpenses])
  );

  return {
    expenses,
    loading,
    error,
    fetchExpenses,
    removeExpense,
    updateExpenseById,
  };
};
