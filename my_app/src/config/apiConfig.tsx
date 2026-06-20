import { Platform } from "react-native";
import Constants from "expo-constants";

const DEFAULT_PORT = "5000";

const LOCAL_WEB_URL = `http://localhost:${DEFAULT_PORT}/api`;
const LOCAL_ANDROID_EMULATOR_URL = `http://10.0.2.2:${DEFAULT_PORT}/api`;
const LOCAL_IOS_SIMULATOR_URL = `http://localhost:${DEFAULT_PORT}/api`;

const getHostFromExpo = () => {
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.expoGoConfig?.debuggerHost ||
    Constants.expoConfig?.hostUri;

  if (!hostUri) return null;

  return hostUri.split(":")[0];
};

const getBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) {
    return envUrl.replace(/\/$/, "");
  }

  if (Platform.OS === "web") {
    return LOCAL_WEB_URL;
  }

  if (Platform.OS === "android") {
    const host = getHostFromExpo();

    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:${DEFAULT_PORT}/api`;
    }

    return LOCAL_ANDROID_EMULATOR_URL;
  }

  if (Platform.OS === "ios") {
    const host = getHostFromExpo();

    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return `http://${host}:${DEFAULT_PORT}/api`;
    }

    return LOCAL_IOS_SIMULATOR_URL;
  }

  return LOCAL_WEB_URL;
};

const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  ENDPOINTS: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    CREATE_GROUP: "/groups/create",
    JOIN_GROUP: "/groups/join",
    MY_GROUP: "/groups/me",
    EXPENSES: "/expenses",
    CLOSE_MONTH: "/settlements/close",
  },
};

export default API_CONFIG;
