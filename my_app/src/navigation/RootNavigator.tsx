import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import AdminNavigator from "./AdminNavigator";
import AddExpenseScreen from "../screens/Dashboard/AddExpenseScreen";
import Loader from "../component/Loader";

import { useAuth } from "../hooks/useAuth";

const Stack = createNativeStackNavigator();

const RootNavigator = () => {
  const { user, loading } = useAuth();
  const navigatorKey = loading
    ? "loading"
    : user?.role === "admin"
      ? "admin"
      : user
        ? "member"
        : "guest";

  if (loading) {
    return <Loader text="Loading your workspace..." />;
  }

  return (
    <Stack.Navigator
      key={navigatorKey}
      screenOptions={{
        headerShown: false,
      }}
    >
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : user?.role === "admin" ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        <>
          <Stack.Screen name="App" component={AppNavigator} />
          <Stack.Screen
            name="AddExpense"
            component={AddExpenseScreen}
            options={{ presentation: "modal" }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
