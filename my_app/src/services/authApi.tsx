import api from "./api";

export const registerUser = async (userData: Record<string, unknown>) => {
  const response = await api.post("/auth/register", userData);

  return response.data;
};

export const loginUser = async (userData: Record<string, unknown>) => {
  const response = await api.post("/auth/login", userData);

  return response.data;
};
