import { Pressable, ScrollView, Text, View } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { authActions, useAuthStore } from "@/lib/authStore";
import { Page, palette } from "@/components/ui";

export default function AccountScreen() {
  const { user, isReady } = useAuthStore();

  if (!isReady) {
    return <Page title="" />;
  }

  if (!user) {
    return (
      <Page title="">
        <View style={styles.guestContainer}>
          {/* Guest icon */}
          <View style={styles.guestIcon}>
            <Ionicons
              name="person-outline"
              size={38}
              color={palette.accent}
            />
          </View>

          <Text style={styles.guestTitle}>
            Welcome to Krikart
          </Text>

          <Text style={styles.guestText}>
            Sign in to manage your account, addresses and orders.
          </Text>

          <Pressable
            onPress={() => router.push("/auth/login")}
            style={styles.primaryButton}
          >
            <Ionicons
              name="log-in-outline"
              size={19}
              color="#111827"
            />

            <Text style={styles.primaryButtonText}>
              Sign in
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/auth/register")}
            style={styles.createButton}
          >
            <Text style={styles.createButtonText}>
              Create an account
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color={palette.accent}
            />
          </Pressable>
        </View>
      </Page>
    );
  }

  return (
    <Page title="">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 30,
        }}
      >
        {/* Profile Header */}
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={styles.name}
              >
                {user.name}
              </Text>

              <Text
                numberOfLines={1}
                style={styles.email}
              >
                {user.email}
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/addresses")}
              style={styles.editButton}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={palette.accent}
              />
            </Pressable>
          </View>

          {/* Contact information */}
          <View style={styles.divider} />

          <View style={styles.contactRow}>
            <Ionicons
              name="mail-outline"
              size={17}
              color={palette.muted}
            />

            <Text
              numberOfLines={1}
              style={styles.contactText}
            >
              {user.email}
            </Text>
          </View>

          {user.phone ? (
            <View style={styles.contactRow}>
              <Ionicons
                name="call-outline"
                size={17}
                color={palette.muted}
              />

              <Text style={styles.contactText}>
                {user.phone}
              </Text>
            </View>
          ) : null}

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={13}
              color={palette.accent}
            />

            <Text style={styles.roleText}>
              {user.role.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Account section */}
        <Text style={styles.sectionTitle}>
          My account
        </Text>

        <View style={styles.menuCard}>
          <AccountItem
            icon="location-outline"
            title="Delivery addresses"
            subtitle="Manage your saved addresses"
            onPress={() => router.push("/addresses")}
          />

          <AccountItem
            icon="receipt-outline"
            title="My orders"
            subtitle="View your order history"
            onPress={() => router.push("/(tabs)/orders")}
          />

          <AccountItem
            icon="cart-outline"
            title="My cart"
            subtitle="View items waiting in your cart"
            onPress={() => router.push("/(tabs)/cart")}
          />
        </View>

        {/* Support */}
        <Text style={styles.sectionTitle}>
          Support
        </Text>

        <View style={styles.menuCard}>
          <AccountItem
            icon="help-circle-outline"
            title="Help & support"
            subtitle="Get help with your orders"
            onPress={() => {}}
          />

          <AccountItem
            icon="information-circle-outline"
            title="About Krikart"
            subtitle="Learn more about Krikart"
            onPress={() => {}}
          />
        </View>

        {/* Logout */}
        <Pressable
          onPress={() => {
            void authActions.logout();
            router.replace("/(tabs)");
          }}
          style={styles.logoutButton}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              name="log-out-outline"
              size={19}
              color="#EF4444"
            />
          </View>

          <Text style={styles.logoutText}>
            Sign out
          </Text>
        </Pressable>

        <Text style={styles.version}>
          Krikart · Your everyday delivery partner
        </Text>
      </ScrollView>
    </Page>
  );
}

type AccountItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
};

function AccountItem({
  icon,
  title,
  subtitle,
  onPress,
}: AccountItemProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.menuItem,
        pressed && {
          opacity: 0.7,
          backgroundColor: "#202A38",
        },
      ]}
    >
      <View style={styles.menuIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={palette.accent}
        />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>
          {title}
        </Text>

        <Text style={styles.menuSubtitle}>
          {subtitle}
        </Text>
      </View>

      <Ionicons
        name="chevron-forward"
        size={18}
        color={palette.muted}
      />
    </Pressable>
  );
}

const styles = {
  profileCard: {
    backgroundColor: "#1a222d",
    borderColor: "#303a46",
    borderWidth: 1,
    borderRadius: 20,
    padding: 17,
    marginBottom: 24,
  },

  profileTop: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: palette.accent,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  avatarText: {
    color: "#111827",
    fontSize: 23,
    fontWeight: "900" as const,
  },

  hello: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700" as const,
  },

  name: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "900" as const,
    marginTop: 1,
  },

  email: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 2,
  },

  editButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#10151c",
    borderWidth: 1,
    borderColor: "#303a46",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  divider: {
    height: 1,
    backgroundColor: "#303a46",
    marginVertical: 14,
  },

  contactRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 9,
    marginBottom: 8,
  },

  contactText: {
    color: palette.muted,
    fontSize: 12,
    flex: 1,
  },

  roleBadge: {
    alignSelf: "flex-start" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    backgroundColor: `${palette.accent}18`,
    borderWidth: 1,
    borderColor: `${palette.accent}40`,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 4,
  },

  roleText: {
    color: palette.accent,
    fontSize: 10,
    fontWeight: "800" as const,
    textTransform: "capitalize" as const,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "900" as const,
    marginBottom: 10,
  },

  menuCard: {
    backgroundColor: "#1a222d",
    borderColor: "#303a46",
    borderWidth: 1,
    borderRadius: 18,
    overflow: "hidden" as const,
    marginBottom: 22,
  },

  menuItem: {
    minHeight: 72,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 13,
    paddingVertical: 11,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#303a46",
  },

  menuIcon: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: `${palette.accent}15`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  menuTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "800" as const,
  },

  menuSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },

  logoutButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#EF444412",
    borderWidth: 1,
    borderColor: "#EF444440",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 9,
    marginTop: 2,
  },

  logoutIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EF444420",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  logoutText: {
    color: "#EF4444",
    fontSize: 14,
    fontWeight: "900" as const,
  },

  version: {
    textAlign: "center" as const,
    color: palette.muted,
    fontSize: 10,
    marginTop: 18,
    marginBottom: 10,
  },

  guestContainer: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingHorizontal: 25,
  },

  guestIcon: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: `${palette.accent}18`,
    borderWidth: 1,
    borderColor: `${palette.accent}40`,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 18,
  },

  guestTitle: {
    color: palette.text,
    fontSize: 22,
    fontWeight: "900" as const,
    textAlign: "center" as const,
  },

  guestText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center" as const,
    marginTop: 8,
    marginBottom: 22,
  },

  primaryButton: {
    width: "100%" as const,
    height: 52,
    backgroundColor: palette.accent,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    flexDirection: "row" as const,
    gap: 8,
  },

  primaryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "900" as const,
  },

  createButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 5,
    padding: 15,
  },

  createButtonText: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "800" as const,
  },
};
