import React, { useState } from "react";
import { View, Text, ScrollView, Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import MemberCard from "../../component/MemberCard";
import EmptyState from "../../component/EmptyState";
import Loader from "../../component/Loader";
import { useAuth } from "../../hooks/useAuth";
import { useGroup } from "../../hooks/useGroup";
import { removeGroupMember } from "../../services/groupApi";

const MembersScreen = () => {
  const { user } = useAuth();
  const { group, loading, error, fetchGroup } = useGroup();
  const [removingId, setRemovingId] = useState<string | null>(null);

  const isAdmin =
    group?.admin?._id === user?._id || group?.admin?.email === user?.email;

  const handleRemoveMember = async (memberId: string) => {
    if (!isAdmin) return;

    try {
      setRemovingId(memberId);
      await removeGroupMember(memberId);
      Alert.alert("Removed", "Member has been removed from the group.");
      await fetchGroup();
    } catch (error: any) {
      Alert.alert(
        "Remove failed",
        error?.response?.data?.message || "Unable to remove member."
      );
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return <Loader text="Loading members..." />;
  }

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons name="people-outline" size={22} color="#2563eb" />
            </View>
            <View>
              <Text className="text-3xl font-black text-slate-950">Members</Text>
              <Text className="mt-2 text-sm leading-6 text-slate-500">
                Manage roles and membership visibility.
              </Text>
            </View>
          </View>

          {error ? (
            <View className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
              <Text className="text-sm text-amber-800">{error}</Text>
            </View>
          ) : null}

          <View className="mt-6">
            {group?.members?.length ? (
              group.members.map((member) => {
                const memberId = member._id || member.email;
                const isCurrentUser =
                  member._id === user?._id || member.email === user?.email;
                const canRemove =
                  isAdmin && !isCurrentUser && !!member._id;

                return (
                  <View key={memberId} className="mb-4">
                    <MemberCard member={member} />

                    {canRemove ? (
                      <Pressable
                        onPress={() => handleRemoveMember(member._id!)}
                        disabled={removingId === member._id}
                        className="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
                      >
                        <Text className="text-center text-sm font-semibold text-rose-700">
                          {removingId === member._id ? "Removing..." : "Remove member"}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                );
              })
            ) : (
              <EmptyState
                title="No members found"
                subtitle="Create or join a group to start managing members."
              />
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default MembersScreen;
