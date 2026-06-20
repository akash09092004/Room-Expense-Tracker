import React, { useState } from "react";
import { View, Text, ScrollView, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

import CustomInput from "../../component/CustomInput";
import CustomButton from "../../component/CustomButton";
import { addExpense } from "../../services/expenseApi";
import { normalizeCategory } from "../../utils/helpers";

const AddExpenseScreen = () => {
  const navigation = useNavigation<any>();
  const [itemName, setItemName] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!itemName.trim() || !amount.trim()) {
      Alert.alert("Missing info", "Item name aur amount bharna zaroori hai.");
      return;
    }

    try {
      setSaving(true);
      await addExpense({
        itemName: itemName.trim(),
        amount: Number(amount),
        category: normalizeCategory(category),
      });

      Alert.alert("Saved", "Expense add ho gaya.");
      setItemName("");
      setAmount("");
      setCategory("");
      navigation.goBack();
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Expense save nahi ho saka.";

      Alert.alert(
        "Save failed",
        message
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50">
      <View className="px-4 pb-28 pt-4 md:px-8 md:pt-8">
        <View className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-soft">
          <Text className="text-3xl font-black text-slate-950">
            Add expense
          </Text>
          <Text className="mt-2 text-sm leading-6 text-slate-500">
            Record a new room expense in a clean, friendly form.
          </Text>

          <View className="mt-6">
            <CustomInput
              label="Item name"
              placeholder="e.g. Groceries"
              value={itemName}
              onChangeText={setItemName}
              autoCapitalize="words"
            />
            <CustomInput
              label="Amount"
              placeholder="e.g. 1250"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
            />
            <CustomInput
              label="Category"
              placeholder="e.g. Food"
              value={category}
              onChangeText={setCategory}
              autoCapitalize="words"
            />

            <CustomButton
              title="Save expense"
              onPress={handleSave}
              loading={saving}
            />
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AddExpenseScreen;
