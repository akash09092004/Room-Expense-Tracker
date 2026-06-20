import React from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import CustomButton from "../../component/CustomButton";
import { APP_NAME } from "../../utils/constants";

const highlights = [
  {
    title: "Invite codes",
    description: "Create a room group and invite members with one shared code.",
    icon: "qr-code-outline",
  },
  {
    title: "Live balances",
    description: "Track expenses, per-head totals, and settlement status together.",
    icon: "pulse-outline",
  },
  {
    title: "Admin control",
    description: "Open the admin dashboard after login for members and month close.",
    icon: "shield-checkmark-outline",
  },
] as const;

const HomeScreen = () => {
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="absolute left-[-80px] top-10 h-56 w-56 rounded-full bg-brand-500/20" />
      <View className="absolute right-[-70px] top-36 h-44 w-44 rounded-full bg-cyan-400/15" />
      <View className="absolute bottom-20 left-1/4 h-28 w-28 rounded-full bg-white/10" />

      <View className="px-4 pb-16 pt-4 sm:px-6 md:px-8 md:pt-6">
        <View className="mx-auto w-full max-w-7xl rounded-[32px] border border-white/10 bg-white/5 px-5 py-4 shadow-soft backdrop-blur-xl md:px-6">
          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-600">
                <Ionicons name="wallet-outline" size={22} color="#fff" />
              </View>
              <View>
                <Text className="text-lg font-black text-white">
                  {APP_NAME}
                </Text>
                <Text className="text-xs uppercase tracking-[0.28em] text-slate-300">
                  room expense tracker
                </Text>
              </View>
            </View>

            <View className="flex-row items-center gap-2">
              <Pressable
                onPress={() => navigation.navigate("Login")}
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2"
              >
                <Text className="text-sm font-semibold text-white">Login</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate("Register")}
                className="rounded-full bg-white px-4 py-2"
              >
                <Text className="text-sm font-semibold text-slate-950">
                  Register
                </Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View className={`mx-auto mt-8 w-full max-w-7xl ${isDesktop ? "flex-row gap-6" : ""}`}>
          <View className="flex-1 rounded-[36px] border border-white/10 bg-slate-900/90 p-6 shadow-soft md:p-8">
            <Text className="text-xs font-semibold uppercase tracking-[0.45em] text-brand-300">
              Welcome to RumiPay
            </Text>
            <Text className="mt-4 text-4xl font-black leading-tight text-white md:text-6xl">
              Split room expenses without confusion.
            </Text>
            <Text className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Register your account, join a group with an invite code, and let
              the dashboard organize who paid, who owes, and when the month is
              ready to close.
            </Text>

            <View className="mt-6 flex-row flex-wrap gap-3">
              <CustomButton
                title="Register now"
                onPress={() => navigation.navigate("Register")}
              />
              <CustomButton
                title="Login"
                variant="secondary"
                onPress={() => navigation.navigate("Login")}
              />
            </View>

            <View className="mt-8 flex-row flex-wrap gap-3">
              <View className="min-w-[160px] flex-1 rounded-3xl border border-white/10 bg-white/10 p-4">
                <Text className="text-2xl font-black text-white">Fast</Text>
                <Text className="mt-1 text-sm text-slate-300">
                  Quick signup and login flow
                </Text>
              </View>
              <View className="min-w-[160px] flex-1 rounded-3xl border border-white/10 bg-white/10 p-4">
                <Text className="text-2xl font-black text-white">Clean</Text>
                <Text className="mt-1 text-sm text-slate-300">
                  Simple dashboard for every member
                </Text>
              </View>
              <View className="min-w-[160px] flex-1 rounded-3xl border border-white/10 bg-white/10 p-4">
                <Text className="text-2xl font-black text-white">Smart</Text>
                <Text className="mt-1 text-sm text-slate-300">
                  Admin tools after login
                </Text>
              </View>
            </View>
          </View>

          <View className="mt-6 flex-1 rounded-[36px] border border-slate-200 bg-white p-6 shadow-soft md:mt-0 md:p-8">
            <Text className="text-sm font-semibold uppercase tracking-[0.35em] text-brand-700">
              How it works
            </Text>
            <View className="mt-5 gap-4">
              {highlights.map((item, index) => (
                <View
                  key={item.title}
                  className="rounded-[28px] border border-slate-200 bg-slate-50 p-4"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-brand-50">
                      <Ionicons name={item.icon} size={20} color="#2563eb" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-bold text-slate-950">
                        {index + 1}. {item.title}
                      </Text>
                      <Text className="mt-1 text-sm leading-6 text-slate-500">
                        {item.description}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View className="mt-6 rounded-[28px] bg-slate-950 p-5">
              <Text className="text-xs font-semibold uppercase tracking-[0.35em] text-brand-300">
                Next step
              </Text>
              <Text className="mt-3 text-lg font-black text-white">
                Register first, then login to reach the right dashboard.
              </Text>
              <Text className="mt-2 text-sm leading-6 text-slate-300">
                If your account role is admin, the app opens the admin dashboard.
                Otherwise it opens the member dashboard automatically.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default HomeScreen;
