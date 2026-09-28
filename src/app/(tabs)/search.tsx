import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

import { api } from "@/lib/api";
import type { Product } from "@/types";
import {
  Loading,
  Message,
  Page,
  ProductCard,
  palette,
} from "@/components/ui";

const QUICK_SEARCHES = [
  "Milk",
  "Rice",
  "Atta",
  "Biscuits",
  "Tea",
  "Vegetables",
];

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const searchProducts = async (searchQuery: string, refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await api.products({
        search: searchQuery.trim() || undefined,
        limit: 100,
      });

      setProducts(data.products);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not search products"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void searchProducts(query);
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
    Keyboard.dismiss();
  };

  const selectQuickSearch = (value: string) => {
    setQuery(value);
    Keyboard.dismiss();
  };

  const refresh = () => {
    void searchProducts(query, true);
  };

  return (
    <Page  title="">
      {/* Search box */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={21}
          color={palette.muted}
          style={styles.searchIcon}
        />

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder='Search "milk", "atta", "rice"...'
          placeholderTextColor={palette.muted}
          autoCorrect={false}
          autoCapitalize="none"
          returnKeyType="search"
          autoFocus
          style={styles.input}
          onSubmitEditing={() => {
            Keyboard.dismiss();
            void searchProducts(query);
          }}
        />

        {loading && query.trim().length > 0 ? (
          <ActivityIndicator
            size="small"
            color={palette.accent}
            style={styles.rightIcon}
          />
        ) : query.length > 0 ? (
          <Pressable
            onPress={clearSearch}
            style={styles.clearButton}
            hitSlop={8}
          >
            <Ionicons
              name="close-circle"
              size={21}
              color={palette.muted}
            />
          </Pressable>
        ) : null}
      </View>

      {/* Quick searches */}
      {!query.trim() && !loading && (
        <View style={styles.quickSection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>
                What are you looking for?
              </Text>

              <Text style={styles.sectionSubtitle}>
                Popular searches
              </Text>
            </View>

            <Ionicons
              name="sparkles-outline"
              size={20}
              color={palette.accent}
            />
          </View>

          <View style={styles.quickGrid}>
            {QUICK_SEARCHES.map((item) => (
              <Pressable
                key={item}
                onPress={() => selectQuickSearch(item)}
                style={({ pressed }) => [
                  styles.quickChip,
                  pressed && styles.quickChipPressed,
                ]}
              >
                <Ionicons
                  name="search-outline"
                  size={15}
                  color={palette.accent}
                />

                <Text style={styles.quickText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* Search results */}
      {loading && products.length === 0 ? (
        <Loading />
      ) : error ? (
        <Message
          text={error}
          onRetry={() => void searchProducts(query)}
        />
      ) : (
        <FlatList
          data={products}
          numColumns={2}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={refresh}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={[
            styles.listContent,
            products.length === 0 && styles.emptyList,
          ]}
          ListHeaderComponent={
            products.length > 0 ? (
              <View style={styles.resultsHeader}>
                <View>
                  <Text style={styles.resultsTitle}>
                    {query.trim()
                      ? `Results for "${query.trim()}"`
                      : "All Products"}
                  </Text>

                  <Text style={styles.resultsCount}>
                    {products.length}{" "}
                    {products.length === 1 ? "product" : "products"} found
                  </Text>
                </View>

                <View style={styles.resultBadge}>
                  <Ionicons
                    name="cube-outline"
                    size={14}
                    color={palette.accent}
                  />

                  <Text style={styles.resultBadgeText}>
                    {products.length}
                  </Text>
                </View>
              </View>
            ) : null
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
              <View style={styles.emptyIcon}>
                <Ionicons
                  name="search-outline"
                  size={38}
                  color={palette.accent}
                />
              </View>

              <Text style={styles.emptyTitle}>
                No products found
              </Text>

              <Text style={styles.emptyText}>
                We couldn't find anything matching{" "}
                {query.trim()
                  ? `"${query.trim()}"`
                  : "your search"}.
              </Text>

              <Pressable
                onPress={clearSearch}
                style={styles.browseButton}
              >
                <Text style={styles.browseButtonText}>
                  Browse all products
                </Text>

                <Ionicons
                  name="arrow-forward"
                  size={17}
                  color="#fff"
                />
              </Pressable>
            </View>
          }
        />
      )}
    </Page>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    // marginTop: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",
  },

  /* Search */

  searchContainer: {
    height: 44,
    borderRadius: 17,
    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",

    flexDirection: "row",
    alignItems: "center",

    paddingHorizontal: 15,

    marginBottom:20,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },

  searchIcon: {
    marginRight: 10,
  },

  input: {
    flex: 1,
    color: palette.text,
    fontSize: 14,
    fontWeight: "600",
    paddingVertical: 0,
  },

  rightIcon: {
    marginLeft: 8,
  },

  clearButton: {
    marginLeft: 8,
  },

  /* Quick search */

  quickSection: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 13,
  },

  sectionTitle: {
    color: palette.text,
    fontSize: 18,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 3,
  },

  quickGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 9,
  },

  quickChip: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#1a222d",
    borderWidth: 1,
    borderColor: "#303a46",

    borderRadius: 20,

    paddingHorizontal: 13,
    paddingVertical: 10,

    gap: 7,
  },

  quickChipPressed: {
    backgroundColor: "#252f3d",
    borderColor: palette.accent,
  },

  quickText: {
    color: palette.text,
    fontSize: 12,
    fontWeight: "700",
  },

  /* Results */

  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 14,
  },

  resultsTitle: {
    color: palette.text,
    fontSize: 17,
    fontWeight: "800",
  },

  resultsCount: {
    color: palette.muted,
    fontSize: 11,
    marginTop: 3,
  },

  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,

    backgroundColor: "rgba(255, 121, 72, 0.12)",
    borderColor: "rgba(255, 121, 72, 0.25)",
    borderWidth: 1,

    borderRadius: 20,

    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  resultBadgeText: {
    color: palette.accent,
    fontSize: 11,
    fontWeight: "800",
  },

  columnWrapper: {
    justifyContent: "space-between",
  },

  listContent: {
    paddingBottom: 30,
  },

  emptyList: {
    flexGrow: 1,
  },

  /* Empty */

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",

    paddingHorizontal: 30,
    paddingVertical: 70,
  },

  emptyIcon: {
    width: 76,
    height: 76,

    borderRadius: 38,

    alignItems: "center",
    justifyContent: "center",

    backgroundColor: "rgba(255, 121, 72, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 121, 72, 0.25)",

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
    marginTop: 20,

    flexDirection: "row",
    alignItems: "center",

    gap: 7,

    backgroundColor: palette.accent,

    paddingHorizontal: 18,
    paddingVertical: 12,

    borderRadius: 22,
  },

  browseButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "800",
  },
});
