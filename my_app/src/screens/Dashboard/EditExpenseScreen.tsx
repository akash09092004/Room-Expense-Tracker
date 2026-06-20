import React from "react";
import { View, Text, ScrollView, Alert } from "react-native";

import CustomInput from "../../component/CustomInput";
import CustomButton from "../../component/CustomButton";

const EditExpenseScreen = () => {
  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <Text className="text-3xl font-black text-slate-950">
            Edit expense
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Update amount, item name, or category with a focused form.
          </Text>

          <View className="mt-6">
            <CustomInput label="Item name" placeholder="Item name" value="" onChangeText={() => {}} />
            <CustomInput label="Amount" placeholder="Amount" value="" onChangeText={() => {}} keyboardType="numeric" />
            <CustomInput label="Category" placeholder="Category" value="" onChangeText={() => {}} />

            <CustomButton
              title="Update expense"
              onPress={() => Alert.alert("Demo", "Wire this screen to updateExpense API.")}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default EditExpenseScreen;
