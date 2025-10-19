// src/utils/storage.ts
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
// 네이티브 전용 대체: AsyncStorage 사용해도 됨
// import AsyncStorage from "@react-native-async-storage/async-storage";

const WEB = Platform.OS === "web";

function safeGetLocalStorage() {
  try {
    if (typeof window !== "undefined" && window.localStorage)
      return window.localStorage;
  } catch (_) {}
  return null;
}

export const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (WEB) {
      const ls = safeGetLocalStorage();
      return ls ? ls.getItem(key) : null;
    }
    // 네이티브: 보안 저장 권장
    return await SecureStore.getItemAsync(key);
    // 또는 AsyncStorage:
    // return await AsyncStorage.getItem(key);
  },

  setItem: async (key: string, value: string): Promise<void> => {
    if (WEB) {
      const ls = safeGetLocalStorage();
      if (ls) {
        try {
          ls.setItem(key, value);
        } catch (_) {}
      }
      return;
    }
    await SecureStore.setItemAsync(key, value);
    // 또는 AsyncStorage.setItem(key, value);
  },

  removeItem: async (key: string): Promise<void> => {
    if (WEB) {
      const ls = safeGetLocalStorage();
      if (ls) {
        try {
          ls.removeItem(key);
        } catch (_) {}
      }
      return;
    }
    await SecureStore.deleteItemAsync(key);
    // 또는 AsyncStorage.removeItem(key);
  },
};
