import { useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import {
  cartActions,
  getCartSummary,
  useCartStore,
} from "@/lib/cartStore";

import { formatCurrency } from "@/lib/utils";
import { CartTotals, Page, palette } from "@/components/ui";

export default function CartScreen() {
  const lines = useCartStore();

  const summary = useMemo(() => getCartSummary(), [lines]);

  const totalItems = lines.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <Page
      title=""
      action={
        lines.length > 0 ? (
          <View style={styles.countBadge}>
            <Ionicons
              name="cart-outline"
              size={14}
              color={palette.accent}
            />
            <Text style={styles.countText}>
              {totalItems}
            </Text>
          </View>
        ) : null
      }
    >
      {lines.length === 0 ? (
        <EmptyCart />
      ) : (
        <View style={styles.container}>
          <FlatList
            data={lines}
            keyExtractor={(line) => line.product.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => {
              const product = item.product;

              return (
                <View style={styles.cartItem}>
                  {/* Product image */}
                  <View style={styles.imageContainer}>
                    {product.image ? (
                      <Image
                        source={{ uri: product.image }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={styles.imagePlaceholder}>
                        <Ionicons
                          name="image-outline"
                          size={28}
                          color={palette.muted}
                        />
                      </View>
                    )}
                  </View>

                  {/* Product information */}
                  <View style={styles.productInfo}>
                    <Text
                      numberOfLines={2}
                      style={styles.productName}
                    >
                      {product.name}
                    </Text>

                    {product.brand ? (
                      <Text
                        numberOfLines={1}
                        style={styles.brand}
                      >
                        {product.brand}
                      </Text>
                    ) : null}

                    <Text style={styles.price}>
                      {formatCurrency(product.price)}
                    </Text>

                    {/* Quantity controls */}
                    <View style={styles.bottomRow}>
                      <View style={styles.quantityControl}>
                        <Pressable
                          onPress={() =>
                            cartActions.setQuantity(
                              product.id,
                              item.quantity - 1
                            )
                          }
                          style={styles.quantityButton}
                        >
                          <Ionicons
                            name="remove"
                            size={17}
                            color={palette.text}
                          />
                        </Pressable>

                        <Text style={styles.quantity}>
                          {item.quantity}
                        </Text>

                        <Pressable
                          onPress={() =>
                            cartActions.setQuantity(
                              product.id,
                              item.quantity + 1
                            )
                          }
                          style={[
                            styles.quantityButton,
                            styles.plusButton,
                          ]}
                        >
                          <Ionicons
                            name="add"
                            size={17}
                            color="#fff"
                          />
                        </Pressable>
                      </View>

                      {/* Item total */}
                      <Text style={styles.itemTotal}>
                        {formatCurrency(
                          product.price * item.quantity
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* Remove */}
                  <Pressable
                    onPress={() =>
                      cartActions.setQuantity(
                        product.id,
                        0
                      )
                    }
                    style={styles.removeButton}
                    hitSlop={8}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={17}
                      color="#ef6b6b"
                    />
                  </Pressable>
                </View>
              );
            }}
          />

          {/* Summary */}
          <View style={styles.checkoutContainer}>
            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.summaryTitle}>
                  Bill summary
                </Text>

                <Text style={styles.summarySubtitle}>
                  {totalItems}{" "}
                  {totalItems === 1 ? "item" : "items"} in
                  your cart
                </Text>
              </View>

              <Ionicons
                name="receipt-outline"
                size={20}
                color={palette.accent}
              />
            </View>

            <CartTotals />

            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={palette.muted}
              />

              <Text style={styles.infoText}>
                Delivery and handling fees are confirmed
                by the server at checkout.
              </Text>
            </View>

            <Pressable
              onPress={() => router.push("/checkout")}
              style={({ pressed }) => [
                styles.checkoutButton,
                pressed && styles.checkoutPressed,
              ]}
            >
              <View>
                <Text style={styles.checkoutSmall}>
                  Total
                </Text>

                <Text style={styles.checkoutTotal}>
                  {formatCurrency(summary.subtotal)}
                </Text>
              </View>

              <View style={styles.checkoutAction}>
                <Text style={styles.checkoutText}>
                  Continue
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color="#fff"
                />
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </Page>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty Cart */
/* -------------------------------------------------------------------------- */

function EmptyCart() {
  return (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIcon}>
        <Ionicons
          name="cart-outline"
          size={48}
          color={palette.accent}
        />
      </View>

      <Text style={styles.emptyTitle}>
        Your cart is empty
      </Text>

      <Text style={styles.emptySubtitle}>
        Looks like you haven't added anything yet.
        Discover something delicious!
      </Text>

      <Pressable
        onPress={() => router.push("/(tabs)")}
        style={({ pressed }) => [
          styles.shopButton,
          pressed && styles.shopButtonPressed,
        ]}
      >
        <Ionicons
          name="bag-handle-outline"
          size={18}
          color="#fff"
        />

        <Text style={styles.shopButtonText}>
          Start shopping
        </Text>

        <Ionicons
          name="arrow-forward"
          size={17}
          color="#fff"
        />
      </Pressable>
    </View>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles */
/* -------------------------------------------------------------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Header badge */

  countBadge: {
    flexDirection: "row",
    alignItems: "center",
marginTop: 34,
    gap: 5,

    backgroundColor: "rgba(255,121,72,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,121,72,0.25)",

    paddingHorizontal: 10,
    paddingVertical: 7,

    borderRadius: 20,
  },

  countText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: "900",
  },

  /* Cart list */

  listContent: {
    paddingBottom: 12,
  },

  cartItem: {
    flexDirection: "row",

    backgroundColor: "#1a222d",

    borderRadius: 18,

    borderWidth: 1,
    borderColor: "#303a46",

    padding: 11,

    marginBottom: 10,

    position: "relative",
  },

  /* Image */

  imageContainer: {
    width: 88,
    height: 100,

    borderRadius: 14,

    overflow: "hidden",

    backgroundColor: "#111820",

    marginRight: 12,
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",
  },

  /* Product */

  productInfo: {
    flex: 1,

    paddingRight: 28,
  },

  productName: {
    color: palette.text,

    fontSize: 14,
    fontWeight: "800",

    lineHeight: 19,
  },

  brand: {
    color: palette.muted,

    fontSize: 10,

    marginTop: 3,
  },

  price: {
    color: palette.accent,

    fontSize: 13,
    fontWeight: "800",

    marginTop: 6,
  },

  /* Bottom */

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 10,
  },

  quantityControl: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#10151c",

    borderRadius: 10,

    borderWidth: 1,
    borderColor: "#303a46",

    overflow: "hidden",
  },

  quantityButton: {
    width: 29,
    height: 29,

    alignItems: "center",
    justifyContent: "center",
  },

  plusButton: {
    backgroundColor: palette.accent,
  },

  quantity: {
    color: palette.text,

    fontSize: 12,
    fontWeight: "800",

    minWidth: 27,

    textAlign: "center",
  },

  itemTotal: {
    color: palette.text,

    fontSize: 13,
    fontWeight: "900",
  },

  /* Remove */

  removeButton: {
    position: "absolute",

    right: 10,
    top: 10,

    width: 28,
    height: 28,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(239,107,107,0.08)",
  },

  /* Summary */

  checkoutContainer: {
    backgroundColor: "#151c25",

    borderWidth: 1,
    borderColor: "#303a46",

    borderRadius: 20,

    padding: 15,

    marginTop: 4,
    marginBottom: 10,
  },

  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 8,
  },

  summaryTitle: {
    color: palette.text,

    fontSize: 16,
    fontWeight: "900",
  },

  summarySubtitle: {
    color: palette.muted,

    fontSize: 10,

    marginTop: 3,
  },

  /* Info */

  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",

    gap: 8,

    backgroundColor: "#10151c",

    borderRadius: 11,

    padding: 10,

    marginTop: 10,
    marginBottom: 12,
  },

  infoText: {
    flex: 1,

    color: palette.muted,

    fontSize: 10,

    lineHeight: 15,
  },

  /* Checkout */

  checkoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: palette.accent,

    borderRadius: 15,

    paddingHorizontal: 15,
    paddingVertical: 11,
  },

  checkoutPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  checkoutSmall: {
    color: "rgba(255,255,255,0.75)",

    fontSize: 9,
    fontWeight: "700",
  },

  checkoutTotal: {
    color: "#fff",

    fontSize: 15,
    fontWeight: "900",

    marginTop: 1,
  },

  checkoutAction: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,
  },

  checkoutText: {
    color: "#fff",

    fontSize: 13,
    fontWeight: "900",
  },

  /* Empty cart */

  emptyContainer: {
    flex: 1,

    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
    paddingVertical: 80,
  },

  emptyIcon: {
    width: 100,
    height: 100,

    borderRadius: 50,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255,121,72,0.12)",

    borderWidth: 1,
    borderColor: "rgba(255,121,72,0.25)",

    marginBottom: 22,
  },

  emptyTitle: {
    color: palette.text,

    fontSize: 21,
    fontWeight: "900",

    marginBottom: 8,
  },

  emptySubtitle: {
    color: palette.muted,

    fontSize: 12,
    lineHeight: 19,

    textAlign: "center",

    maxWidth: 290,
  },

  shopButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 8,

    backgroundColor: palette.accent,

    borderRadius: 24,

    paddingHorizontal: 20,
    paddingVertical: 13,

    marginTop: 22,
  },

  shopButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },

  shopButtonText: {
    color: "#fff",

    fontSize: 13,
    fontWeight: "900",
  },
});
