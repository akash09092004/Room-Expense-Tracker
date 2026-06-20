import api from "./api";

export const getExpenses = async () => {
  const response = await api.get(
    "/expenses"
  );

  return response.data;
};

export const addExpense = async (expenseData: Record<string, unknown>) => {
  const response = await api.post("/expenses", expenseData);

  return response.data;
};

export const updateExpense = async (id: string, expenseData: Record<string, unknown>) => {
  const response = await api.put(`/expenses/${id}`, expenseData);

  return response.data;
};

export const deleteExpense = async (id: string) => {
  const response = await api.delete(`/expenses/${id}`);

  return response.data;
};
