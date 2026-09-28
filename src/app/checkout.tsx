import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import {
  cartActions,
  getCartSummary,
  useCartStore,
} from "@/lib/cartStore";

import type { Address } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Page, palette } from "@/components/ui";

type PaymentMethod = "COD" | "RAZORPAY";

export default function CheckoutScreen() {
  const { user, isReady } = useAuthStore();
  const lines = useCartStore();

  const [instructions, setInstructions] = useState("");
  const [tip, setTip] = useState("0");
  const [method, setMethod] = useState<PaymentMethod>("COD");
  const [razorpayConfigured, setRazorpayConfigured] = useState(false);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .health()
      .then(({ razorpay_configured }) =>
        setRazorpayConfigured(razorpay_configured)
      )
      .catch(() => setRazorpayConfigured(false));
  }, []);

  useEffect(() => {
    if (!user) return;

    api
      .addresses()
      .then(({ addresses: saved }) => {
        setAddresses(saved);

        setAddressId(
          (current) =>
            current ||
            saved.find((address) => address.is_default)?.id ||
            saved[0]?.id ||
            null
        );
      })
      .catch(() => setAddresses([]));
  }, [user]);

  const placeOrder = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (!lines.length) return;

    setBusy(true);
    setError("");

    try {
      const result = await api.checkout({
        items: lines.map(({ product, quantity }) => ({
          product_id: product.id,
          qty: quantity,
        })),
        payment_method: method,
        address_id: addressId,
        tip: Math.max(0, Number(tip) || 0),
        delivery_instructions: instructions.trim(),
      });

      if (method === "RAZORPAY") {
        if (!result.razorpay) {
          throw new Error(
            "The backend did not return Razorpay checkout details."
          );
        }

        const { default: RazorpayCheckout } = await import(
          "react-native-razorpay"
        );

        const payment = await RazorpayCheckout.open({
          key: result.razorpay.key_id,
          amount: String(result.grand_total_paise),
          currency: "INR",
          name: "Krikart",
          description: `Order ${result.order_number}`,
          order_id: result.razorpay.order_id,
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone,
          },
          theme: {
            color: palette.accent,
          },
        });

        await api.verifyPayment({
          razorpay_order_id:
            payment.razorpay_order_id || result.razorpay.order_id,
          razorpay_payment_id: payment.razorpay_payment_id,
          razorpay_signature: payment.razorpay_signature,
        });
      }

      cartActions.clear();

      router.replace(`/order/${result.order_id}?placed=1`);
    } catch (e) {
      const paymentError = e as {
        description?: string;
        message?: string;
      };

      setError(
        paymentError.description ||
          paymentError.message ||
          "Could not complete checkout"
      );
    } finally {
      setBusy(false);
    }
  };

  const subtotal = getCartSummary().subtotal;
  const itemCount = lines.reduce(
    (sum, line) => sum + line.quantity,
    0
  );

  const selectedAddress = addresses.find(
    (address) => address.id === addressId
  );

  return (
    <Page title="">
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Complete your order</Text>
            <Text style={styles.subtitle}>
              Almost there! Confirm your delivery details.
            </Text>
          </View>

          <View style={styles.secureBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={15}
              color="#6ee7b7"
            />
            <Text style={styles.secureText}>Secure</Text>
          </View>
        </View>

        {!isReady && (
          <ActivityIndicator
            color={palette.accent}
            style={{ marginVertical: 12 }}
          />
        )}

        {/* Delivery Address */}
        <Section
          icon="location-outline"
          title="Delivery address"
          action={
            <Pressable onPress={() => router.push("/addresses")}>
              <Text style={styles.changeText}>
                {addresses.length ? "Manage" : "Add"}
              </Text>
            </Pressable>
          }
        >
          {addresses.length ? (
            <View style={styles.addressList}>
              {addresses.map((address) => {
                const selected = address.id === addressId;

                return (
                  <Pressable
                    key={address.id}
                    onPress={() => setAddressId(address.id)}
                    style={[
                      styles.addressCard,
                      selected && styles.selectedCard,
                    ]}
                  >
                    <View
                      style={[
                        styles.radio,
                        selected && styles.radioSelected,
                      ]}
                    >
                      {selected && (
                        <View style={styles.radioDot} />
                      )}
                    </View>

                    <View style={styles.addressContent}>
                      <View style={styles.addressTitleRow}>
                        <Text style={styles.addressLabel}>
                          {address.label}
                        </Text>

                        {address.is_default && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultText}>
                              DEFAULT
                            </Text>
                          </View>
                        )}
                      </View>

                      <Text style={styles.addressText}>
                        {address.line1}
                        {address.street
                          ? `, ${address.street}`
                          : ""}
                      </Text>

                      <Text style={styles.addressText}>
                        {address.city} · {address.pincode}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <Pressable
              onPress={() => router.push("/addresses")}
              style={styles.addAddress}
            >
              <View style={styles.addIcon}>
                <Ionicons
                  name="add"
                  size={22}
                  color={palette.accent}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.addAddressTitle}>
                  Add delivery address
                </Text>
                <Text style={styles.addAddressSubtitle}>
                  Choose where you want your order delivered
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={palette.muted}
              />
            </Pressable>
          )}

          <View style={styles.inputWrapper}>
            <Ionicons
              name="create-outline"
              size={17}
              color={palette.muted}
            />

            <TextInput
              value={instructions}
              onChangeText={setInstructions}
              multiline
              placeholder="Delivery instructions (optional)"
              placeholderTextColor={palette.muted}
              style={styles.instructionsInput}
            />
          </View>
        </Section>

        {/* Payment */}
        <Section
          icon="card-outline"
          title="Payment method"
        >
          <PaymentOption
            icon="cash-outline"
            title="Cash on delivery"
            subtitle="Pay when your order arrives"
            selected={method === "COD"}
            onPress={() => setMethod("COD")}
          />

          {razorpayConfigured && Platform.OS !== "web" ? (
            <PaymentOption
              icon="phone-portrait-outline"
              title="Online payment"
              subtitle="UPI · Cards · Net Banking"
              selected={method === "RAZORPAY"}
              onPress={() => setMethod("RAZORPAY")}
              badge="Razorpay"
            />
          ) : (
            <View style={styles.disabledPayment}>
              <Ionicons
                name="lock-closed-outline"
                size={18}
                color={palette.muted}
              />

              <View style={{ flex: 1 }}>
                <Text style={styles.disabledTitle}>
                  Online payment unavailable
                </Text>
                <Text style={styles.disabledText}>
                  Online payments will appear when Razorpay is configured.
                </Text>
              </View>
            </View>
          )}
        </Section>

        {/* Tip */}
        <Section
          icon="heart-outline"
          title="Add a tip"
          subtitle="Optional"
        >
          <View style={styles.tipRow}>
            {["0", "10", "20", "50"].map((value) => {
              const selected = tip === value;

              return (
                <Pressable
                  key={value}
                  onPress={() => setTip(value)}
                  style={[
                    styles.tipButton,
                    selected && styles.tipButtonSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.tipText,
                      selected && styles.tipTextSelected,
                    ]}
                  >
                    {value === "0" ? "No tip" : `₹${value}`}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <TextInput
            value={tip}
            onChangeText={setTip}
            keyboardType="decimal-pad"
            placeholder="Custom tip"
            placeholderTextColor={palette.muted}
            style={styles.input}
          />
        </Section>

        {/* Order Summary */}
        <Section
          icon="receipt-outline"
          title="Order summary"
        >
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Items ({itemCount})
            </Text>

            <Text style={styles.summaryValue}>
              {formatCurrency(subtotal)}
            </Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery fee</Text>
            <Text style={styles.serverText}>Calculated at checkout</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Handling fee</Text>
            <Text style={styles.serverText}>Calculated at checkout</Text>
          </View>

          {Number(tip) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tip</Text>

              <Text style={styles.summaryValue}>
                {formatCurrency(Number(tip))}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total payable</Text>
              <Text style={styles.totalHint}>
                Final amount confirmed by server
              </Text>
            </View>

            <Text style={styles.totalAmount}>
              {formatCurrency(
                subtotal + Math.max(0, Number(tip) || 0)
              )}
            </Text>
          </View>
        </Section>

        {/* Error */}
        {!!error && (
          <View style={styles.errorBox}>
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color="#ff817e"
            />

            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Checkout Button */}
        <Pressable
          disabled={
            busy ||
            !user ||
            !lines.length ||
            (method === "RAZORPAY" && !razorpayConfigured)
          }
          onPress={() => void placeOrder()}
          style={({ pressed }) => [
            styles.checkoutButton,
            {
              opacity:
                busy ||
                !user ||
                !lines.length ||
                (method === "RAZORPAY" &&
                  !razorpayConfigured)
                  ? 0.55
                  : pressed
                  ? 0.85
                  : 1,
            },
          ]}
        >
          {busy ? (
            <ActivityIndicator color="#1a1412" />
          ) : (
            <>
              <Ionicons
                name={
                  method === "COD"
                    ? "bag-check-outline"
                    : "lock-closed-outline"
                }
                size={20}
                color="#1a1412"
              />

              <Text style={styles.checkoutText}>
                {method === "COD"
                  ? "Place order"
                  : "Pay securely"}
              </Text>

              <Text style={styles.checkoutAmount}>
                {formatCurrency(
                  subtotal + Math.max(0, Number(tip) || 0)
                )}
              </Text>
            </>
          )}
        </Pressable>

        {!user && isReady && (
          <Pressable
            onPress={() => router.push("/auth/login")}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>
              Sign in to continue
            </Text>
          </Pressable>
        )}

        <View style={styles.bottomNote}>
          <Ionicons
            name="shield-checkmark-outline"
            size={14}
            color={palette.muted}
          />

          <Text style={styles.bottomNoteText}>
            Your payment and personal information are protected.
          </Text>
        </View>
      </ScrollView>
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* Components */
/* -------------------------------------------------------------------------- */

function Section({
  icon,
  title,
  subtitle,
  action,
  children,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Ionicons
            name={icon}
            size={18}
            color={palette.accent}
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>

          {subtitle && (
            <Text style={styles.sectionSubtitle}>
              {subtitle}
            </Text>
          )}
        </View>

        {action}
      </View>

      {children}
    </View>
  );
}

function PaymentOption({
  icon,
  title,
  subtitle,
  selected,
  onPress,
  badge,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  badge?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.paymentCard,
        selected && styles.selectedCard,
      ]}
    >
      <View style={styles.paymentIcon}>
        <Ionicons
          name={icon}
          size={21}
          color={selected ? palette.accent : palette.muted}
        />
      </View>

      <View style={{ flex: 1 }}>
        <View style={styles.paymentTitleRow}>
          <Text style={styles.paymentTitle}>{title}</Text>

          {badge && (
            <View style={styles.paymentBadge}>
              <Text style={styles.paymentBadgeText}>
                {badge}
              </Text>
            </View>
          )}
        </View>

        <Text style={styles.paymentSubtitle}>
          {subtitle}
        </Text>
      </View>

      <View
        style={[
          styles.radio,
          selected && styles.radioSelected,
        ]}
      >
        {selected && <View style={styles.radioDot} />}
      </View>
    </Pressable>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles */
/* -------------------------------------------------------------------------- */

const styles = {
  container: {
    paddingBottom: 35,
  },

  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },

  title: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "900" as const,
  },

  subtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 3,
  },

  secureBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 4,
    backgroundColor: "rgba(16,185,129,0.10)",
    borderWidth: 1,
    borderColor: "rgba(16,185,129,0.25)",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 20,
  },

  secureText: {
    color: "#6ee7b7",
    fontSize: 10,
    fontWeight: "800" as const,
  },

  section: {
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 17,
    padding: 14,
    marginTop: 13,
  },

  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginBottom: 12,
  },

  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: "rgba(255,121,72,0.10)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "900" as const,
  },

  sectionSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  changeText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "800" as const,
  },

  addressList: {
    gap: 8,
  },

  addressCard: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 10,
    backgroundColor: "#10151c",
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#303a46",
    padding: 12,
  },

  selectedCard: {
    borderColor: palette.accent,
    backgroundColor: "rgba(255,121,72,0.06)",
  },

  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#596575",
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 1,
  },

  radioSelected: {
    borderColor: palette.accent,
  },

  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: palette.accent,
  },

  addressContent: {
    flex: 1,
  },

  addressTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7,
    marginBottom: 4,
  },

  addressLabel: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800" as const,
  },

  defaultBadge: {
    backgroundColor: "rgba(255,121,72,0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },

  defaultText: {
    color: palette.accent,
    fontSize: 8,
    fontWeight: "900" as const,
  },

  addressText: {
    color: palette.muted,
    fontSize: 11,
    lineHeight: 17,
  },

  addAddress: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: "#10151c",
    borderWidth: 1,
    borderColor: "#303a46",
    borderStyle: "dashed" as const,
    borderRadius: 13,
    padding: 13,
  },

  addIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,121,72,0.10)",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  addAddressTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800" as const,
  },

  addAddressSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 2,
  },

  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "flex-start" as const,
    gap: 8,
    backgroundColor: "#10151c",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 11,
    paddingHorizontal: 11,
    marginTop: 9,
  },

  instructionsInput: {
    flex: 1,
    color: palette.text,
    fontSize: 12,
    minHeight: 58,
    textAlignVertical: "top" as const,
    paddingVertical: 10,
  },

  paymentCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: "#10151c",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 13,
    padding: 12,
    marginBottom: 8,
  },

  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 11,
    backgroundColor: "#1a222d",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },

  paymentTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 7,
  },

  paymentTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800" as const,
  },

  paymentSubtitle: {
    color: palette.muted,
    fontSize: 10,
    marginTop: 3,
  },

  paymentBadge: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 5,
  },

  paymentBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "800" as const,
  },

  disabledPayment: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    backgroundColor: "#10151c",
    borderRadius: 12,
    padding: 12,
    opacity: 0.7,
  },

  disabledTitle: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700" as const,
  },

  disabledText: {
    color: palette.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },

  tipRow: {
    flexDirection: "row" as const,
    gap: 8,
    marginBottom: 10,
  },

  tipButton: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#10151c",
    borderWidth: 1,
    borderColor: "#303a46",
    borderRadius: 10,
    paddingVertical: 10,
  },

  tipButtonSelected: {
    borderColor: palette.accent,
    backgroundColor: "rgba(255,121,72,0.08)",
  },

  tipText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: "700" as const,
  },

  tipTextSelected: {
    color: palette.accent,
  },

  input: {
    color: palette.text,
    backgroundColor: "#10151c",
    borderColor: "#303a46",
    borderWidth: 1,
    borderRadius: 10,
    padding: 11,
    fontSize: 13,
  },

  summaryRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 10,
  },

  summaryLabel: {
    color: palette.muted,
    fontSize: 12,
  },

  summaryValue: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700" as const,
  },

  serverText: {
    color: "#7f8a99",
    fontSize: 10,
  },

  divider: {
    height: 1,
    backgroundColor: "#303a46",
    marginVertical: 5,
  },

  totalRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingTop: 4,
  },

  totalLabel: {
    color: palette.text,
    fontSize: 14,
    fontWeight: "900" as const,
  },

  totalHint: {
    color: palette.muted,
    fontSize: 9,
    marginTop: 2,
  },

  totalAmount: {
    color: palette.accent,
    fontSize: 19,
    fontWeight: "900" as const,
  },

  errorBox: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    backgroundColor: "rgba(255,80,80,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,80,80,0.25)",
    borderRadius: 11,
    padding: 11,
    marginTop: 12,
  },

  errorText: {
    flex: 1,
    color: "#ff817e",
    fontSize: 11,
    lineHeight: 16,
  },

  checkoutButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    backgroundColor: palette.accent,
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 16,
  },

  checkoutText: {
    color: "#1a1412",
    fontSize: 14,
    fontWeight: "900" as const,
  },

  checkoutAmount: {
    color: "#1a1412",
    fontSize: 13,
    fontWeight: "900" as const,
    marginLeft: 3,
  },

  loginButton: {
    alignItems: "center" as const,
    padding: 14,
  },

  loginText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "800" as const,
  },

  bottomNote: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 5,
    marginTop: 3,
  },

  bottomNoteText: {
    color: palette.muted,
    fontSize: 9,
  },
};
