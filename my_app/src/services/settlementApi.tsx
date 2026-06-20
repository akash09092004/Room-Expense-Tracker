import api from "./api";

export const closeMonth = async () => {
  const response = await api.post(
    "/settlements/close"
  );

  return response.data;
};