import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../../component/CustomInput";
import CustomButton from "../../component/CustomButton";
import { createGroup } from "../../services/groupApi";

const CreateGroupScreen = () => {
  const navigation = useNavigation<any>();
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!groupName.trim()) {
      return Alert.alert("Missing name", "Please enter a group name.");
    }

    try {
      setLoading(true);
      const response = await createGroup({ name: groupName });
      Alert.alert("Created", `Group created with code ${response.group.inviteCode}`);
      navigation.navigate("GroupDetails");
    } catch (error: any) {
      Alert.alert(
        "Create group failed",
        error?.response?.data?.message || "Please try again"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <Text className="text-3xl font-black text-slate-950">Create group</Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Start a new room group and invite your members.
          </Text>

          <View className="mt-6">
            <CustomInput
              label="Group name"
              placeholder="e.g. Room 202"
              value={groupName}
              onChangeText={setGroupName}
              autoCapitalize="words"
            />
            <CustomInput
              label="Description"
              placeholder="Short group description"
              value={description}
              onChangeText={setDescription}
              autoCapitalize="sentences"
            />

            <CustomButton
              title="Create group"
              onPress={handleCreate}
              loading={loading}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default CreateGroupScreen;
