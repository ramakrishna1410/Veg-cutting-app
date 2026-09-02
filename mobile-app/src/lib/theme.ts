// Matches admin-dashboard/src/styles/theme.css — same palette/type system,
// applied as React Native tokens since RN can't use CSS.
export const colors = {
  bg: "#FFFFFF",
  panel: "#F3F7ED",
  panel2: "#E4EEDA",
  sidebar: "#FBFBF6",
  accent: "#2F6B3C",
  accentBright: "#4C8C55",
  warm: "#E2A33D",
  warmBright: "#EDB458",
  text: "#1F2A1F",
  textMuted: "#6E7E6A",
  border: "rgba(47, 107, 60, 0.14)",
  danger: "#B3412C",
  dangerBg: "#FBEBE7",
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
    shadowColor: "#1F2A1F",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
};

// Rotating pastel tile palette for category/product cards — gives each tile
// a distinct color without needing per-category art.
export const tileColors = [
  { bg: "#E8F3E3", fg: "#2F6B3C" },
  { bg: "#FCEFDD", fg: "#B7791F" },
  { bg: "#E7EEFB", fg: "#2C5C8A" },
  { bg: "#FBEAE6", fg: "#B3412C" },
  { bg: "#F1E9FA", fg: "#6B4C9A" },
  { bg: "#E3F5F0", fg: "#1F7A63" },
];

export const chipColors: Record<string, { bg: string; fg: string }> = {
  pending: { bg: "#FBF1E0", fg: "#92650E" },
  confirmed: { bg: colors.panel2, fg: colors.accent },
  out_for_delivery: { bg: "#E5EEF7", fg: "#2C5C8A" },
  delivered: { bg: "#E5F1E6", fg: "#276B36" },
  cancelled: { bg: colors.dangerBg, fg: colors.danger },
  active: { bg: colors.panel2, fg: colors.accent },
  paused: { bg: "#FBF1E0", fg: "#92650E" },
};
