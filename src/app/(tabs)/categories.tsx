import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { api } from "@/lib/api";
import type { Category } from "@/types";
import {
  Loading,
  Message,
  Page,
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
  "#84CC16",
];

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  grocery: "cart-outline",
  groceries: "cart-outline",
  fruits: "nutrition-outline",
  vegetables: "leaf-outline",
  dairy: "water-outline",
  milk: "water-outline",
  beverages: "cafe-outline",
  drinks: "wine-outline",
  snacks: "fast-food-outline",
  biscuits: "nutrition-outline",
  bakery: "restaurant-outline",
  rice: "restaurant-outline",
  atta: "layers-outline",
  "personal care": "body-outline",
  "household": "home-outline",
  cleaning: "sparkles-outline",
  beauty: "color-palette-outline",
  pharmacy: "medkit-outline",
  meat: "restaurant-outline",
  chicken: "restaurant-outline",
  food: "fast-food-outline",
};

function getCategoryIcon(
  name: string
): keyof typeof Ionicons.glyphMap {
  const normalized = name.toLowerCase().trim();

  const match = Object.keys(CATEGORY_ICONS).find((key) =>
    normalized.includes(key)
  );

  return match ? CATEGORY_ICONS[match] : "grid-outline";
}

function getCategoryColor(index: number) {
  return CATEGORY_COLORS[index % CATEGORY_COLORS.length];
}

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await api.categories();
      setCategories(data);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not load categories"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Page
      title=""
      // action={
      //   <View style={styles.categoryCount}>
      //     <Text style={styles.categoryCountText}>
      //       {categories.length}
      //     </Text>
      //   </View>
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
          data={categories}
          numColumns={2}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => void load(true)}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.heroIcon}>
                <Ionicons
                  name="grid-outline"
                  size={28}
                  color={palette.accent}
                />
              </View>

              <View style={styles.headerText}>
                <Text style={styles.heading}>
                  Shop by category
                </Text>

                <Text style={styles.subtitle}>
                  Find everything you need, all in one place
                </Text>
              </View>
            </View>
          }
          renderItem={({ item, index }) => {
            const color = getCategoryColor(index);
            const icon = getCategoryIcon(item.name);

            return (
              <Pressable
                onPress={() =>
                  router.push(`/category/${item.id}`)
                }
                style={({ pressed }) => [
                  styles.card,
                  {
                    borderColor: `${color}45`,
                  },
                  pressed && styles.cardPressed,
                ]}
              >
                {/* Icon */}
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: `${color}18`,
                      borderColor: `${color}35`,
                    },
                  ]}
                >
                  <Ionicons
                    name={icon}
                    size={27}
                    color={color}
                  />
                </View>

                {/* Text */}
                <Text
                  numberOfLines={2}
                  style={styles.categoryName}
                >
                  {item.name}
                </Text>

                <View style={styles.bottomRow}>
                  <Text style={styles.browseText}>
                    {/* Browse */}
                  </Text>

                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={color}
                  />
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="grid-outline"
                  size={38}
                  color={palette.accent}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No categories available
              </Text>

              <Text style={styles.emptyText}>
                Categories will appear here once they are
                available.
              </Text>

              <Pressable
                onPress={() => void load()}
                style={styles.retryButton}
              >
                <Text style={styles.retryText}>
                  Try again
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

  /* Header */

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 4,
  },

  heroIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255, 121, 72, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 121, 72, 0.25)",

    marginRight: 13,
  },

  headerText: {
    flex: 1,
  },

  heading: {
    color: palette.text,
    fontSize: 19,
    fontWeight: "800",
  },

  subtitle: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 4,
    lineHeight: 16,
  },

  /* Count */

  categoryCount: {
    minWidth: 34,
    height: 34,
    borderRadius: 17,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255, 121, 72, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 121, 72, 0.25)",
  },

  categoryCountText: {
    color: palette.accent,
    fontSize: 12,
    fontWeight: "900",
  },

  /* Category card */

  card: {
    width: "48.3%",

    minHeight: 165,

    backgroundColor: "#1a222d",

    borderWidth: 1,
    borderRadius: 20,

    padding: 15,

    justifyContent: "space-between",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },

  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  iconContainer: {
    width: 58,
    height: 58,

    borderRadius: 18,

    alignItems: "center",
    justifyContent: "center",

    borderWidth: 1,
  },

  categoryName: {
    color: palette.text,

    fontSize: 15,
    fontWeight: "800",

    textTransform: "capitalize",

    marginTop: 14,

    lineHeight: 20,
  },

  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginTop: 13,
  },

  browseText: {
    color: palette.muted,
    fontSize: 10,
    fontWeight: "700",
  },

  /* Empty state */

  emptyState: {
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
    paddingVertical: 80,
  },

  emptyIcon: {
    width: 78,
    height: 78,
    borderRadius: 39,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255, 121, 72, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 121, 72, 0.25)",

    marginBottom: 18,
  },

  emptyTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 7,
  },

  emptyText: {
    color: palette.muted,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 280,
  },

  retryButton: {
    marginTop: 18,

    backgroundColor: palette.accent,

    paddingHorizontal: 20,
    paddingVertical: 11,

    borderRadius: 22,
  },

  retryText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
