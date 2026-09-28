import { Dimensions, PixelRatio, Platform } from "react-native";

export interface Theme {
  mode: "light" | "dark";

  background: string;
  cardBackground: string;
  buttonText: string;
  card: string;

  text: string;
  textSecondary: string;

  primary: string;
  secondary: string;
  accent: string;

  inputBackGround: string;

  success: string;
  errorColor: string;

  border: string;
}

/* ============================================================================
 * LIGHT THEME
 * ========================================================================== */

export const lightTheme: Theme = {
  mode: "light",

  background: "#E6ECFF",
  cardBackground: "#FFFFFF",
  card: "#FFFFFF",

  buttonText: "#FFFFFF",

  text: "#111827",
  textSecondary: "#6B7280",

  primary: "#111827",
  secondary: "#1B2A6B",
  accent: "#FFD700",

  inputBackGround: "#C7D2FE",

  success: "#2E8B57",
  errorColor: "#DC143C",

  border: "#C7D2FE",
};

/* ============================================================================
 * YELLOW
 * ========================================================================== */

export const yellow = {
  50: "#FFF8DC",
  100: "#FAE7B5",
  200: "#F5D98E",
  300: "#FFE082",
  400: "#FFD700",
  500: "#FFC107",
  600: "#E0A800",
  700: "#C69500",
  800: "#A77B00",
  900: "#8B7500",
};

/* ============================================================================
 * BLUE
 * ========================================================================== */

export const blue = {
  50: "#E6ECFF",
  100: "#C7D2FE",
  200: "#A5B4FC",
  300: "#818CF8",
  400: "#4C6EF5",
  500: "#1B2A6B",
  600: "#162454",
  700: "#0F1B3D",
  800: "#0C1633",
  900: "#0A1128",
};

/* ============================================================================
 * PINK
 * ========================================================================== */

export const pink = {
  50: "#FFF1F2",
  100: "#FFE4E6",
  200: "#FECDD3",
  300: "#FDA4AF",
  400: "#F87171",
  500: "#DC143C",
  600: "#B91C1C",
  700: "#991B1B",
  800: "#881337",
  900: "#7F1D1D",
};

/* ============================================================================
 * GREEN
 * ========================================================================== */

export const green = {
  50: "#ECFDF5",
  100: "#D1FAE5",
  200: "#A7F3D0",
  300: "#6EE7B7",
  400: "#34D399",
  500: "#228B22",
  600: "#1F7A1F",
  700: "#1F5E3B",
  800: "#14532D",
  900: "#064E3B",
};

/* ============================================================================
 * RED
 * ========================================================================== */

export const red = {
  50: "#FEF2F2",
  100: "#FEE2E2",
  200: "#FECACA",
  300: "#FCA5A5",
  400: "#F87171",
  500: "#EF4444",
  600: "#DC2626",
  700: "#B91C1C",
  800: "#991B1B",
  900: "#7F1D1D",
};

/* ============================================================================
 * PURPLE
 * ========================================================================== */

export const purple = {
  50: "#FAF5FF",
  100: "#F3E8FF",
  200: "#E9D5FF",
  300: "#D8B4FE",
  400: "#C084FC",
  500: "#A855F7",
  600: "#9333EA",
  700: "#7E22CE",
  800: "#6B21A8",
  900: "#581C87",
};

/* ============================================================================
 * VIOLET
 * ========================================================================== */

export const violet = {
  50: "#F5F3FF",
  100: "#EDE9FE",
  200: "#DDD6FE",
  300: "#C4B5FD",
  400: "#A78BFA",
  500: "#8B5CF6",
  600: "#7C3AED",
  700: "#6D28D9",
  800: "#5B21B6",
  900: "#4C1D95",
};

/* ============================================================================
 * AMBER
 * ========================================================================== */

export const amber = {
  50: "#FFFBEB",
  100: "#FEF3C7",
  200: "#FDE68A",
  300: "#FCD34D",
  400: "#FBBF24",
  500: "#F59E0B",
  600: "#D97706",
  700: "#B45309",
  800: "#92400E",
  900: "#78350F",
};

/* ============================================================================
 * SLATE
 * ========================================================================== */

export const slate = {
  50: "#F8FAFC",
  100: "#F1F5F9",
  200: "#E2E8F0",
  300: "#CBD5E1",
  400: "#94A3B8",
  500: "#64748B",
  600: "#475569",
  700: "#334155",
  800: "#1E293B",
  900: "#0F172A",
};

/* ============================================================================
 * GRAY
 * ========================================================================== */

export const gray = {
  50: "#F9FAFB",
  100: "#F3F4F6",
  200: "#E5E7EB",
  300: "#D1D5DB",
  400: "#9CA3AF",
  500: "#6B7280",
  600: "#4B5563",
  700: "#374151",
  800: "#1F2937",
  900: "#111827",
};

/* ============================================================================
 * COLOR COMBINATIONS
 * ========================================================================== */

export const colorCombinations = {
  primary: {
    light: pink[100],
    main: pink[500],
    dark: pink[900],
  },

  secondary: {
    light: blue[100],
    main: blue[500],
    dark: blue[900],
  },

  success: {
    light: green[100],
    main: green[500],
    dark: green[900],
  },

  warning: {
    light: amber[100],
    main: amber[500],
    dark: amber[900],
  },

  danger: {
    light: red[100],
    main: red[500],
    dark: red[900],
  },

  accent: {
    light: violet[100],
    main: violet[500],
    dark: violet[900],
  },

  info: {
    light: blue[100],
    main: blue[500],
    dark: blue[900],
  },

  neutral: {
    light: gray[100],
    main: gray[500],
    dark: gray[900],
  },
};

/* ============================================================================
 * GRADIENTS
 * ========================================================================== */

export const gradients = {
  primary: [pink[500], pink[600]],
  primaryReverse: [pink[600], pink[500]],

  secondary: [blue[500], blue[600]],
  secondaryReverse: [blue[600], blue[500]],

  success: [green[500], green[600]],
  successReverse: [green[600], green[500]],

  warning: [amber[500], amber[600]],
  warningReverse: [amber[600], amber[500]],

  danger: [red[500], red[600]],
  dangerReverse: [red[600], red[500]],

  accent: [violet[500], violet[600]],
  accentReverse: [violet[600], violet[500]],

  rainbow: [pink[500], violet[500], blue[500]],

  sunset: [red[500], amber[500], pink[500]],

  ocean: [blue[500], green[500], blue[600]],

  gold: [yellow[400], amber[500]],

  royal: [blue[500], violet[600]],
};

/* ============================================================================
 * RESPONSIVE SCREEN
 * ========================================================================== */

const { width, height } = Dimensions.get("window");

export const screen = {
  width,
  height,

  /**
   * Width as percentage of current screen
   *
   * wp(50) = 50% screen width
   */
  wp: (percentage: number) => (width * percentage) / 100,

  /**
   * Height as percentage of current screen
   *
   * hp(50) = 50% screen height
   */
  hp: (percentage: number) => (height * percentage) / 100,

  /**
   * Pixel scaling based on device density.
   */
  scale: (size: number) => PixelRatio.getPixelSizeForLayoutSize(size),

  /**
   * Small phones
   */
  isSmallPhone: width < 360,

  /**
   * Normal phones
   */
  isPhone: width >= 360 && width < 600,

  /**
   * Tablets
   */
  isTablet: width >= 600,

  /**
   * Short screen
   */
  isShortScreen: height < 700,

  /**
   * Tall screen
   */
  isTallScreen: height >= 800,
};

/* ============================================================================
 * RESPONSIVE SPACING
 * ========================================================================== */

export const spacing = {
  xs: screen.wp(1),
  sm: screen.wp(2),
  md: screen.wp(4),
  lg: screen.wp(6),
  xl: screen.wp(8),

  screenHorizontal: screen.wp(4),

  sectionTop: screen.hp(2.5),
  sectionBottom: screen.hp(2.5),
};

/* ============================================================================
 * RESPONSIVE TYPOGRAPHY
 * ========================================================================== */

export const typography = {
  xs: screen.isSmallPhone ? 9 : 10,
  sm: screen.isSmallPhone ? 11 : 12,
  md: screen.isSmallPhone ? 13 : 14,
  lg: screen.isSmallPhone ? 16 : 18,
  xl: screen.isSmallPhone ? 20 : 22,
  xxl: screen.isSmallPhone ? 24 : 28,

  title: screen.isSmallPhone ? 22 : 26,
  heading: screen.isSmallPhone ? 17 : 19,
  body: screen.isSmallPhone ? 13 : 14,
};

/* ============================================================================
 * RESPONSIVE CARD SIZES
 * ========================================================================== */

export const card = {
  /**
   * Two-column product card.
   *
   * Example:
   * width: card.productWidth
   */
  productWidth: screen.isSmallPhone
    ? screen.wp(44)
    : screen.wp(44.5),

  productImageHeight: screen.isSmallPhone
    ? screen.hp(14)
    : screen.hp(17),

  categorySize: screen.isSmallPhone
    ? 54
    : 60,

  borderRadius: 14,

  smallRadius: 10,

  largeRadius: 18,
};

/* ============================================================================
 * HEADER
 * ========================================================================== */

export const header = {
  height: screen.isSmallPhone ? 58 : 64,

  horizontalPadding: screen.wp(4),

  logoSize: screen.isSmallPhone ? 32 : 38,

  iconSize: screen.isSmallPhone ? 18 : 20,
};

/* ============================================================================
 * BOTTOM TAB BAR
 * ========================================================================== */

export const tabBar = {
  height: Platform.OS === "ios" ? 52 : 32,

  iconSize: 22,

  labelSize: 10,

  paddingBottom: Platform.OS === "ios" ? 20 : 6,
};

/* ============================================================================
 * COMMON UI
 * ========================================================================== */

export const radius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
};

export const shadow = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },

  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 8,
  },
};

export const COLORS = {
  bg: "#0B0F12",
  surface: "#141A20",
  surface2: "#1B222A",
  border: "#2A333D",
  text: "#FFFFFF",
  muted: "#8E99A7",
  brand: "#FF7948",
  brandSoft: "rgba(255,121,72,0.12)",
  green: "#34D399",
  blue: "#38BDF8",
};
