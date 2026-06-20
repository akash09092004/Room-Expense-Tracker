import type { Expense } from "../types";

export const demoExpenses: Expense[] = [
  {
    _id: "1",
    itemName: "Groceries",
    amount: 1240,
    category: "Food",
    userId: { name: "Aman" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "2",
    itemName: "Electric Bill",
    amount: 860,
    category: "Electricity",
    userId: { name: "Riya" },
    createdAt: new Date().toISOString(),
  },
  {
    _id: "3",
    itemName: "Internet Renewal",
    amount: 599,
    category: "Internet",
    userId: { name: "Kabir" },
    createdAt: new Date().toISOString(),
  },
];
