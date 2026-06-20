import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

const Loader = ({ text = "Loading..." }) => {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50 px-6">
      <View className="items-center rounded-[28px] border border-slate-200 bg-white px-6 py-8 shadow-soft">
        <ActivityIndicator size="large" color="#2563eb" />

        <Text className="mt-4 text-sm font-medium text-slate-500">
          {text}
        </Text>
      </View>
    </View>
  );
};

export default Loader;
