// Mobile-only palette — diverged from admin-dashboard/src/styles/theme.css
// on purpose (2026-09 redesign): a vibrant purple primary for energy/appeal,
// with the original green kept as "leaf" — the secondary accent used for
// fresh/veg cues (badges, delivered states, category icon tints). The admin
// dashboard is a separate, unstyled-yet redesign candidate.
export const colors = {
  bg: "#FFFFFF",
  panel: "#F4F0FC",
  panel2: "#E7DCFA",
  sidebar: "#FBFBF6",
  accent: "#7C3AED",
  accentBright: "#9457F0",
  accentDeep: "#5B21B6",
  leaf: "#2F6B3C",
  leafBright: "#4C8C55",
  leafBg: "#E8F3E3",
  warm: "#E2A33D",
  warmBright: "#EDB458",
  text: "#221B33",
  textMuted: "#6F6485",
  border: "rgba(124, 58, 237, 0.14)",
  danger: "#C0392B",
  dangerBg: "#FBEAE6",
};

export const gradients = {
  primary: ["#7C3AED", "#9457F0"] as const,
  deep: ["#5B21B6", "#7C3AED"] as const,
  leaf: ["#2F6B3C", "#4C8C55"] as const,
};

export const fonts = {
  serif: "Newsreader_700Bold",
  serifMedium: "Newsreader_600SemiBold",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemiBold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
  mono: "IBMPlexMono_600SemiBold",
};

export const radii = { sm: 8, md: 10, lg: 14, xl: 18, pill: 999 };

export const shadow = {
  card: {
    shadowColor: "#221B33",
    shadowOpacity: 0.1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  button: {
    shadowColor: "#7C3AED",
    shadowOpacity: 0.28,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
};

// Rotating pastel tile palette for category/product cards — gives each tile
// a distinct color without needing per-category art.
export const tileColors = [
  { bg: "#F1E9FA", fg: "#6B21A8" },
  { bg: "#FCEFDD", fg: "#B7791F" },
  { bg: "#E7EEFB", fg: "#2C5C8A" },
  { bg: "#FBEAE6", fg: "#B3412C" },
  { bg: "#E8F3E3", fg: "#2F6B3C" },
  { bg: "#E3F5F0", fg: "#1F7A63" },
];

export const chipColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#FBF1E0", fg: "#92650E" },
  confirmed: { bg: colors.panel2, fg: colors.accent },
  out_for_delivery: { bg: "#E5EEF7", fg: "#2C5C8A" },
  delivered: { bg: colors.leafBg, fg: colors.leaf },
  cancelled: { bg: colors.dangerBg, fg: colors.danger },
  active: { bg: colors.panel2, fg: colors.accent },
  paused: { bg: "#FBF1E0", fg: "#92650E" },
};
