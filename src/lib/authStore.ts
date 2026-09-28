import { useSyncExternalStore } from "react";
import { api } from "./api";
import { clearToken, loadToken, saveToken } from "./tokenStorage";
import type { User } from "@/types";

type AuthState = { user: User | null; isLoading: boolean; isReady: boolean };
let state: AuthState = { user: null, isLoading: false, isReady: false };
const listeners = new Set<() => void>();
const publish = (next: Partial<AuthState>) => {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
};
const subscribe = (listener: () => void) => { listeners.add(listener); return () => listeners.delete(listener); };

async function refresh() {
  const token = await loadToken();
  if (!token) { publish({ user: null, isReady: true }); return null; }
  try {
    const { user } = await api.profile();
    publish({ user, isReady: true });
    return user;
  } catch {
    await clearToken();
    publish({ user: null, isReady: true });
    return null;
  }
}

async function authenticate(action: () => Promise<{ user: User; token: string }>) {
  publish({ isLoading: true });
  try {
    const result = await action();
    await saveToken(result.token);
    publish({ user: result.user, isReady: true });
    return result.user;
  } finally {
    publish({ isLoading: false });
  }
}

export const authActions = {
  refresh,
  login: (email: string, password: string) => authenticate(() => api.login(email, password)),
  register: (input: { name: string; email: string; phone: string; password: string }) => authenticate(() => api.register(input)),
  logout: async () => { await clearToken(); publish({ user: null, isReady: true }); },
};

export function useAuthStore() {
  return useSyncExternalStore(subscribe, () => state, () => state);
}

export function useAuthActions() { return authActions; }
