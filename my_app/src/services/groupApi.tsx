import api from "./api";

export const createGroup = async (groupData: Record<string, unknown>) => {
  const response = await api.post("/groups/create", groupData);

  return response.data;
};

export const joinGroup = async (inviteCode: string) => {
  const response = await api.post("/groups/join", { inviteCode });

  return response.data;
};

export const getMyGroup = async () => {
  const response = await api.get(
    "/groups/me"
  );

  return response.data;
};

export const removeGroupMember = async (memberId: string) => {
  const response = await api.delete(`/groups/member/${memberId}`);

  return response.data;
};

export const refreshInviteCode = async () => {
  const response = await api.put("/groups/invite-code/refresh");

  return response.data;
};
