import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const TOKEN_KEY = "krikart_token";
let cachedToken: string | null = null;

export async function loadToken() {
  try {
    cachedToken = Platform.OS === "web"
      ? globalThis.localStorage?.getItem(TOKEN_KEY) ?? null
      : await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    cachedToken = null;
  }
  return cachedToken;
}

export function getToken() {
  return cachedToken;
}

export async function saveToken(token: string) {
  cachedToken = token;
  if (Platform.OS === "web") globalThis.localStorage?.setItem(TOKEN_KEY, token);
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearToken() {
  cachedToken = null;
  if (Platform.OS === "web") globalThis.localStorage?.removeItem(TOKEN_KEY);
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}
