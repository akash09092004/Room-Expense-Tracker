import { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { getMyGroup } from "../services/groupApi";
import type { Group } from "../types";

export const useGroup = () => {
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroup = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getMyGroup();
      setGroup(response?.group || null);
      setError(null);
    } catch (err) {
      const error = err as { response?: { data?: { message?: string } } };
      setGroup(null);
      setError(error?.response?.data?.message || "Failed to load group");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchGroup();
    }, [fetchGroup])
  );

  return {
    group,
    loading,
    error,
    fetchGroup,
  };
};
