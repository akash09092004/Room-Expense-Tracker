import React, { useCallback, useEffect, useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import MemberCard from "../../component/MemberCard";
import CustomButton from "../../component/CustomButton";
import {
  getMyGroup,
  refreshInviteCode,
  removeGroupMember,
} from "../../services/groupApi";
import { useAuth } from "../../hooks/useAuth";
import { copyTextToClipboard } from "../../utils/clipboard";
import type { Group } from "../../types";

const GroupDetailsScreen = () => {
  const navigation = useNavigation<any>();
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshingCode, setRefreshingCode] = useState(false);

  const loadGroup = useCallback(async () => {
    try {
      const response = await getMyGroup();
      setGroup(response.group);
    } catch (error: any) {
      Alert.alert(
        "Unable to load group",
        error?.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroup();
  }, [loadGroup]);

  useFocusEffect(
    useCallback(() => {
      loadGroup();
    }, [loadGroup])
  );

  const { user } = useAuth();
  const inviteCode = group?.inviteCode || "No code available";
  const memberCount = group?.members?.length || 0;
  const isAdmin = group?.admin?._id === user?._id || group?.admin?.email === user?.email;

  const handleCopyInvite = async () => {
    if (inviteCode !== "No code available") {
      try {
        const copied = await copyTextToClipboard(inviteCode);

        if (copied) {
          Alert.alert("Copied", "Invite code copied to clipboard.");
        } else {
          Alert.alert("Copy failed", `Copy this invite code manually:\n${inviteCode}`);
        }
      } catch (error) {
        Alert.alert("Copy failed", "Could not copy invite code right now.");
      }
    }
  };

  const handleRefreshInviteCode = async () => {
    try {
      setRefreshingCode(true);
      const response = await refreshInviteCode();
      setGroup(response.group);
      Alert.alert("Updated", "Invite code refreshed successfully.");
    } catch (error: any) {
      Alert.alert(
        "Refresh failed",
        error?.response?.data?.message || "Unable to refresh invite code"
      );
    } finally {
      setRefreshingCode(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      await removeGroupMember(memberId);
      Alert.alert("Removed", "Member has been removed from the group.");
      loadGroup();
    } catch (error: any) {
      Alert.alert(
        "Remove failed",
        error?.response?.data?.message || "Unable to remove member"
      );
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="mb-6 rounded-[28px] bg-brand-700 p-6 shadow-soft">
          <Text className="text-3xl font-black text-white">Room group</Text>
          <Text className="mt-2 max-w-2xl text-sm leading-6 text-brand-100">
            Keep your room group organized with invite code, member list, and
            quick actions for invites and group settings.
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-3">
            <View className="min-w-[180px] flex-1 rounded-3xl bg-white/10 px-4 py-4">
              <Text className="text-xs uppercase tracking-widest text-brand-100">
                Invite code
              </Text>
              <Text className="mt-2 text-2xl font-black text-white">
                {inviteCode}
              </Text>
            </View>
            <View className="min-w-[180px] flex-1 rounded-3xl bg-white/10 px-4 py-4">
              <Text className="text-xs uppercase tracking-widest text-brand-100">
                Members
              </Text>
              <Text className="mt-2 text-2xl font-black text-white">
                {memberCount}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-soft">
          <View className="mb-4 flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
              <Ionicons name="people-outline" size={20} color="#2563eb" />
            </View>
            <View>
              <Text className="text-lg font-bold text-slate-950">Members</Text>
              <Text className="text-sm text-slate-500">
                Manage who's in the group and track roles.
              </Text>
            </View>
          </View>

          {loading ? (
            <View className="py-8">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : group?.members?.length ? (
            group.members.map((member) => {
              const memberId = member._id;

              return (
                <View key={member.email} className="mb-4">
                  <MemberCard member={member} />
                  {isAdmin && memberId && memberId !== user?._id ? (
                    <CustomButton
                      title="Remove"
                      variant="danger"
                      onPress={() => handleRemoveMember(memberId)}
                    />
                  ) : null}
                </View>
              );
            })
          ) : (
            <Text className="text-sm text-slate-500">
              You are not currently in a group. Create a new group or join one.
            </Text>
          )}

          <View className="mt-2 flex-row flex-wrap gap-3">
            {group ? (
              <>
                <CustomButton
                  title="Copy invite code"
                  variant="secondary"
                  onPress={handleCopyInvite}
                />
                <CustomButton
                  title="Refresh"
                  variant="ghost"
                  onPress={handleRefreshInviteCode}
                  loading={refreshingCode}
                />
              </>
            ) : (
              <>
                <CustomButton
                  title="Create group"
                  variant="secondary"
                  onPress={() => navigation.navigate("CreateGroup")}
                />
                <CustomButton
                  title="Join group"
                  variant="ghost"
                  onPress={() => navigation.navigate("JoinGroup")}
                />
              </>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default GroupDetailsScreen;
