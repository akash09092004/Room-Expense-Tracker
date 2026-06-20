import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import GroupDetailsScreen from "../screens/group/GroupDetailsScreen";
import CreateGroupScreen from "../screens/group/CreateGroupScreen";
import JoinGroupScreen from "../screens/group/JoinGroupScreen";
import type { GroupStackParamList } from "../types";

const Stack = createNativeStackNavigator<GroupStackParamList>();

const GroupStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupDetails" component={GroupDetailsScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="JoinGroup" component={JoinGroupScreen} />
    </Stack.Navigator>
  );
};

export default GroupStackNavigator;
