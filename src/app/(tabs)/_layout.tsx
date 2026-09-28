import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCartStore } from "@/lib/cartStore";

export default function TabsLayout() {
  const cart = useCartStore();
  const count = cart.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  return (
    <Tabs
      screenOptions={{
        // Hide the "Shop" header at the top
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#10151c",
          borderTopColor: "#303a46",
        },

        tabBarActiveTintColor: "#ff7948",
        tabBarInactiveTintColor: "#9aa4b2",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Shop",
          tabBarLabel: "Shop",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="storefront-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="search-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="categories"
        options={{
          title: "Categories",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="grid-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarBadge: count || undefined,
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="cart-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="receipt-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="person-outline"
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
