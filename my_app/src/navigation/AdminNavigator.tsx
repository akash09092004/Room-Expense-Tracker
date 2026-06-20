import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import type { AdminTabParamList } from "../types";

import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import MembersScreen from "../screens/admin/MembersScreen";
import CloseMonthScreen from "../screens/admin/CloseMonthScreen";

type IconName = React.ComponentProps<typeof Ionicons>["name"];
const Tab = createBottomTabNavigator<AdminTabParamList>();

const AdminNavigator = () => {
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
          let iconName: IconName = "grid-outline";

          if (route.name === "AdminHome") iconName = "shield-checkmark-outline";
          if (route.name === "Members") iconName = "people-outline";
          if (route.name === "CloseMonth") iconName = "calendar-outline";

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="AdminHome" component={AdminDashboardScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Members" component={MembersScreen} />
      <Tab.Screen name="CloseMonth" component={CloseMonthScreen} options={{ title: "Close" }} />
    </Tab.Navigator>
  );
};

export default AdminNavigator;
