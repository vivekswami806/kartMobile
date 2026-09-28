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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || password.length < 6) { return }
    setBusy(true);
    setError("");

    try {
      await authActions.register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
      });

      router.replace("/(tabs)");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Account creation failed. Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const disabled =
    busy ||
    !name.trim() ||
    !email.trim() ||
    !phone.trim() ||
    password.length < 6;

  return (
    <Page title="">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
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

          {/* Register Card */}
          <View style={styles.card}>
            <View style={styles.headingContainer}>
              <Text style={styles.title}>
                Create your account
              </Text>

              <Text style={styles.description}>
                Join Krikart and start shopping in just a few seconds.
              </Text>
            </View>

            {/* Full name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full name</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={palette.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your full name"
                  placeholderTextColor={palette.muted}
                  autoCapitalize="words"
                  autoCorrect={false}
                  style={styles.input}
                  editable={!busy}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email address</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
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
                  placeholder="Enter your email"
                  placeholderTextColor={palette.muted}
                  style={styles.input}
                  editable={!busy}
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone number</Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="call-outline"
                  size={19}
                  color={palette.muted}
                  style={styles.inputIcon}
                />

                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="Enter your phone number"
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
                  placeholder="Create a password"
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

              <Text style={styles.passwordHint}>
                Password must contain at least 6 characters.
              </Text>
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

            {/* Create account */}
            <Pressable
              // disabled={disabled}
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
                    Create account
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#10151c"
                  />
                </>
              )}
            </Pressable>

            {/* Login */}
            <View style={styles.loginBox}>
              <Text style={styles.loginText}>
                Already have an account?
              </Text>

              <Link
                href="/auth/login"
                style={styles.loginLink}
              >
                Sign in
              </Link>
            </View>
          </View>

          {/* Browse */}
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
    marginTop: 20,
    marginBottom: 25,
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
    shadowOffset: {
      width: 0,
      height: 5,
    },

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

  headingContainer: {
    marginBottom: 21,
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
    marginBottom: 14,
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

  passwordHint: {
    color: "#667180",
    fontSize: 10,
    marginTop: 6,
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

  loginBox: {
    alignItems: "center" as const,
    marginTop: 19,
  },

  loginText: {
    color: palette.muted,
    fontSize: 12,
  },

  loginLink: {
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
    marginTop: 4,
  },
};
