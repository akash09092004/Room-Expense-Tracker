import React, {
  createContext,
  useState,
  useEffect,
} from "react";
import { Platform } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthContextValue, AuthUser } from "../types";

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token =
        await AsyncStorage.getItem(
          "token"
        );

      const userData =
        await AsyncStorage.getItem(
          "user"
        );

      if (token && userData) {
        setUser(JSON.parse(userData) as AuthUser);
        return;
      }

      if (token || userData) {
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
      }

      setUser(null);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (token: string, userData: AuthUser) => {
    await AsyncStorage.setItem(
      "token",
      token
    );

    await AsyncStorage.setItem(
      "user",
      JSON.stringify(userData)
    );

    setUser(userData);
  };

  const logout = async () => {
    setUser(null);

    await AsyncStorage.removeItem(
      "token"
    );

    await AsyncStorage.removeItem(
      "user"
    );

    if (Platform.OS === "web" && typeof window !== "undefined") {
      window.location.replace("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
