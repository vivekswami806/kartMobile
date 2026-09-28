import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";
import type { Order } from "@/types";
import {
  Loading,
  Message,
  Page,
  palette,
} from "@/components/ui";

export default function OrdersScreen() {
  const { user, isReady } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");

    api
      .orders()
      .then((data) => setOrders(data.orders))
      .catch((e) =>
        setError(e.message || "Could not load orders")
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isReady && user) {
      load();
    } else if (isReady && !user) {
      setLoading(false);
    }
  }, [isReady, user, load]);

  if (!isReady) {
    return (
      <Page title="">
        <Loading />
      </Page>
    );
  }

  if (!user) {
    return (
      <Page title="">
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="receipt-outline"
              size={34}
              color={palette.accent}
            />
          </View>

          <Text style={styles.emptyTitle}>
            Your orders are waiting
          </Text>

          <Text style={styles.emptyText}>
            Sign in to view your past orders and track
            your deliveries.
          </Text>

          <Pressable
            onPress={() => router.push("/auth/login")}
            style={styles.primaryButton}
          >
            <Ionicons
              name="log-in-outline"
              size={18}
              color="#1a1412"
            />

            <Text style={styles.primaryButtonText}>
              Sign in
            </Text>
          </Pressable>
        </View>
      </Page>
    );
  }

  return (
    <Page title="">
      {loading ? (
        <Loading />
      ) : error ? (
        <Message
          text={error}
          onRetry={load}
        />
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIcon}>
            <Ionicons
              name="bag-handle-outline"
              size={36}
              color={palette.accent}
            />
          </View>

          <Text style={styles.emptyTitle}>
            No orders yet
          </Text>

          <Text style={styles.emptyText}>
            Once you place an order, you'll be able to
            track it and view your order history here.
          </Text>

          <Pressable
            onPress={() => router.push("/(tabs)")}
            style={styles.primaryButton}
          >
            <Ionicons
              name="bag-outline"
              size={18}
              color="#1a1412"
            />

            <Text style={styles.primaryButtonText}>
              Start shopping
            </Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <OrderCard order={item} />
          )}
        />
      )}
    </Page>
  );
}

function OrderCard({ order }: { order: Order }) {
  const statusColor = getOrderStatusColor(order.status);
  const statusLabel = getOrderStatusLabel(order.status);

  const itemCount =
    order.items?.reduce(
      (sum, item) => sum + item.quantity,
      0
    ) || 0;

  const statusIcon = getStatusIcon(order.status);

  return (
    <Pressable
      onPress={() =>
        router.push(`/order/${order.id}`)
      }
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      {/* TOP */}
      <View style={styles.cardTop}>
        <View style={styles.orderIcon}>
          <Ionicons
            name="receipt-outline"
            size={21}
            color={palette.accent}
          />
        </View>

        <View style={styles.orderInfo}>
          <Text style={styles.orderNumber}>
            #{order.order_number}
          </Text>

          <Text style={styles.date}>
            {formatDate(order.created_at)}
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: `${statusColor}18`,
              borderColor: `${statusColor}40`,
            },
          ]}
        >
          <Ionicons
            name={statusIcon}
            size={12}
            color={statusColor}
          />

          <Text
            style={[
              styles.statusText,
              { color: statusColor },
            ]}
          >
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* ORDER INFO */}
      <View style={styles.infoGrid}>
        <InfoItem
          icon="bag-outline"
          label="Items"
          value={`${itemCount}`}
        />

        <InfoItem
          icon={
            order.payment_method === "COD"
              ? "cash-outline"
              : "card-outline"
          }
          label="Payment"
          value={
            order.payment_method === "COD"
              ? "Cash"
              : "Online"
          }
        />

        <InfoItem
          icon="wallet-outline"
          label="Total"
          value={formatCurrency(order.grand_total)}
          accent
        />
      </View>

      {/* ITEMS PREVIEW */}
      {order.items?.length ? (
        <View style={styles.itemsPreview}>
          {order.items.slice(0, 2).map((item, index) => (
            <View
              key={
                item.id ||
                `${item.product_id}-${index}`
              }
              style={styles.previewRow}
            >
              <View style={styles.previewDot}>
                <Ionicons
                  name="cube-outline"
                  size={13}
                  color={palette.muted}
                />
              </View>

              <Text
                style={styles.previewName}
                numberOfLines={1}
              >
                {item.product_name}
              </Text>

              <Text style={styles.previewQty}>
                × {item.quantity}
              </Text>
            </View>
          ))}

          {order.items.length > 2 && (
            <Text style={styles.moreItems}>
              + {order.items.length - 2} more items
            </Text>
          )}
        </View>
      ) : null}

      {/* FOOTER */}
      <View style={styles.cardFooter}>
        <Text style={styles.viewDetails}>
          View order details
        </Text>

        <View style={styles.arrow}>
          <Ionicons
            name="chevron-forward"
            size={17}
            color={palette.accent}
          />
        </View>
      </View>
    </Pressable>
  );
}

function InfoItem({
  icon,
  label,
  value,
  accent = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.infoItem}>
      <Ionicons
        name={icon}
        size={16}
        color={accent ? palette.accent : palette.muted}
      />

      <Text style={styles.infoLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.infoValue,
          accent && { color: palette.accent },
        ]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

function getStatusIcon(
  status: string
): keyof typeof Ionicons.glyphMap {
  switch (status) {
    case "delivered":
      return "checkmark-circle";

    case "out_for_delivery":
      return "bicycle";

    case "preparing":
      return "restaurant";

    case "cancelled":
      return "close-circle";

    case "confirmed":
      return "checkmark-circle-outline";

    default:
      return "time-outline";
  }
}

const styles = StyleSheet.create({
  list: {
    paddingTop: 6,
    paddingBottom: 25,
  },

  card: {
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
  },

  cardPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },

  cardTop: {
    flexDirection: "row",
    alignItems: "center",
  },

  orderIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#10151c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  orderInfo: {
    flex: 1,
  },

  orderNumber: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900",
  },

  date: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 4,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "900",
  },

  divider: {
    height: 1,
    backgroundColor: "#303a46",
    marginVertical: 13,
  },

  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  infoItem: {
    flex: 1,
    alignItems: "flex-start",
  },

  infoLabel: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 4,
    textTransform: "uppercase",
    fontWeight: "700",
  },

  infoValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2,
  },

  itemsPreview: {
    backgroundColor: "#10151c",
    borderRadius: 12,
    padding: 10,
    marginTop: 13,
  },

  previewRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 3,
  },

  previewDot: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#1a222d",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },

  previewName: {
    flex: 1,
    color: palette.text,
    fontSize: 11,
    fontWeight: "600",
  },

  previewQty: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700",
    marginLeft: 6,
  },

  moreItems: {
    color: palette.accent,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 6,
    marginLeft: 34,
  },

  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 13,
  },

  viewDetails: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "900",
  },

  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#10151c",
    alignItems: "center",
    justifyContent: "center",
  },

  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "900",
    textAlign: "center",
  },

  emptyText: {
    color: palette.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 300,
  },

  primaryButton: {
    marginTop: 20,
    backgroundColor: palette.accent,
    borderRadius: 13,
    paddingHorizontal: 22,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  primaryButtonText: {
    color: "#1a1412",
    fontSize: 13,
    fontWeight: "900",
  },
});
