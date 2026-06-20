import React from "react";
import { View, Text, TextInput, type TextInputProps } from "react-native";

type CustomInputProps = {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps["keyboardType"];
  autoCapitalize?: TextInputProps["autoCapitalize"];
  rightSlot?: React.ReactNode;
};

const CustomInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
  rightSlot = null,
}: CustomInputProps) => {
  return (
    <View className="mb-4 w-full">
      {label ? (
        <Text className="mb-2 text-sm font-semibold text-slate-700">
          {label}
        </Text>
      ) : null}

      <View className="flex-row items-center rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm shadow-slate-200/60">
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          placeholderTextColor="#94a3b8"
          className="min-h-[24px] flex-1 text-base text-slate-900"
        />

        {rightSlot}
      </View>
    </View>
  );
};

export default CustomInput;
