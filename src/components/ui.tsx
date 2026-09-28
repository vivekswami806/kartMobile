import type { PropsWithChildren } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "@/types";
import { router, type Href } from "expo-router";
import { cartActions, getCartSummary, useCartStore } from "@/lib/cartStore";
import { formatCurrency } from "@/lib/utils";

export const palette = { bg: "#10151c", panel: "#1a222d", border: "#303a46", text: "#f7f8fa", muted: "#a2acb9", accent: "#ff7948", green: "#69d49c" };
export function navigate(path: string, replace = false) {
  if (replace) router.replace(path as Href);
  else router.push(path as Href);
}

export function Page({ title, children, action }: PropsWithChildren<{ title: string; action?: React.ReactNode }>) {
  return <View style={styles.page}><View style={styles.header}><Text style={styles.title}>{title}</Text>{action}</View>{children}</View>;
}

export function Loading() { return <View style={styles.center}><ActivityIndicator color={palette.accent} size="large" /></View>; }

export function Message({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return <View style={styles.center}><Text style={styles.muted}>{text}</Text>{onRetry && <Pressable onPress={onRetry} style={styles.secondary}><Text style={styles.text}>Try again</Text></Pressable>}</View>;
}

export function ProductCard({ product, onPress }: { product: Product; onPress: () => void }) {
  const cart = useCartStore();
  const quantity = cart.find((line) => line.product.id === product.id)?.quantity || 0;
  const image = product.image_url || product.image;
  return <View style={styles.card}>
    <Pressable onPress={onPress}>
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={[styles.image, styles.imagePlaceholder]}><Text style={styles.muted}>Krikart</Text></View>}
      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
      <Text style={styles.muted}>{product.unit || product.brand || ""}</Text>
    </Pressable>
    <View style={styles.row}><View><Text style={styles.price}>{formatCurrency(product.price)}</Text>{product.mrp && product.mrp > product.price ? <Text style={styles.strike}>{formatCurrency(product.mrp)}</Text> : null}</View>
      <Pressable style={styles.addButton} onPress={() => cartActions.add(product)}><Text style={styles.addText}>{quantity ? `+ ${quantity}` : "Add"}</Text></Pressable>
    </View>
  </View>;
}

export function CartTotals() {
  const { subtotal, count } = getCartSummary();
  return <View style={styles.totalRow}><Text style={styles.text}>Subtotal · {count} items</Text><Text style={styles.price}>{formatCurrency(subtotal)}</Text></View>;
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: palette.bg, paddingHorizontal: 16, }, header: { minHeight: 30, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, title: { color: palette.text, fontSize: 22, fontWeight: "800" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 14 }, muted: { color: palette.muted, fontSize: 13 }, text: { color: palette.text, fontSize: 14 }, card: { flex: 1, margin: 5, backgroundColor: palette.panel, borderRadius: 14, borderWidth: 1, borderColor: palette.border, padding: 10 }, image: { width: "100%", height: 112, borderRadius: 10, backgroundColor: "#252f3c" }, imagePlaceholder: { alignItems: "center", justifyContent: "center" }, productName: { color: palette.text, fontWeight: "700", marginTop: 8, minHeight: 38 }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 }, price: { color: palette.text, fontWeight: "800" }, strike: { color: palette.muted, textDecorationLine: "line-through", fontSize: 11 }, addButton: { backgroundColor: palette.accent, paddingVertical: 7, paddingHorizontal: 13, borderRadius: 9 }, addText: { color: "#1a1412", fontWeight: "800", fontSize: 12 }, secondary: { backgroundColor: palette.panel, padding: 12, borderRadius: 9 }, totalRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderColor: palette.border, paddingVertical: 16 },
});


// import type { PropsWithChildren } from "react";
// import {
//   ActivityIndicator,
//   Image,
//   Pressable,
//   StyleSheet,
//   Text,
//   View,
//   useWindowDimensions,
// } from "react-native";
// import type { Product } from "@/types";
// import { router, type Href } from "expo-router";
// import { cartActions, getCartSummary, useCartStore } from "@/lib/cartStore";
// import { formatCurrency } from "@/lib/utils";

// /* ============================================================================
//  * LIGHT PALETTE
//  * ========================================================================== */

// export const palette = {
//   bg: "#E6ECFF",
//   panel: "#FFFFFF",
//   card: "#FFFFFF",
//   border: "#C7D2FE",

//   text: "#111827",
//   muted: "#6B7280",

//   primary: "#DC143C",
//   accent: "#DC143C",

//   secondary: "#1B2A6B",
//   gold: "#FFD700",

//   green: "#228B22",
//   error: "#DC143C",

//   input: "#F3F4F6",
// };

// /* ============================================================================
//  * RESPONSIVE HELPERS
//  * ========================================================================== */

// export function getResponsive(width: number) {
//   const isSmall = width < 360;
//   const isMedium = width >= 360 && width < 600;
//   const isTablet = width >= 600;

//   return {
//     isSmall,
//     isMedium,
//     isTablet,

//     horizontalPadding: isTablet ? 28 : isSmall ? 12 : 16,

//     cardGap: isTablet ? 12 : 8,

//     productImageHeight: isTablet ? 180 : isSmall ? 105 : 125,

//     titleSize: isTablet ? 28 : isSmall ? 20 : 23,

//     bodySize: isTablet ? 16 : 14,
//   };
// }

// /* ============================================================================
//  * NAVIGATION
//  * ========================================================================== */

// export function navigate(path: string, replace = false) {
//   if (replace) {
//     router.replace(path as Href);
//   } else {
//     router.push(path as Href);
//   }
// }

// /* ============================================================================
//  * PAGE
//  * ========================================================================== */

// export function Page({
//   title,
//   children,
//   action,
// }: PropsWithChildren<{
//   title: string;
//   action?: React.ReactNode;
// }>) {
//   const { width } = useWindowDimensions();
//   const responsive = getResponsive(width);

//   return (
//     <View
//       style={[
//         styles.page,
//         {
//           paddingHorizontal: responsive.horizontalPadding,
//         },
//       ]}
//     >
//       <View style={styles.header}>
//         <Text
//           style={[
//             styles.title,
//             {
//               fontSize: responsive.titleSize,
//             },
//           ]}
//         >
//           {title}
//         </Text>

//         {action}
//       </View>

//       {children}
//     </View>
//   );
// }

// /* ============================================================================
//  * LOADING
//  * ========================================================================== */

// export function Loading() {
//   return (
//     <View style={styles.center}>
//       <ActivityIndicator color={palette.accent} size="large" />

//       <Text style={styles.loadingText}>Loading...</Text>
//     </View>
//   );
// }

// /* ============================================================================
//  * MESSAGE
//  * ========================================================================== */

// export function Message({
//   text,
//   onRetry,
// }: {
//   text: string;
//   onRetry?: () => void;
// }) {
//   return (
//     <View style={styles.center}>
//       <View style={styles.messageCard}>
//         <Text style={styles.messageText}>{text}</Text>

//         {onRetry ? (
//           <Pressable onPress={onRetry} style={styles.secondaryButton}>
//             <Text style={styles.secondaryButtonText}>Try again</Text>
//           </Pressable>
//         ) : null}
//       </View>
//     </View>
//   );
// }

// /* ============================================================================
//  * PRODUCT CARD
//  * ========================================================================== */

// export function ProductCard({
//   product,
//   onPress,
// }: {
//   product: Product;
//   onPress: () => void;
// }) {
//   const cart = useCartStore();

//   const quantity =
//     cart.find((line) => line.product.id === product.id)?.quantity || 0;

//   const image = product.image_url || product.image;

//   const { width } = useWindowDimensions();
//   const responsive = getResponsive(width);

//   return (
//     <View
//       style={[
//         styles.card,
//         {
//           margin: responsive.cardGap / 2,
//         },
//       ]}
//     >
//       <Pressable onPress={onPress}>
//         {image ? (
//           <Image
//             source={{ uri: image }}
//             style={[
//               styles.image,
//               {
//                 height: responsive.productImageHeight,
//               },
//             ]}
//             resizeMode="cover"
//           />
//         ) : (
//           <View
//             style={[
//               styles.image,
//               styles.imagePlaceholder,
//               {
//                 height: responsive.productImageHeight,
//               },
//             ]}
//           >
//             <Text style={styles.placeholderText}>Krikart</Text>
//           </View>
//         )}

//         <Text style={styles.productName} numberOfLines={2}>
//           {product.name}
//         </Text>

//         <Text style={styles.muted} numberOfLines={1}>
//           {product.unit || product.brand || ""}
//         </Text>
//       </Pressable>

//       <View style={styles.productBottom}>
//         <View>
//           <Text style={styles.price}>
//             {formatCurrency(product.price)}
//           </Text>

//           {product.mrp && product.mrp > product.price ? (
//             <Text style={styles.strike}>
//               {formatCurrency(product.mrp)}
//             </Text>
//           ) : null}
//         </View>

//         <Pressable
//           style={({ pressed }) => [
//             styles.addButton,
//             pressed && styles.pressed,
//           ]}
//           onPress={() => cartActions.add(product)}
//         >
//           <Text style={styles.addText}>
//             {quantity ? `+ ${quantity}` : "Add"}
//           </Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// /* ============================================================================
//  * CART TOTALS
//  * ========================================================================== */

// export function CartTotals() {
//   const { subtotal, count } = getCartSummary();

//   return (
//     <View style={styles.totalRow}>
//       <Text style={styles.totalLabel}>
//         Subtotal · {count} {count === 1 ? "item" : "items"}
//       </Text>

//       <Text style={styles.totalPrice}>
//         {formatCurrency(subtotal)}
//       </Text>
//     </View>
//   );
// }

// /* ============================================================================
//  * COMMON STYLES
//  * ========================================================================== */

// const styles = StyleSheet.create({
//   page: {
//     flex: 1,
//     backgroundColor: palette.bg,
//     paddingTop: 4,
//   },

//   header: {
//     minHeight: 48,
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "space-between",
//     marginBottom: 10,
//   },

//   title: {
//     color: palette.text,
//     fontWeight: "800",
//     letterSpacing: -0.3,
//   },

//   center: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "center",
//     padding: 24,
//     gap: 12,
//   },

//   loadingText: {
//     color: palette.muted,
//     fontSize: 13,
//   },

//   muted: {
//     color: palette.muted,
//     fontSize: 13,
//   },

//   text: {
//     color: palette.text,
//     fontSize: 14,
//   },

//   messageCard: {
//     width: "100%",
//     maxWidth: 420,
//     backgroundColor: palette.panel,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: palette.border,
//     padding: 20,
//     alignItems: "center",
//     gap: 14,

//     shadowColor: "#1B2A6B",
//     shadowOffset: {
//       width: 0,
//       height: 3,
//     },
//     shadowOpacity: 0.08,
//     shadowRadius: 8,
//     elevation: 2,
//   },

//   messageText: {
//     color: palette.muted,
//     fontSize: 14,
//     textAlign: "center",
//     lineHeight: 20,
//   },

//   secondaryButton: {
//     backgroundColor: "#E6ECFF",
//     borderColor: palette.border,
//     borderWidth: 1,
//     borderRadius: 10,
//     paddingHorizontal: 18,
//     paddingVertical: 10,
//   },

//   secondaryButtonText: {
//     color: palette.secondary,
//     fontWeight: "700",
//   },

//   card: {
//     flex: 1,
//     backgroundColor: palette.card,
//     borderRadius: 16,
//     borderWidth: 1,
//     borderColor: palette.border,
//     padding: 10,

//     shadowColor: "#1B2A6B",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.07,
//     shadowRadius: 7,
//     elevation: 2,
//   },

//   image: {
//     width: "100%",
//     borderRadius: 12,
//     backgroundColor: "#E6ECFF",
//   },

//   imagePlaceholder: {
//     alignItems: "center",
//     justifyContent: "center",
//   },

//   placeholderText: {
//     color: palette.secondary,
//     fontWeight: "800",
//     fontSize: 14,
//   },

//   productName: {
//     color: palette.text,
//     fontWeight: "700",
//     fontSize: 14,
//     marginTop: 9,
//     minHeight: 38,
//     lineHeight: 19,
//   },

//   productBottom: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 10,
//   },

//   price: {
//     color: palette.text,
//     fontWeight: "800",
//     fontSize: 15,
//   },

//   strike: {
//     color: palette.muted,
//     textDecorationLine: "line-through",
//     fontSize: 11,
//     marginTop: 2,
//   },

//   addButton: {
//     backgroundColor: palette.accent,
//     paddingVertical: 8,
//     paddingHorizontal: 14,
//     borderRadius: 10,
//     minWidth: 52,
//     alignItems: "center",
//   },

//   addText: {
//     color: "#FFFFFF",
//     fontWeight: "800",
//     fontSize: 12,
//   },

//   pressed: {
//     opacity: 0.75,
//     transform: [{ scale: 0.97 }],
//   },

//   totalRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderTopWidth: 1,
//     borderColor: palette.border,
//     paddingVertical: 16,
//     marginTop: 8,
//   },

//   totalLabel: {
//     color: palette.text,
//     fontWeight: "700",
//     fontSize: 14,
//   },

//   totalPrice: {
//     color: palette.secondary,
//     fontWeight: "800",
//     fontSize: 17,
//   },
// });

