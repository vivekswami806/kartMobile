import { Stack } from "expo-router";
import { useEffect } from "react";
import { authActions } from "@/lib/authStore";

export default function RootLayout() {
  useEffect(() => { void authActions.refresh(); }, []);
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#10151c" } }} />;
}
