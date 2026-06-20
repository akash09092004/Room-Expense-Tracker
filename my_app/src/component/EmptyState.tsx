import React from "react";
import { View, Text } from "react-native";

const EmptyState = ({
  title = "No data found",
  subtitle = "New items will show up here once you start using the app.",
}) => {
  return (
    <View className="items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-10">
      <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-brand-50">
        <Text className="text-2xl text-brand-700">•</Text>
      </View>

      <Text className="text-center text-lg font-semibold text-slate-900">
        {title}
      </Text>

      <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
        {subtitle}
      </Text>
    </View>
  );
};

export default EmptyState;
