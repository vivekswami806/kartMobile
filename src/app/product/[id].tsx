import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { api } from "@/lib/api";
import { cartActions } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";
import { Page, palette } from "@/components/ui";
import { lightTheme } from "../styles/light";

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (!id) return;

    api
      .product(id)
      .then((data) => setProduct(data.product))
      .catch((e) => setError(e.message || "Product not found"));
  }, [id]);

  if (!product && !error) {
    return (
      <Page title="">
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
          <Text style={styles.loadingText}>Loading product...</Text>
        </View>
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="">
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons
              name="alert-circle-outline"
              size={32}
              color={lightTheme.errorColor}
            />
          </View>

          <Text style={styles.errorTitle}>Product unavailable</Text>
          <Text style={styles.errorText}>{error}</Text>

          <Pressable
            onPress={() => router.back()}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Go back</Text>
          </Pressable>
        </View>
      </Page>
    );
  }

  if (!product) return null;

  const image = product.image_url || product.image;
  const inStock = product.in_stock !== false && (product.stock ?? 1) > 0;
  const total = product.price * quantity;

  const decrease = () => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const increase = () => {
    if (product.stock != null) {
      setQuantity((current) => Math.min(Number(product.stock), current + 1));
    } else {
      setQuantity((current) => current + 1);
    }
  };

  const addToCart = () => {
    for (let i = 0; i < quantity; i++) {
      cartActions.add(product);
    }

    router.push("/(tabs)/cart");
  };

  return (
    <Page title="">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.iconButton}>
            <Ionicons
              name="arrow-back"
              size={21}
              color={lightTheme.textSecondary}
            />
          </Pressable>

          <Text style={styles.headerTitle}>Product details</Text>

          <Pressable
            onPress={() => router.push("/(tabs)/cart")}
            style={styles.iconButton}
          >
            <Ionicons
              name="cart-outline"
              size={21}
              color={lightTheme.textSecondary}
            />
          </Pressable>
        </View>

        {/* Product image */}
        <View style={styles.imageCard}>
          {image ? (
            <Image
              source={{ uri: image }}
              style={styles.productImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons
                name="image-outline"
                size={55}
                color={palette.muted}
              />
              <Text style={styles.placeholderText}>
                No image available
              </Text>
            </View>
          )}

          {product.badge ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{product.badge}</Text>
            </View>
          ) : null}
        </View>

        {/* Product information */}
        <View style={styles.info}>
          <View style={styles.categoryRow}>
            <View style={styles.dot} />
            <Text style={styles.categoryText}>
              {product.brand || "Krikart"}
            </Text>

            {inStock ? (
              <View style={styles.stockPill}>
                <View style={styles.stockDot} />
                <Text style={styles.stockText}>In stock</Text>
              </View>
            ) : (
              <View style={styles.outStockPill}>
                <Text style={styles.outStockText}>Out of stock</Text>
              </View>
            )}
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          {product.unit ? (
            <Text style={styles.unit}>{product.unit}</Text>
          ) : null}

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              {formatCurrency(product.price)}
            </Text>

            {product.unit ? (
              <Text style={styles.priceUnit}>
                / {product.unit}
              </Text>
            ) : null}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About this product</Text>

            <Text style={styles.description}>
              {product.description ||
                "Fresh picks from Krikart, carefully selected for quality and delivered to your doorstep."}
            </Text>
          </View>

          {/* Quantity */}
          {inStock && (
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>

              <View style={styles.quantityRow}>
                <View style={styles.quantityControl}>
                  <Pressable
                    onPress={decrease}
                    disabled={quantity <= 1}
                    style={[
                      styles.quantityButton,
                      quantity <= 1 && styles.quantityButtonDisabled,
                    ]}
                  >
                    <Ionicons
                      name="remove"
                      size={20}
                      color={
                        quantity <= 1
                          ? palette.muted
                          : palette.accent
                      }
                    />
                  </Pressable>

                  <Text style={styles.quantityText}>
                    {quantity}
                  </Text>

                  <Pressable
                    onPress={increase}
                    disabled={
                      product.stock != null &&
                      quantity >= product.stock
                    }
                    style={styles.quantityButton}
                  >
                    <Ionicons
                      name="add"
                      size={20}
                      color={palette.accent}
                    />
                  </Pressable>
                </View>

                <Text style={styles.totalPrice}>
                  {formatCurrency(total)}
                </Text>
              </View>
            </View>
          )}

          {/* Delivery information */}
          <View style={styles.deliveryCard}>
            <View style={styles.deliveryIcon}>
              <Ionicons
                name="flash-outline"
                size={20}
                color={palette.accent}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.deliveryTitle}>
                Quick delivery
              </Text>
              <Text style={styles.deliveryText}>
                Fresh products delivered to your doorstep.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward"
              size={18}
              color={palette.muted}
            />
          </View>

          {/* Stock */}
          <View style={styles.stockInfo}>
            <Ionicons
              name="cube-outline"
              size={17}
              color={palette.muted}
            />

            <Text style={styles.stockInfoText}>
              Available stock:{" "}
              <Text style={styles.stockValue}>
                {product.stock ?? (inStock ? "Available" : "Unavailable")}
              </Text>
            </Text>
          </View>
        </View>

        {/* Add to cart */}
        <View style={styles.bottom}>
          <Pressable
            disabled={!inStock}
            onPress={addToCart}
            style={[
              styles.addButton,
              !inStock && styles.addButtonDisabled,
            ]}
          >
            <Ionicons
              name="cart-outline"
              size={21}
              color="#1a1412"
            />

            <Text style={styles.addButtonText}>
              {inStock
                ? `Add to cart · ${formatCurrency(total)}`
                : "Currently unavailable"}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 30,
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 12,
  },

  loadingText: {
    color: palette.muted,
    fontSize: 13,
  },

  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    paddingTop: 80,
  },

  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#DC143C18",
    marginBottom: 14,
  },

  errorTitle: {
    color: palette.text,
    fontSize: 20,
    fontWeight: "800",
  },

  errorText: {
    color: palette.muted,
    textAlign: "center",
    marginTop: 7,
    lineHeight: 19,
  },

  secondaryButton: {
    marginTop: 22,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: lightTheme.background,
    borderWidth: 1,
    borderColor: palette.border,
  },

  secondaryButtonText: {
    color: palette.text,
    fontWeight: "800",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  headerTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: "800",
  },

  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: lightTheme.background,
    borderWidth: 1,
    borderColor: palette.border,
  },

  imageCard: {
    height: 310,
    width: "100%",
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: lightTheme.cardBackground,
    borderWidth: 1,
    borderColor: palette.border,
    position: "relative",
  },

  productImage: {
    width: "100%",
    height: "100%",
  },

  imagePlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: lightTheme.background,
  },

  placeholderText: {
    color: palette.muted,
    fontSize: 12,
  },

  badge: {
    position: "absolute",
    top: 14,
    left: 14,
    backgroundColor: palette.accent,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 20,
  },

  badgeText: {
    color: "#1a1412",
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  info: {
    paddingTop: 18,
  },

  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: palette.accent,
  },

  categoryText: {
    color: palette.muted,
    fontSize: 12,
    fontWeight: "700",
    flex: 1,
  },

  stockPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "#228B2218",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#228B22",
  },

  stockText: {
    color: "#228B22",
    fontSize: 10,
    fontWeight: "800",
  },

  outStockPill: {
    backgroundColor: "#DC143C18",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  outStockText: {
    color: lightTheme.errorColor,
    fontSize: 10,
    fontWeight: "800",
  },

  productName: {
    color: palette.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: "900",
    marginTop: 9,
  },

  unit: {
    color: palette.muted,
    fontSize: 13,
    marginTop: 5,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 14,
  },

  price: {
    color: palette.accent,
    fontSize: 25,
    fontWeight: "900",
  },

  priceUnit: {
    color: palette.muted,
    fontSize: 12,
    marginLeft: 5,
  },

  section: {
    marginTop: 22,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 7,
  },

  description: {
    color: palette.muted,
    fontSize: 13,
    lineHeight: 21,
  },

  quantitySection: {
    marginTop: 22,
  },

  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: lightTheme.cardBackground,
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 13,
    overflow: "hidden",
  },

  quantityButton: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
  },

  quantityButtonDisabled: {
    opacity: 0.5,
  },

  quantityText: {
    minWidth: 38,
    textAlign: "center",
    color: lightTheme.text,
    fontSize: 15,
    fontWeight: "800",
  },

  totalPrice: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",
  },

  deliveryCard: {
    marginTop: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#FFD70012",
    borderWidth: 1,
    borderColor: "#FFD70035",
  },

  deliveryIcon: {
    width: 39,
    height: 39,
    borderRadius: 12,
    backgroundColor: "#FFD70020",
    alignItems: "center",
    justifyContent: "center",
  },

  deliveryTitle: {
    color: palette.text,
    fontSize: 13,
    fontWeight: "800",
  },

  deliveryText: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 2,
  },

  stockInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 15,
  },

  stockInfoText: {
    color: palette.muted,
    fontSize: 11,
  },

  stockValue: {
    color: palette.text,
    fontWeight: "700",
  },

  bottom: {
    marginTop: 22,
  },

  addButton: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: palette.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    shadowColor: palette.accent,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  },

  addButtonDisabled: {
    backgroundColor: palette.border,
    shadowOpacity: 0,
  },

  addButtonText: {
    color: "#1a1412",
    fontSize: 14,
    fontWeight: "900",
  },
});
