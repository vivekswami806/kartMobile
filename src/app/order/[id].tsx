import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { api } from "@/lib/api";
import {
  formatCurrency,
  formatDate,
  getOrderStatusColor,
  getOrderStatusLabel,
} from "@/lib/utils";
import type { Order } from "@/types";
import { Page, palette } from "@/components/ui";

export default function OrderDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    api
      .order(id)
      .then((data) => setOrder(data.order))
      .catch((e) =>
        setError(e.message || "Could not load order")
      );
  }, [id]);

  if (!order && !error) {
    return (
      <Page title="">
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Loading your order...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="">
        <View style={styles.errorCard}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color="#ff817e"
          />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </Page>
    );
  }

  if (!order) return null;

  const statusColor = getOrderStatusColor(order.status);
  const statusLabel = getOrderStatusLabel(order.status);

  const itemCount =
    order.items?.reduce(
      (sum, item) => sum + item.quantity,
      0
    ) || 0;

  return (
    <Page title="">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* STATUS HEADER */}
        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIcon,
              { backgroundColor: `${statusColor}20` },
            ]}
          >
            <Ionicons
              name={getStatusIcon(order.status)}
              size={30}
              color={statusColor}
            />
          </View>

          <Text style={styles.statusTitle}>
            {statusLabel}
          </Text>

          <Text style={styles.orderNumber}>
            Order #{order.order_number}
          </Text>

          <Text style={styles.date}>
            Placed on {formatDate(order.created_at)}
          </Text>
        </View>

        {/* ORDER PROGRESS */}
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>
            Order status
          </Text>

          <StatusStep
            icon="checkmark-circle"
            title="Order placed"
            active
            color={statusColor}
          />

          <StatusStep
            icon="restaurant-outline"
            title="Preparing your order"
            active={isStatusAtLeast(order.status, "preparing")}
            color={statusColor}
          />

          <StatusStep
            icon="bicycle-outline"
            title="Out for delivery"
            active={isStatusAtLeast(order.status, "out_for_delivery")}
            color={statusColor}
          />

          <StatusStep
            icon="home-outline"
            title="Delivered"
            active={isStatusAtLeast(order.status, "delivered")}
            color={statusColor}
            last
          />
        </View>

        {/* ITEMS */}
        <View style={styles.panel}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Your items
            </Text>

            <View style={styles.countBadge}>
              <Text style={styles.countText}>
                {itemCount} items
              </Text>
            </View>
          </View>

          {order.items?.map((item, index) => (
            <View
              key={item.id || `${item.product_id}-${index}`}
              style={styles.itemRow}
            >
              <View style={styles.itemIcon}>
                <Ionicons
                  name="cube-outline"
                  size={20}
                  color={palette.accent}
                />
              </View>

              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {item.product_name}
                </Text>

                <Text style={styles.itemQuantity}>
                  Quantity × {item.quantity}
                </Text>
              </View>

              <Text style={styles.itemPrice}>
                {formatCurrency(item.total_price)}
              </Text>
            </View>
          ))}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total amount
            </Text>

            <Text style={styles.totalValue}>
              {formatCurrency(order.grand_total)}
            </Text>
          </View>
        </View>

        {/* PAYMENT */}
        <View style={styles.panel}>
          <Text style={styles.sectionTitle}>
            Payment
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name={
                  order.payment_method === "COD"
                    ? "cash-outline"
                    : "card-outline"
                }
                size={19}
                color={palette.accent}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Payment method
              </Text>

              <Text style={styles.infoValue}>
                {order.payment_method === "COD"
                  ? "Cash on delivery"
                  : "Razorpay / Online payment"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-checkmark-outline"
                size={19}
                color="#34D399"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Payment status
              </Text>

              <Text
                style={[
                  styles.infoValue,
                  {
                    color:
                      order.payment_status === "paid"
                        ? "#34D399"
                        : palette.text,
                  },
                ]}
              >
                {String(order.payment_status).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* DELIVERY NOTES */}
        {order.delivery_instructions ? (
          <View style={styles.panel}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Delivery instructions
              </Text>

              <Ionicons
                name="location-outline"
                size={20}
                color={palette.accent}
              />
            </View>

            <View style={styles.notesBox}>
              <Text style={styles.notesText}>
                {order.delivery_instructions}
              </Text>
            </View>
          </View>
        ) : null}

        {/* RIDER LOCATION */}
        {order.rider_location ? (
          <View style={styles.panel}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Delivery partner
                </Text>

                <Text style={styles.smallText}>
                  Current delivery location
                </Text>
              </View>

              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            </View>

            <View style={styles.locationBox}>
              <Ionicons
                name="navigate-outline"
                size={24}
                color="#34D399"
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.coordinateLabel}>
                  Latitude
                </Text>

                <Text style={styles.coordinate}>
                  {order.rider_location.latitude}
                </Text>

                <Text style={styles.coordinateLabel}>
                  Longitude
                </Text>

                <Text style={styles.coordinate}>
                  {order.rider_location.longitude}
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* BOTTOM SPACE */}
        <View style={{ height: 25 }} />
      </ScrollView>
    </Page>
  );
}

function StatusStep({
  icon,
  title,
  active,
  color,
  last = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  active: boolean;
  color: string;
  last?: boolean;
}) {
  return (
    <View style={styles.step}>
      <View style={styles.stepLeft}>
        <View
          style={[
            styles.stepIcon,
            active
              ? {
                  backgroundColor: `${color}20`,
                  borderColor: color,
                }
              : styles.stepInactive,
          ]}
        >
          <Ionicons
            name={icon}
            size={18}
            color={active ? color : palette.muted}
          />
        </View>

        {!last ? (
          <View
            style={[
              styles.stepLine,
              {
                backgroundColor: active
                  ? color
                  : palette.border,
              },
            ]}
          />
        ) : null}
      </View>

      <Text
        style={[
          styles.stepTitle,
          active && { color: palette.text },
        ]}
      >
        {title}
      </Text>
    </View>
  );
}

function isStatusAtLeast(
  status: string,
  target: string
) {
  const order = [
    "pending",
    "confirmed",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];

  const currentIndex = order.indexOf(status);
  const targetIndex = order.indexOf(target);

  return (
    currentIndex !== -1 &&
    targetIndex !== -1 &&
    currentIndex >= targetIndex
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
    default:
      return "time";
  }
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
  },

  loadingText: {
    color: palette.muted,
    marginTop: 12,
    fontSize: 13,
  },

  errorCard: {
    marginTop: 30,
    padding: 25,
    borderRadius: 18,
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
    alignItems: "center",
  },

  errorTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
    marginTop: 12,
  },

  errorText: {
    color: "#ff817e",
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
  },

  statusCard: {
    backgroundColor: "#1a222d",
    borderColor: "#303a46",
    borderWidth: 1,
    borderRadius: 20,
    padding: 22,
    marginTop: 8,
    alignItems: "center",
  },

  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  statusTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900",
  },

  orderNumber: {
    color: palette.accent,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },

  date: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 5,
  },

  panel: {
    backgroundColor: "#1a222d",
    borderColor: "#303a46",
    borderWidth: 1,
    borderRadius: 16,
    padding: 15,
    marginTop: 12,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "900",
  },

  smallText: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 3,
  },

  countBadge: {
    backgroundColor: "#10151c",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  countText: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "800",
  },

  step: {
    flexDirection: "row",
    minHeight: 58,
  },

  stepLeft: {
    width: 38,
    alignItems: "center",
  },

  stepIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  stepInactive: {
    backgroundColor: "#10151c",
    borderColor: "#303a46",
  },

  stepLine: {
    width: 2,
    flex: 1,
    marginVertical: 3,
    opacity: 0.6,
  },

  stepTitle: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 10,
    paddingTop: 8,
  },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },

  itemIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#10151c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  itemInfo: {
    flex: 1,
  },

  itemName: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },

  itemQuantity: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 3,
  },

  itemPrice: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: palette.border,
    marginVertical: 8,
  },

  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  totalLabel: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
  },

  totalValue: {
    color: palette.accent,
    fontSize: 18,
    fontWeight: "900",
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10151c",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },

  infoValue: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 3,
  },

  notesBox: {
    backgroundColor: "#10151c",
    borderRadius: 12,
    padding: 12,
    marginTop: 3,
  },

  notesText: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 19,
  },

  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#34D39920",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 20,
  },

  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#34D399",
    marginRight: 5,
  },

  liveText: {
    color: "#34D399",
    fontSize: 9,
    fontWeight: "900",
  },

  locationBox: {
    marginTop: 5,
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    backgroundColor: "#10151c",
    borderRadius: 12,
    padding: 14,
  },

  coordinateLabel: {
    color: palette.muted,
    fontSize: 9,
    textTransform: "uppercase",
    marginTop: 2,
  },

  coordinate: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 3,
  },
});
