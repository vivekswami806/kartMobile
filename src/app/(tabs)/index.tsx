import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { api } from "@/lib/api";
import type { Address, Category, Product } from "@/types";
import {
  Loading,
  Message,
  Page,
  ProductCard,
  palette,
} from "@/components/ui";
import { COLORS, tabBar } from "../styles/light";

type Mode = "grocery" | "food";

type Banner = {
  id?: string;
  title?: string;
  subtitle?: string;
  image?: string;
  cta?: string;
  link_category?: string;
};

const MODE_ICONS: Record<Mode, keyof typeof Ionicons.glyphMap> = {
  grocery: "basket-outline",
  food: "restaurant-outline",
};

const CATEGORY_ICONS: Record<
  string,
  keyof typeof Ionicons.glyphMap
> = {
  grocery: "basket-outline",
  groceries: "basket-outline",
  fruits: "nutrition-outline",
  vegetables: "leaf-outline",
  dairy: "water-outline",
  milk: "water-outline",
  bakery: "restaurant-outline",
  snacks: "fast-food-outline",
  beverages: "cafe-outline",
  drinks: "cafe-outline",
  food: "restaurant-outline",
  meals: "restaurant-outline",
};

function getCategoryIcon(
  name: string
): keyof typeof Ionicons.glyphMap {
  return (
    CATEGORY_ICONS[name.toLowerCase()] ??
    "grid-outline"
  );
}

export default function ShopScreen() {
  const [mode, setMode] = useState<Mode>("grocery");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [rails, setRails] = useState<
    {
      key: string;
      title: string;
      products: Product[];
    }[]
  >([]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [activeAddress, setActiveAddress] = useState<Address | null>(null);
  const [eta, setEta] = useState(10);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [detectedLocation, setDetectedLocation] = useState<{
    latitude: number;
    longitude: number;
    label: string;
    detail: string;
  } | null>(null);

  const [locating, setLocating] = useState(false);
  const [showLocation, setShowLocation] = useState(false);

  const loadHome = useCallback(
    async (refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const home = await api.home(mode);
        setEta(home.eta_minutes || 10);
        setCategories(home.categories ?? []);
        setBanners((home.banners ?? []) as Banner[]);
        setRails(home.rails ?? []);

        setProducts(
          (home.rails ?? []).flatMap(
            (rail) => rail.products ?? []
          )
        );
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Could not load Krikart"
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [mode]
  );

  const loadAddresses = useCallback(async () => {
    try {
      const result = await api.addresses();

      const list = result.addresses ?? [];

      setAddresses(list);

      const defaultAddress =
        list.find((address) => address.is_default) ??
        list[0] ??
        null;

      setActiveAddress(defaultAddress);
    } catch {
      // User may not be logged in.
    }
  }, []);

  const detectUserLocation = useCallback(async () => {
    try {
      setLocating(true);

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("Location permission denied");
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      const { latitude, longitude } = location.coords;

      const addresses =
        await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

      const address = addresses[0];

      const label =
        address?.district ||
        address?.city ||
        address?.subregion ||
        "Current location";

      const detail = [
        address?.name,
        address?.street,
        address?.district,
        address?.city,
        address?.postalCode,
      ]
        .filter(Boolean)
        .join(", ");

      setDetectedLocation({
        latitude,
        longitude,
        label,
        detail,
      });
    } catch (e) {
      console.error(
        "Could not detect location:",
        e
      );
    } finally {
      setLocating(false);
    }
  }, []);


  useEffect(() => {
    void loadHome();
  }, [loadHome]);

  useEffect(() => {
    void loadAddresses();
  }, [loadAddresses]);

  useEffect(() => { void detectUserLocation() }, [detectUserLocation]);
  const locationTitle = activeAddress ? activeAddress.label : detectedLocation?.label ?? "Detecting location...";
  const locationSubtitle = activeAddress ? `${activeAddress.line1}, ${activeAddress.pincode}` : detectedLocation?.detail ?? "Getting your current location...";

  if (loading) {
    return (
      <Page title="">
        <Loading />
      </Page>
    );
  }

  if (error) {
    return (
      <Page title="">
        <Message
          text={error}
          onRetry={() => loadHome()}
        />
      </Page>
    );
  }

  return (
    <View style={styles.container}>
      {/* ================= HEADER ================= */}
      <View style={styles.header}>
        {/* Top row */}
        <View style={styles.topRow}>
          <Pressable
            style={styles.logo}
            onPress={() => router.push("/")}
          >
            <Text style={styles.logoText}>K</Text>
          </Pressable>

          {/* Mode switcher */}
          <View style={styles.modeSwitcher}>
            <Pressable
              onPress={() => setMode("grocery")}
              style={[
                styles.modeButton,
                mode === "grocery" &&
                styles.modeButtonActive,
              ]}
            >
              <Ionicons
                name="basket-outline"
                size={14}
                color={
                  mode === "grocery"
                    ? "#111"
                    : COLORS.muted
                }
              />

              <Text
                style={[
                  styles.modeText,
                  mode === "grocery" &&
                  styles.modeTextActive,
                ]}
              >
                Grocery
              </Text>
            </Pressable>

            <Pressable
              onPress={() => setMode("food")}
              style={[
                styles.modeButton,
                mode === "food" &&
                styles.modeButtonActive,
              ]}
            >
              <Ionicons
                name="restaurant-outline"
                size={14}
                color={
                  mode === "food"
                    ? "#111"
                    : COLORS.muted
                }
              />

              <Text
                style={[
                  styles.modeText,
                  mode === "food" &&
                  styles.modeTextActive,
                ]}
              >
                Food
              </Text>
            </Pressable>
          </View>

          {/* Cart */}
          <Pressable
            style={styles.headerIcon}
            onPress={() =>
              router.push("/(tabs)/cart")
            }
          >
            <Ionicons
              name="cart-outline"
              size={20}
              color={COLORS.text}
            />
          </Pressable>
        </View>

        {/* Location row */}
        <View style={styles.locationRow}>
          <Pressable
            style={styles.locationButton}
            onPress={() => setShowLocation(true)}
          >
            <View style={styles.locationIcon}>
              <Ionicons
                name="location"
                size={18}
                color={COLORS.brand}
              />
            </View>

            <View style={styles.locationText}>
              <View style={styles.deliverRow}>
                <Text style={styles.deliverLabel}>
                  DELIVER TO
                </Text>

                {activeAddress?.is_default && (
                  <Text style={styles.defaultLabel}>
                    DEFAULT
                  </Text>
                )}
              </View>

              {locating && !detectedLocation ? (
                <View style={styles.addressTitleRow}>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.brand}
                  />

                  <Text style={styles.addressTitle}>
                    Detecting location...
                  </Text>
                </View>
              ) : (
                <View style={styles.addressTitleRow}>
                  <Text style={styles.addressTitle}>
                    {locationTitle}
                  </Text>

                  <Ionicons
                    name="chevron-down"
                    size={13}
                    color={COLORS.muted}
                  />
                </View>
              )}


              <Text
                style={styles.addressSubtitle}
                numberOfLines={1}
              >
                {locationSubtitle}
              </Text>
            </View>
          </Pressable>

          <View style={styles.headerRight}>
            <Pressable
              style={styles.notificationButton}
              onPress={() =>
                router.push("/(tabs)/account")
              }
            >
              <Ionicons
                name="notifications-outline"
                size={19}
                color={COLORS.text}
              />
            </Pressable>

            <View style={styles.eta}>
              <Ionicons
                name="time-outline"
                size={13}
                color={COLORS.green}
              />

              <Text style={styles.etaText}>
                {eta} min
              </Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <Pressable
          style={styles.search}
          onPress={() =>
            router.push("/(tabs)/search")
          }
        >
          <Ionicons
            name="search-outline"
            size={17}
            color={COLORS.muted}
          />

          <Text style={styles.searchPlaceholder}>
            {mode === "food"
              ? "Search biryani, dosa, pizza..."
              : 'Search "Krikart" — milk, atta, chai...'}
          </Text>

          <Ionicons
            name="options-outline"
            size={17}
            color={COLORS.muted}
          />
        </Pressable>
      </View>

      {/* ================= LOCATION SHEET ================= */}
      {showLocation && (
        <View style={styles.locationOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShowLocation(false)}
          />

          <View style={styles.locationSheet}>
            <View style={styles.sheetHandle} />

            <Text style={styles.sheetTitle}>
              Choose delivery location
            </Text>

            <Text style={styles.sheetSubtitle}>
              Select where you want your order delivered
            </Text>

            {/* Current location */}
            <Pressable
              style={styles.currentLocation}
              onPress={() => {
                setShowLocation(false);
              }}
            >
              <View style={styles.currentLocationIcon}>
                <Ionicons
                  name="navigate-outline"
                  size={20}
                  color={COLORS.brand}
                />
              </View>

              <View style={styles.locationOptionText}>
                <Text style={styles.locationOptionTitle}>
                  Use my current location
                </Text>

                <Text style={styles.locationOptionSub}>
                  Detect your delivery location
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={18}
                color={COLORS.muted}
              />
            </Pressable>

            {/* Saved addresses */}
            {addresses.map((address) => (
              <Pressable
                key={address.id}
                style={[
                  styles.savedAddress,
                  activeAddress?.id === address.id &&
                  styles.savedAddressActive,
                ]}
                onPress={() => {
                  setActiveAddress(address);
                  setShowLocation(false);
                }}
              >
                <Ionicons
                  name="location-outline"
                  size={19}
                  color={
                    activeAddress?.id === address.id
                      ? COLORS.brand
                      : COLORS.muted
                  }
                />

                <View
                  style={styles.savedAddressContent}
                >
                  <View style={styles.savedTitleRow}>
                    <Text
                      style={styles.savedAddressTitle}
                    >
                      {address.label}
                    </Text>

                    {address.is_default && (
                      <Text style={styles.defaultBadge}>
                        DEFAULT
                      </Text>
                    )}
                  </View>

                  <Text
                    style={styles.savedAddressText}
                    numberOfLines={2}
                  >
                    {address.line1},{" "}
                    {address.street} ·{" "}
                    {address.pincode}
                  </Text>
                </View>
              </Pressable>
            ))}

            <Pressable
              style={styles.addAddress}
              onPress={() => {
                setShowLocation(false);
                router.push("/(tabs)/account");
              }}
            >
              <Ionicons
                name="add"
                size={19}
                color={COLORS.brand}
              />

              <Text style={styles.addAddressText}>
                Add new address
              </Text>

              <Ionicons
                name="chevron-forward"
                size={17}
                color={COLORS.muted}
              />
            </Pressable>
          </View>
        </View>
      )}

      {/* ================= MAIN ================= */}
      <FlatList
        data={products}
        numColumns={2}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.productRow}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadHome(true)}
            tintColor={COLORS.brand}
            colors={[COLORS.brand]}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Food mode banner */}
            {mode === "food" && (
              <View style={styles.foodBanner}>
                <Ionicons
                  name="restaurant-outline"
                  size={16}
                  color={COLORS.blue}
                />

                <Text style={styles.foodBannerText}>
                  Hot & fresh from Krikart Kitchens
                </Text>
              </View>
            )}

            {/* ================= BANNERS ================= */}
            {banners.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={320}
                decelerationRate="fast"
                contentContainerStyle={
                  styles.bannerList
                }
              >
                {banners.map((banner, index) => (
                  <Pressable
                    key={banner.id ?? index}
                    style={styles.banner}
                    onPress={() => {
                      if (banner.link_category) {
                        router.push(
                          `/category/${banner.link_category}`
                        );
                      } else if (categories[0]) {
                        router.push(
                          `/category/${categories[0].id}`
                        );
                      }
                    }}
                  >
                    {banner.image ? (
                      <Image
                        source={{
                          uri: banner.image,
                        }}
                        style={styles.bannerImage}
                      />
                    ) : (
                      <View
                        style={styles.bannerFallback}
                      >
                        <Text
                          style={styles.bannerEmoji}
                        >
                          🛒
                        </Text>
                      </View>
                    )}

                    <View
                      style={styles.bannerOverlay}
                    />

                    <View
                      style={styles.bannerContent}
                    >
                      <Text
                        style={styles.bannerTitle}
                        numberOfLines={2}
                      >
                        {banner.title ??
                          "Fresh groceries delivered"}
                      </Text>

                      {banner.subtitle && (
                        <Text
                          style={
                            styles.bannerSubtitle
                          }
                          numberOfLines={2}
                        >
                          {banner.subtitle}
                        </Text>
                      )}

                      <Text style={styles.bannerCta}>
                        {banner.cta ?? "Shop now"} →
                      </Text>
                    </View>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            {/* ================= CATEGORIES ================= */}
            {categories.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View>
                    <Text
                      style={styles.sectionTitle}
                    >
                      {mode === "food"
                        ? "Cuisines & courses"
                        : "Shop by category"}
                    </Text>

                    <Text
                      style={styles.sectionSubtitle}
                    >
                      {mode === "food"
                        ? "Find your favourite food"
                        : "Everything you need, delivered"}
                    </Text>
                  </View>

                  <Pressable
                    onPress={() =>
                      router.push(
                        "/(tabs)/categories"
                      )
                    }
                  >
                    <Text style={styles.seeAll}>
                      See all
                    </Text>
                  </Pressable>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={
                    styles.categoryList
                  }
                >
                  {categories
                    .slice(0, 12)
                    .map((category) => (
                      <Pressable
                        key={category.id}
                        style={styles.category}
                        onPress={() =>
                          router.push(
                            `/category/${category.id}`
                          )
                        }
                      >
                        <View
                          style={
                            styles.categoryIcon
                          }
                        >
                          <Ionicons
                            name={getCategoryIcon(
                              category.name
                            )}
                            size={25}
                            color={COLORS.brand}
                          />
                        </View>

                        <Text
                          style={styles.categoryName}
                          numberOfLines={2}
                        >
                          {category.name}
                        </Text>
                      </Pressable>
                    ))}
                </ScrollView>
              </View>
            )}

            {/* ================= PRODUCT RAIL TITLE ================= */}
            <View style={styles.productsHeader}>
              <View>
                <Text style={styles.sectionTitle}>
                  Popular near you
                </Text>

                <Text
                  style={styles.sectionSubtitle}
                >
                  Fresh picks you might like
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  router.push(
                    "/(tabs)/categories"
                  )
                }
              >
                <Text style={styles.seeAll}>
                  View all
                </Text>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <ProductCard
              product={item}
              onPress={() =>
                router.push(
                  `/product/${item.id}`
                )
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons
              name="basket-outline"
              size={48}
              color={COLORS.muted}
            />

            <Text style={styles.emptyTitle}>
              Nothing here yet
            </Text>

            <Text style={styles.emptyText}>
              Check back soon for fresh products.
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },

  /* Header */
  header: {
    backgroundColor: "rgba(11,15,18,0.98)",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginTop: tabBar.height,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  topRow: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.brand,
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#111",
    fontSize: 23,
    fontWeight: "900",
  },

  modeSwitcher: {
    flexDirection: "row",
    padding: 4,
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  modeButton: {
    height: 31,
    paddingHorizontal: 13,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  modeButtonActive: {
    backgroundColor: COLORS.brand,
  },

  modeText: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: "800",
  },

  modeTextActive: {
    color: "#111",
  },

  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  /* Location */
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
  },

  locationButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },

  locationIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: COLORS.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },

  locationText: {
    flex: 1,
    minWidth: 0,
  },

  deliverRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  deliverLabel: {
    color: COLORS.muted,
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.8,
  },

  defaultLabel: {
    color: COLORS.green,
    fontSize: 8,
    fontWeight: "900",
  },

  addressTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },

  addressTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: "900",
    maxWidth: "80%",
  },

  addressSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 2,
  },

  headerRight: {
    alignItems: "flex-end",
    gap: 7,
    marginLeft: 8,
  },

  notificationButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.surface2,
    alignItems: "center",
    justifyContent: "center",
  },

  eta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(52,211,153,0.1)",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 20,
  },

  etaText: {
    color: COLORS.green,
    fontSize: 10,
    fontWeight: "900",
  },

  /* Search */
  search: {
    height: 45,
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 9,
  },

  searchPlaceholder: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
  },

  /* Food */
  foodBanner: {
    marginHorizontal: 16,
    marginTop: 13,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
    backgroundColor: "rgba(56,189,248,0.1)",
    borderWidth: 1,
    borderColor: "rgba(56,189,248,0.3)",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  foodBannerText: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "700",
  },

  /* Banners */
  bannerList: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingRight: 8,
  },

  banner: {
    width: 305,
    height: 145,
    borderRadius: 18,
    overflow: "hidden",
    marginRight: 11,
    backgroundColor: COLORS.surface2,
  },

  bannerImage: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },

  bannerFallback: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#D95630",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingRight: 35,
  },

  bannerEmoji: {
    fontSize: 65,
  },

  bannerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.42)",
  },

  bannerContent: {
    flex: 1,
    width: "65%",
    padding: 17,
    justifyContent: "center",
  },

  bannerTitle: {
    color: "#fff",
    fontSize: 18,
    lineHeight: 21,
    fontWeight: "900",
  },

  bannerSubtitle: {
    color: "rgba(255,255,255,0.78)",
    fontSize: 10,
    marginTop: 5,
  },

  bannerCta: {
    color: COLORS.brand,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 9,
  },

  /* Sections */
  section: {
    marginTop: 23,
  },

  sectionHeader: {
    paddingHorizontal: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 11,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "900",
  },

  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  seeAll: {
    color: COLORS.brand,
    fontSize: 11,
    fontWeight: "900",
  },

  /* Categories */
  categoryList: {
    paddingHorizontal: 16,
    paddingRight: 6,
  },

  category: {
    width: 70,
    alignItems: "center",
    marginRight: 13,
  },

  categoryIcon: {
    width: 57,
    height: 57,
    borderRadius: 18,
    backgroundColor: COLORS.brandSoft,
    borderWidth: 1,
    borderColor: "rgba(255,121,72,0.28)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 7,
  },

  categoryName: {
    color: COLORS.muted,
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },

  /* Products */
  productsHeader: {
    marginTop: 25,
    marginHorizontal: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },

  productRow: {
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },

  productWrapper: {
    width: "48%",
    marginBottom: 14,
  },

  listContent: {
    paddingBottom: 45,
  },

  empty: {
    paddingVertical: 60,
    alignItems: "center",
  },

  emptyTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
  },

  emptyText: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 5,
  },

  /* Location sheet */
  locationOverlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 100,
    backgroundColor: "rgba(0,0,0,0.68)",
    justifyContent: "flex-end",
  },

  locationSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    paddingBottom: 35,
    maxHeight: "75%",
  },

  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.border,
    alignSelf: "center",
    marginBottom: 18,
  },

  sheetTitle: {
    color: COLORS.text,
    fontSize: 19,
    fontWeight: "900",
  },

  sheetSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 4,
    marginBottom: 16,
  },

  currentLocation: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,121,72,0.4)",
    backgroundColor: COLORS.brandSoft,
    marginBottom: 9,
  },

  currentLocationIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "rgba(255,121,72,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },

  locationOptionText: {
    flex: 1,
    marginLeft: 11,
  },

  locationOptionTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  locationOptionSub: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
  },

  savedAddress: {
    flexDirection: "row",
    alignItems: "center",
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface2,
    marginBottom: 8,
  },

  savedAddressActive: {
    borderColor: COLORS.brand,
    backgroundColor: COLORS.brandSoft,
  },

  savedAddressContent: {
    flex: 1,
    marginLeft: 10,
  },

  savedTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  savedAddressTitle: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "800",
  },

  defaultBadge: {
    color: "#111",
    backgroundColor: COLORS.brand,
    fontSize: 7,
    fontWeight: "900",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 5,
  },

  savedAddressText: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 4,
  },

  addAddress: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.border,
    marginTop: 3,
  },

  addAddressText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: "800",
  },
});
