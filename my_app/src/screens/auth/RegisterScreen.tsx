import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Alert,
  useWindowDimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { registerUser } from "../../services/authApi";
import CustomInput from "../../component/CustomInput";
import CustomButton from "../../component/CustomButton";
import { APP_NAME } from "../../utils/constants";

const RegisterScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    try {
      if (!name || !email || !password) {
        return Alert.alert("Missing info", "Please fill all fields");
      }

      setLoading(true);
      await registerUser({ name, email, password });
      Alert.alert(
        "Account created",
        "Your account has been created successfully. You can now log in with your email and password."
      );
      navigation.navigate("Login");
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Something went wrong";

      if (message === "User already exists") {
        Alert.alert(
          "User already exists",
          "This email is already registered. Please use a different email or log in."
        );
        return;
      }

      Alert.alert(
        "Registration failed",
        message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView
        className="flex-1"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled"
      >
        <View className="absolute left-[-80px] top-16 h-56 w-56 rounded-full bg-emerald-500/15" />
        <View className="absolute right-[-60px] top-32 h-40 w-40 rounded-full bg-brand-500/20" />
        <View className="absolute bottom-16 left-1/4 h-24 w-24 rounded-full bg-white/10" />

        <View className="flex-1 px-4 py-6 sm:px-6 md:px-10 md:py-10">
          <View className="mx-auto w-full max-w-6xl flex-1 md:flex-row md:items-center md:gap-8">
            {isDesktop ? (
              <View className="flex-1 rounded-[36px] border border-white/10 bg-white/5 p-8 shadow-soft">
                <View className="mb-6 h-14 w-14 items-center justify-center rounded-3xl bg-white/10">
                  <Ionicons name="people-outline" size={28} color="#fff" />
                </View>

                <Text className="text-4xl font-black leading-tight text-white lg:text-5xl">
                  Start your shared expense journey.
                </Text>

                <Text className="mt-4 max-w-xl text-base leading-7 text-slate-300">
                  Create your account in seconds and bring your room group
                  together with clear balances, fast settlements, and a cleaner
                  dashboard.
                </Text>

                <View className="mt-8 flex-row flex-wrap gap-4">
                  <View className="min-w-[160px] flex-1 rounded-3xl bg-white/10 p-4">
                    <Text className="text-2xl font-bold text-white">Simple</Text>
                    <Text className="mt-1 text-sm text-slate-300">
                      Fast onboarding
                    </Text>
                  </View>
                  <View className="min-w-[160px] flex-1 rounded-3xl bg-white/10 p-4">
                    <Text className="text-2xl font-bold text-white">Clean</Text>
                    <Text className="mt-1 text-sm text-slate-300">
                      Clear balances
                    </Text>
                  </View>
                  <View className="min-w-[160px] flex-1 rounded-3xl bg-white/10 p-4">
                    <Text className="text-2xl font-bold text-white">Fast</Text>
                    <Text className="mt-1 text-sm text-slate-300">
                      Smooth web UI
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <View className="w-full flex-1 rounded-[36px] border border-slate-200 bg-white p-6 shadow-soft sm:p-8">
              <View className="mb-6 md:hidden">
                <View className="mb-4 h-12 w-12 items-center justify-center rounded-2xl bg-brand-600">
                  <Ionicons name="people-outline" size={24} color="#fff" />
                </View>
                <Text className="text-3xl font-black text-slate-950">
                  {APP_NAME}
                </Text>
                <Text className="mt-2 text-sm leading-6 text-slate-500">
                  Create your account and manage shared room expenses with ease.
                </Text>
              </View>

              <Text className="hidden text-3xl font-black text-slate-950 md:block">
                Create account
              </Text>
              <Text className="mt-2 hidden text-sm leading-6 text-slate-500 md:block">
                Join your room group and begin tracking expenses.
              </Text>

              <View className="mt-6">
                <CustomInput
                  label="Full name"
                  placeholder="Enter your name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />

                <CustomInput
                  label="Email"
                  placeholder="you@example.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                />

                <CustomInput
                  label="Password"
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <CustomButton
                  title="Create account"
                  onPress={handleRegister}
                  loading={loading}
                />

                <View className="mt-5 flex-row flex-wrap items-center justify-center">
                  <Text className="text-sm text-slate-500">
                    Already have an account?
                  </Text>
                  <Text
                    onPress={() => navigation.navigate("Login")}
                    className="ml-1 text-sm font-semibold text-brand-700"
                  >
                    Login
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default RegisterScreen;
