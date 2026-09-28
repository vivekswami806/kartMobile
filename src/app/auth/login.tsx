import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { authActions } from "@/lib/authStore";
import { Page, palette } from "@/components/ui";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!email.trim() || !password) return;

    setBusy(true);
    setError("");

    try {
      await authActions.login(email.trim(), password);
      router.replace("/(tabs)");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Sign in failed. Please check your details."
      );
    } finally {
      setBusy(false);
    }
  };

  const disabled = busy || !email.trim() || !password;

  return (
    <Page title="">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <Pressable
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={palette.text}
            />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Ionicons
                name="cart"
                size={30}
                color="#10151c"
              />
            </View>

            <Text style={styles.brand}>Krikart</Text>

            <Text style={styles.subtitle}>
              Groceries and meals delivered to you
            </Text>
          </View>

          {/* Login card */}
          <View style={styles.card}>
            <View style={{ marginBottom: 22 }}>
              <Text style={styles.title}>Welcome back </Text>
              <Text style={styles.description}>
                Sign in to continue shopping with Krikart.
              </Text>
            </View>

            {/* Email / phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email or phone</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={palette.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  placeholder="Enter email or phone"
                  placeholderTextColor={palette.muted}
                  style={styles.input}
                  editable={!busy}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={19}
                  color={palette.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={palette.muted}
                  style={styles.input}
                  editable={!busy}
                />

                <Pressable
                  onPress={() => setShowPassword((value) => !value)}
                  hitSlop={10}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color={palette.muted}
                  />
                </Pressable>
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#ff817e"
                />

                <Text style={styles.errorText}>
                  {error}
                </Text>
              </View>
            )}

            {/* Sign in */}
            <Pressable
              disabled={disabled}
              onPress={() => void submit()}
              style={[
                styles.button,
                disabled && styles.buttonDisabled,
              ]}
            >
              {busy ? (
                <ActivityIndicator color="#10151c" />
              ) : (
                <>
                  <Text style={styles.buttonText}>
                    Sign in
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#10151c"
                  />
                </>
              )}
            </Pressable>

            {/* Register */}
            <View style={styles.registerBox}>
              <Text style={styles.registerText}>
                Don't have an account?
              </Text>

              <Link
                href="/auth/register"
                style={styles.registerLink}
              >
                Create an account
              </Link>
            </View>
          </View>

          {/* Continue browsing */}
          <Pressable
            onPress={() => router.replace("/(tabs)")}
            style={styles.browseButton}
          >
            <Ionicons
              name="storefront-outline"
              size={18}
              color={palette.muted}
            />

            <Text style={styles.browseText}>
              Continue browsing
            </Text>
          </Pressable>

          {/* Footer */}
          <Text style={styles.footer}>
            Fast delivery • Fresh products • Simple shopping
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = {
  container: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 30,
  },

  backButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7,
    paddingVertical: 8,
    alignSelf: "flex-start" as const,
  },

  backText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700" as const,
  },

  brandContainer: {
    alignItems: "center" as const,
    marginTop: 25,
    marginBottom: 28,
  },

  logo: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: palette.accent,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 12,
    shadowColor: palette.accent,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  brand: {
    color: palette.text,
    fontSize: 28,
    fontWeight: "900" as const,
    letterSpacing: -0.5,
  },

  subtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 5,
    textAlign: "center" as const,
  },

  card: {
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 20,
    padding: 18,
  },

  title: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "900" as const,
  },

  description: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },

  inputGroup: {
    marginBottom: 15,
  },

  label: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800" as const,
    marginBottom: 7,
  },

  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "#10151c",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 13,
    minHeight: 52,
    paddingHorizontal: 13,
  },

  inputIcon: {
    marginRight: 9,
  },

  input: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    paddingVertical: 13,
  },

  errorBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "rgba(220, 20, 60, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(220, 20, 60, 0.25)",
    borderRadius: 11,
    padding: 11,
    marginBottom: 14,
  },

  errorText: {
    flex: 1,
    color: "#ff817e",
    fontSize: 12,
    lineHeight: 17,
  },

  button: {
    minHeight: 52,
    backgroundColor: palette.accent,
    borderRadius: 13,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: 8,
    marginTop: 3,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  buttonText: {
    color: "#10151c",
    fontSize: 14,
    fontWeight: "900" as const,
  },

  registerBox: {
    alignItems: "center" as const,
    marginTop: 20,
  },

  registerText: {
    color: palette.muted,
    fontSize: 12,
  },

  registerLink: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "800" as const,
    marginTop: 5,
  },

  browseButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 7,
    paddingVertical: 17,
  },

  browseText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700" as const,
  },

  footer: {
    color: "#667180",
    fontSize: 10,
    textAlign: "center" as const,
    marginTop: 5,
  },
};
