import React, { useMemo } from "react";
import { View, Text, ScrollView, useWindowDimensions, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import CustomButton from "../../component/CustomButton";
import Loader from "../../component/Loader";
import EmptyState from "../../component/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { useGroup } from "../../hooks/useGroup";
import { useExpenses } from "../../hooks/useExpenses";
import { formatCurrency, calculateTotalExpense } from "../../utils/helpers";
import { copyTextToClipboard } from "../../utils/clipboard";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const AdminDashboardScreen = () => {
  const navigation = useNavigation<any>();
  const { user, logout } = useAuth();
  const { group, loading: groupLoading, error: groupError } = useGroup();
  const { expenses, loading: expensesLoading } = useExpenses();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const totalExpense = calculateTotalExpense(expenses);
  const memberCount = group?.members?.length || 0;
  const perHeadAmount = memberCount ? totalExpense / memberCount : 0;
  const pendingAmount = group?.isSettled ? 0 : totalExpense;
  const recentMembers = group?.members?.slice(0, 3) || [];
  const inviteCode = group?.inviteCode || "Not available";

  const stats: Array<{ label: string; value: string; icon: IconName }> = useMemo(
    () => [
      { label: "Members", value: String(memberCount), icon: "people-outline" },
      { label: "Pending", value: formatCurrency(pendingAmount), icon: "time-outline" },
      {
        label: "Current share",
        value: formatCurrency(perHeadAmount),
        icon: "checkmark-done-outline",
      },
    ],
    [memberCount, pendingAmount, perHeadAmount]
  );

  const handleCopyInvite = async () => {
    if (!group?.inviteCode) {
      Alert.alert("No invite code", "Create a group first to generate one.");
      return;
    }

    const copied = await copyTextToClipboard(group.inviteCode);

    if (copied) {
      Alert.alert("Copied", "Invite code copied to clipboard.");
    } else {
      Alert.alert("Copy failed", `Copy this code manually:\n${group.inviteCode}`);
    }
  };

  const handleLogout = () => {
    (async () => {
      try {
        await logout();
      } catch (error) {
        Alert.alert("Logout failed", "Please try again.");
      }
    })();
  };

  if (groupLoading || expensesLoading) {
    return <Loader text="Loading admin dashboard..." />;
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="rounded-[32px] bg-slate-950 p-6 shadow-soft md:p-8">
          <Text className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-300">
            Admin dashboard
          </Text>
          <Text className="mt-3 text-3xl font-black text-white md:text-5xl">
            Control room expenses from one place
          </Text>
          <Text className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">
            Review members, copy the invite code, and close the month with live
            data from your backend.
          </Text>

          <View className="mt-6 rounded-3xl bg-white/10 p-4">
            <Text className="text-xs uppercase tracking-widest text-slate-300">
              Logged in as
            </Text>
            <Text className="mt-2 text-lg font-semibold text-white">
              {user?.name || "Admin"}{" "}
              <Text className="text-sm font-normal text-slate-300">
                {user?.email ? `(${user.email})` : ""}
              </Text>
            </Text>
            <Text className="mt-1 text-sm text-slate-300">
              {group?.inviteCode
                ? `Invite code: ${inviteCode}`
                : "No active group found"}
            </Text>
          </View>

          <View className="mt-6 flex-row flex-wrap gap-3">
            {stats.map((item) => (
              <View
                key={item.label}
                className="min-w-[160px] flex-1 rounded-3xl bg-white/10 p-4"
              >
                <View className="mb-4 h-11 w-11 items-center justify-center rounded-2xl bg-white/10">
                  <Ionicons name={item.icon} size={20} color="#fff" />
                </View>
                <Text className="text-xs uppercase tracking-widest text-slate-300">
                  {item.label}
                </Text>
                <Text className="mt-2 text-2xl font-black text-white">
                  {item.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className={`mt-6 ${isDesktop ? "flex-row gap-4" : ""}`}>
          <View className="flex-1 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <Text className="text-lg font-bold text-slate-950">
              Quick actions
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              Jump to member management or month closing.
            </Text>

            <View className="mt-5 gap-3">
              <CustomButton
                title="Copy invite code"
                variant="secondary"
                onPress={handleCopyInvite}
                disabled={!group?.inviteCode}
              />
              <CustomButton
                title="Open Members"
                onPress={() => navigation?.navigate?.("Members")}
              />
              <CustomButton
                title="Close Month"
                variant="secondary"
                onPress={() => navigation?.navigate?.("CloseMonth")}
              />
              <CustomButton
                title="Logout"
                variant="danger"
                onPress={handleLogout}
              />
            </View>
          </View>

          <View className="mt-4 flex-1 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft md:mt-0">
            <Text className="text-lg font-bold text-slate-950">
              Group snapshot
            </Text>
            <Text className="mt-2 text-sm leading-6 text-slate-500">
              {groupError
                ? groupError
                : group
                  ? "Live group data is connected and ready for admin actions."
                  : "Create or join a group first to unlock admin controls."}
            </Text>

            {group ? (
              <View className="mt-4 rounded-3xl bg-slate-50 p-4">
                <Text className="text-xs uppercase tracking-widest text-slate-400">
                  Summary
                </Text>
                <Text className="mt-2 text-base font-semibold text-slate-900">
                  {memberCount} members · {formatCurrency(totalExpense)} spent
                </Text>
                <Text className="mt-1 text-sm text-slate-500">
                  {group.isSettled
                    ? "Month is settled."
                    : "Month is open and pending balances are active."}
                </Text>
              </View>
            ) : (
              <View className="mt-4">
                <EmptyState
                  title="No group found"
                  subtitle="Create a group or join one to unlock the admin dashboard."
                />
              </View>
            )}
          </View>
        </View>

        {recentMembers.length ? (
          <View className="mt-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
            <Text className="text-lg font-bold text-slate-950">
              Recent members
            </Text>
            <Text className="mt-2 text-sm text-slate-500">
              A quick look at the people currently in the group.
            </Text>

            <View className="mt-4 gap-3">
              {recentMembers.map((member) => (
                <View
                  key={member._id || member.email}
                  className="rounded-3xl border border-slate-200 bg-slate-50 p-4"
                >
                  <Text className="text-base font-semibold text-slate-900">
                    {member.name}
                  </Text>
                  <Text className="text-sm text-slate-500">{member.email}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
};

export default AdminDashboardScreen;
