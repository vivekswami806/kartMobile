import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";

import { api } from "@/lib/api";
import type { Product } from "@/types";
import {
  Loading,
  Message,
  Page,
  ProductCard,
  palette,
} from "@/components/ui";

const CATEGORY_COLORS = [
  "#FF7948",
  "#4C6EF5",
  "#22C55E",
  "#A855F7",
  "#F59E0B",
  "#06B6D4",
  "#EC4899",
];

const CATEGORY_ICONS: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  grocery: "cart-outline",
  groceries: "cart-outline",
  fruits: "nutrition-outline",
  vegetables: "leaf-outline",
  dairy: "water-outline",
  milk: "water-outline",
  beverages: "cafe-outline",
  drinks: "cafe-outline",
  snacks: "fast-food-outline",
  biscuits: "nutrition-outline",
  bakery: "restaurant-outline",
  rice: "restaurant-outline",
  atta: "layers-outline",
  household: "home-outline",
  cleaning: "sparkles-outline",
  beauty: "color-palette-outline",
  pharmacy: "medkit-outline",
  food: "fast-food-outline",
  meat: "restaurant-outline",
  chicken: "restaurant-outline",
};

function getCategoryIcon(
  name: string
): keyof typeof Ionicons.glyphMap {
  const normalized = name.toLowerCase();

  const match = Object.keys(CATEGORY_ICONS).find((key) =>
    normalized.includes(key)
  );

  return match
    ? CATEGORY_ICONS[match]
    : "grid-outline";
}

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const categoryName = String(id || "Category")
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const categoryColor =
    CATEGORY_COLORS[
      Math.abs(
        String(id || "")
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      ) % CATEGORY_COLORS.length
    ];

  const categoryIcon = getCategoryIcon(categoryName);

  const load = useCallback(
    async (refresh = false) => {
      if (!id) return;

      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const data = await api.products({
          category_id: id,
          limit: 100,
        });

        setProducts(data.products);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Could not load category"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id]
  );

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Page
      title={""}
      // action={
      //   <Pressable
      //     onPress={() => router.back()}
      //     style={styles.backButton}
      //     hitSlop={8}
      //   >
      //     <Ionicons
      //       name="arrow-back"
      //       size={20}
      //       color={palette.text}
      //     />
      //   </Pressable>
      // }
    >
      {loading ? (
        <Loading />
      ) : error ? (
        <Message
          text={error}
          onRetry={() => void load()}
        />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => void load(true)}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <View
                style={[
                  styles.categoryIcon,
                  {
                    backgroundColor: `${categoryColor}18`,
                    borderColor: `${categoryColor}40`,
                  },
                ]}
              >
                <Ionicons
                  name={categoryIcon}
                  size={29}
                  color={categoryColor}
                />
              </View>

              <View style={styles.headerInfo}>
                <Text style={styles.heading}>
                  {categoryName}
                </Text>

                <Text style={styles.subtitle}>
                  {products.length}{" "}
                  {products.length === 1
                    ? "product"
                    : "products"}{" "}
                  available
                </Text>
              </View>

              {refreshing && (
                <ActivityIndicator
                  size="small"
                  color={palette.accent}
                />
              )}
            </View>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() =>
                router.push(`/product/${item.id}`)
              }
            />
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View
                style={[
                  styles.emptyIcon,
                  {
                    backgroundColor: `${categoryColor}15`,
                    borderColor: `${categoryColor}35`,
                  },
                ]}
              >
                <Ionicons
                  name={categoryIcon}
                  size={38}
                  color={categoryColor}
                />
              </View>

              <Text style={styles.emptyTitle}>
                Nothing here yet
              </Text>

              <Text style={styles.emptyText}>
                We don't have any products in{" "}
                {categoryName} right now.
              </Text>

              <Pressable
                onPress={() => router.back()}
                style={[
                  styles.browseButton,
                  {
                    backgroundColor: categoryColor,
                  },
                ]}
              >
                <Ionicons
                  name="grid-outline"
                  size={16}
                  color="#fff"
                />

                <Text style={styles.browseText}>
                  Browse categories
                </Text>
              </Pressable>
            </View>
          }
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 30,
  },

  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },

  /* Back */

  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginTop: 25,
    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
  },

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#151c25",

    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#303a46",

    padding: 14,

    marginBottom: 18,
  },

  categoryIcon: {
    width: 60,
    height: 60,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    marginRight: 13,
  },

  headerInfo: {
    flex: 1,
  },

  heading: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "900",

    textTransform: "capitalize",
  },

  subtitle: {
    color: palette.muted,
    fontSize: 11,

    marginTop: 4,
  },

  /* Empty */

  emptyState: {
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
    paddingVertical: 80,
  },

  emptyIcon: {
    width: 82,
    height: 82,

    borderRadius: 41,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,

    marginBottom: 18,
  },

  emptyTitle: {
    color: palette.text,

    fontSize: 19,
    fontWeight: "800",

    marginBottom: 7,
  },

  emptyText: {
    color: palette.muted,

    fontSize: 12,
    lineHeight: 19,

    textAlign: "center",

    maxWidth: 280,
  },

  browseButton: {
    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    marginTop: 20,

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 22,
  },

  browseText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
