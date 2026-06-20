import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveData = async (key: string, value: unknown) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.log(error);
  }
};

export const getData = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);

    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const removeData = async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.log(error);
    }
  };

export const clearStorage = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log(error);
    }
  };
