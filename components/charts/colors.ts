// Brand colors for recharts. Mirrors globals.css tokens.
export const BRAND = {
  navy: "#1a2a4a",
  navy600: "#36486f",
  navy400: "#6c83a8",
  navy200: "#c3cede",
  navy100: "#e2e8f0",
  gold: "#c9a769",
  goldDark: "#a8873f",
  goldLight: "#e0c89a",
  cream: "#f6f1e7",
  ok: "#16a34a",
  warn: "#d97706",
  danger: "#dc2626",
  info: "#2563eb",
};

// Palette used for pie/donut and multi-series charts.
export const PALETTE = [
  BRAND.gold,
  BRAND.navy,
  BRAND.info,
  BRAND.ok,
  BRAND.warn,
  BRAND.navy400,
  BRAND.goldDark,
  BRAND.danger,
  BRAND.navy600,
  BRAND.goldLight,
];

// Order-status → color so the donut matches StatusBadge semantics.
export const STATUS_COLOR: Record<string, string> = {
  pending: BRAND.warn,
  paid: BRAND.ok,
  processing: BRAND.info,
  measuring: BRAND.info,
  sewing: BRAND.gold,
  shipped: BRAND.navy,
  completed: BRAND.ok,
  cancelled: BRAND.danger,
  refunded: BRAND.danger,
};
