import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../../component/CustomButton";
import EmptyState from "../../component/EmptyState";
import Loader from "../../component/Loader";
import { useAuth } from "../../hooks/useAuth";
import { getMyGroup } from "../../services/groupApi";
import { formatCurrency } from "../../utils/helpers";
import { closeMonth } from "../../services/settlementApi";
import { calculateTotalExpense } from "../../utils/helpers";
import { useExpenses } from "../../hooks/useExpenses";
import type { Group, Member } from "../../types";

const SettlementScreen = () => {
  const { user } = useAuth();
  const { expenses, loading: expensesLoading } = useExpenses();
  const [group, setGroup] = useState<Group | null>(null);
  const [groupLoading, setGroupLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      setGroupLoading(true);
      const response = await getMyGroup();
      setGroup(response.group || null);
    } catch (error: any) {
      console.log(error);
      setGroup(null);
    } finally {
      setGroupLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  const members = useMemo(() => {
    const groupMembers = group?.members || [];

    if (!groupMembers.length) {
      return [];
    }

    const seen = new Set<string>();
    const normalizedMembers: Array<Member & { isCurrentUser: boolean }> = [];

    const pushMember = (member: Member, isCurrentUser: boolean) => {
      const key = member._id || member.email;
      if (seen.has(key)) return;
      seen.add(key);
      normalizedMembers.push({ ...member, isCurrentUser });
    };

    groupMembers.forEach((member) => {
      const isCurrentUser =
        !!user &&
        (member._id === user._id || member.email === user.email);
      pushMember(member, isCurrentUser);
    });

    if (user) {
      const loggedUser = {
        _id: user._id,
        name: user.name || "You",
        email: user.email || "",
        role: user.role || "member",
      };
      pushMember(loggedUser, true);
    }

    return normalizedMembers;
  }, [group, user]);

  const totalExpense = calculateTotalExpense(expenses);
  const perHeadAmount = members.length ? totalExpense / members.length : 0;

  const settlements = useMemo(() => {
    return members.map((member) => ({
      name: member.isCurrentUser ? `${member.name} (You)` : member.name,
      owes: perHeadAmount,
      status: member.isCurrentUser ? "Logged in user" : "Group member",
    }));
  }, [members, perHeadAmount]);

  const handleCloseMonth = async () => {
    try {
      setLoading(true);
      await closeMonth();
      Alert.alert("Success", "Month closed successfully.");
    } catch (error: any) {
      Alert.alert(
        "Close month failed",
        error?.response?.data?.message || "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (groupLoading || expensesLoading) {
    return <Loader text="Loading settlement data..." />;
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="mb-6 rounded-[28px] bg-slate-950 p-6 shadow-soft">
          <Text className="text-3xl font-black text-white">
            Settlement center
          </Text>
          <Text className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
            View who owes what, settle amounts cleanly, and close the month
            without back-and-forth.
          </Text>

          <View className="mt-4 rounded-3xl bg-white/10 px-4 py-4">
            <Text className="text-xs uppercase tracking-widest text-slate-300">
              Logged in as
            </Text>
            <Text className="mt-2 text-lg font-black text-white">
              {user?.name || "User"}{" "}
              <Text className="text-sm font-medium text-slate-300">
                {user?.email ? `(${user.email})` : ""}
              </Text>
            </Text>
            <Text className="mt-1 text-sm text-slate-300">
              {group?.inviteCode
                ? `Group code: ${group.inviteCode}`
                : "No active group found"}
            </Text>
          </View>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="min-w-[180px] flex-1 rounded-3xl bg-white/10 px-4 py-4">
              <Text className="text-xs uppercase tracking-widest text-slate-300">
                Total pending
              </Text>
              <Text className="mt-2 text-2xl font-black text-white">
                {formatCurrency(
                  settlements.reduce((sum, item) => sum + item.owes, 0)
                )}
              </Text>
            </View>
            <View className="min-w-[180px] flex-1 rounded-3xl bg-white/10 px-4 py-4">
              <Text className="text-xs uppercase tracking-widest text-slate-300">
                Members shown
              </Text>
              <Text className="mt-2 text-2xl font-black text-white">
                {settlements.length}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons name="swap-horizontal-outline" size={20} color="#2563eb" />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-950">
                Settlement breakdown
              </Text>
              <Text className="text-sm text-slate-500">
                Fast look at pending and completed payments.
              </Text>
            </View>
          </View>

          {settlements.length ? (
            settlements.map((item) => (
              <View
                key={item.name}
                className="mb-3 rounded-3xl border border-slate-200 bg-slate-50 p-4"
              >
                <View className="flex-row items-center justify-between">
                  <View>
                    <Text className="text-base font-semibold text-slate-900">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-slate-500">
                      {item.status}
                    </Text>
                  </View>

                  <Text className="text-lg font-black text-slate-950">
                    {formatCurrency(item.owes)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <EmptyState
              title="No group members yet"
              subtitle="Join or create a group so the settlement list can show members."
            />
          )}

          <View className="mt-2">
            <CustomButton
              title="Close month"
              variant="primary"
              onPress={handleCloseMonth}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default SettlementScreen;
