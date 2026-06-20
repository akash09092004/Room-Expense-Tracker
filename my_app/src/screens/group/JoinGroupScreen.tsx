import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../../component/CustomInput";
import CustomButton from "../../component/CustomButton";
import { joinGroup } from "../../services/groupApi";

const JoinGroupScreen = () => {
  const navigation = useNavigation<any>();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      return Alert.alert("Invite code required", "Please enter a valid invite code.");
    }

    try {
      setLoading(true);
      await joinGroup(inviteCode.trim());
      Alert.alert("Joined", "You have successfully joined the group.");
      navigation.navigate("GroupDetails");
    } catch (error: any) {
      Alert.alert(
        "Join failed",
        error?.response?.data?.message || "Please check the invite code and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <Text className="text-3xl font-black text-slate-950">Join group</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Enter the invite code from the group creator to join.
          </Text>

          <View className="mt-6">
            <CustomInput
              label="Invite code"
              placeholder="Enter invite code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
            />

            <CustomButton
              title="Join group"
              onPress={handleJoin}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default JoinGroupScreen;
