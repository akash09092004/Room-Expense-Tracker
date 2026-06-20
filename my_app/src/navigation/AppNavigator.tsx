import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import DashboardScreen from "../screens/Dashboard/DashboardScreen";
import ExpenseListScreen from "../screens/Dashboard/ExpenseListScreen";
import SettlementScreen from "../screens/Dashboard/SettlementScreen";
import GroupStackNavigator from "./GroupStackNavigator";

import { Ionicons } from "@expo/vector-icons";
import type { AppTabParamList } from "../types";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const Tab = createBottomTabNavigator<AppTabParamList>();

const AppNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          borderRadius: 24,
          height: 72,
          paddingTop: 10,
          paddingBottom: 10,
          backgroundColor: "rgba(255,255,255,0.96)",
          borderTopWidth: 0,
          boxShadow: "0 20px 45px rgba(15, 23, 42, 0.12)",
          elevation: 12,
        },
        tabBarItemStyle: {
          borderRadius: 18,
          marginHorizontal: 4,
          marginTop: 4,
        },

        tabBarIcon: ({ color, size }) => {
          const iconMap: Record<keyof AppTabParamList, IconName> = {
            Dashboard: "home",
            Expenses: "wallet",
            Settlement: "cash",
            Group: "people",
          };

          const iconName = iconMap[route.name] || "help-circle";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Expenses" component={ExpenseListScreen} />
      <Tab.Screen name="Settlement" component={SettlementScreen} />
      <Tab.Screen name="Group" component={GroupStackNavigator} />
    </Tab.Navigator>
  );
};

export default AppNavigator;
