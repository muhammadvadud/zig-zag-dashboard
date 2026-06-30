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

// Shared chart "chrome" tokens — subtle, on-brand axis/grid/cursor colors so
// every chart reads the same and avoids the flat "admin panel" look.
export const CHART = {
  grid: "#eceef4",
  axis: BRAND.navy400,
  cursor: BRAND.navy200,
  cursorFill: "rgba(26, 42, 74, 0.04)",
  track: "#eef1f6",
};

// Lighten/darken helpers for building gradient stops from a base hex.
function clamp(n: number) {
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function shade(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  const mix = (c: number) => (amount >= 0 ? c + (255 - c) * amount : c * (1 + amount));
  const toHex = (c: number) => clamp(c).toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}
