import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../../component/CustomButton";
import EmptyState from "../../component/EmptyState";
import Loader from "../../component/Loader";
import { useGroup } from "../../hooks/useGroup";
import { useExpenses } from "../../hooks/useExpenses";
import { closeMonth } from "../../services/settlementApi";
import { calculateTotalExpense, formatCurrency } from "../../utils/helpers";

const CloseMonthScreen = () => {
  const { group, loading: groupLoading, error: groupError } = useGroup();
  const { expenses, loading: expensesLoading } = useExpenses();
  const [loading, setLoading] = useState(false);

  const totalExpense = calculateTotalExpense(expenses);
  const memberCount = group?.members?.length || 0;
  const perHeadShare = memberCount ? totalExpense / memberCount : 0;

  const summaryItems = useMemo(
    () => [
      { label: "Members", value: String(memberCount) },
      { label: "Total spent", value: formatCurrency(totalExpense) },
      { label: "Per head", value: formatCurrency(perHeadShare) },
    ],
    [memberCount, totalExpense, perHeadShare]
  );

  const handleCloseMonth = async () => {
    if (!group) {
      Alert.alert("No group", "Please join or create a group first.");
      return;
    }

    try {
      setLoading(true);
      const response = await closeMonth();
      Alert.alert(
        "Success",
        response?.settlement
          ? "Month closed successfully."
          : "Month closed."
      );
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
        <View className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons name="calendar-outline" size={22} color="#2563eb" />
            </View>
            <View>
              <Text className="text-3xl font-black text-slate-950">
                Close month
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">
                Finalize settlements and lock the current month summary.
              </Text>
            </View>
          </View>

          {groupError ? (
            <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Text className="text-sm text-amber-800">{groupError}</Text>
            </View>
          ) : null}

          <View className="mt-6 flex-row flex-wrap gap-3">
            {summaryItems.map((item) => (
              <View
                key={item.label}
                className="min-w-[160px] flex-1 rounded-3xl bg-slate-50 p-4"
              >
                <Text className="text-xs uppercase tracking-widest text-slate-400">
                  {item.label}
                </Text>
                <Text className="mt-2 text-2xl font-black text-slate-950">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>

          <View className="mt-6 rounded-3xl bg-slate-50 p-5">
            <Text className="text-sm text-slate-500">
              {group
                ? "Review all pending balances before closing. This action sends the settlement to your backend."
                : "Create or join a group first to unlock settlement closing."}
            </Text>
          </View>

          {group?.members?.length ? (
            <View className="mt-6 gap-3">
              {group.members.slice(0, 4).map((member) => (
                <View
                  key={member._id || member.email}
                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
                >
                  <Text className="text-sm font-semibold text-slate-900">
                    {member.name}
                  </Text>
                  <Text className="text-sm text-slate-500">{member.email}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="mt-6">
              <EmptyState
                title="No members"
                subtitle="A group needs at least one member before closing the month."
              />
            </View>
          )}

          <View className="mt-6">
            <CustomButton
              title="Close month"
              onPress={handleCloseMonth}
              loading={loading}
              disabled={!group?.members?.length}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CloseMonthScreen;
