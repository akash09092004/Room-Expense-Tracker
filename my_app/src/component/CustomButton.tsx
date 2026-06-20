import React from "react";
import { TouchableOpacity, Text, ActivityIndicator, View } from "react-native";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type CustomButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: ButtonVariant;
  icon?: React.ReactNode;
  className?: string;
};

const CustomButton = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon = null,
  className = "",
}: CustomButtonProps) => {
  const styles = {
    primary: "bg-brand-600 shadow-lg shadow-brand-600/25",
    secondary: "bg-slate-100 border border-slate-200",
    ghost: "bg-transparent border border-slate-200",
    danger: "bg-rose-500 shadow-lg shadow-rose-500/20",
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`min-h-[52px] flex-row items-center justify-center rounded-2xl px-5 py-3 ${
        styles[variant]
      } ${className} ${disabled || loading ? "opacity-70" : ""}`}
      activeOpacity={0.88}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <Text
            className={`text-center text-base font-semibold ${
              variant === "secondary" || variant === "ghost"
                ? "text-slate-900"
                : "text-white"
            }`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
