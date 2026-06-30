"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PaymentSlice } from "@/lib/types";
import { money, num } from "@/lib/format";
import { BRAND, PALETTE, CHART, shade } from "./colors";
import { TooltipBox } from "./ChartTooltip";

const PROVIDER_LABEL: Record<string, string> = {
  payme: "Payme",
  click: "Click",
  uzum: "Uzum",
  cash: "Naqd",
  card: "Karta",
  transfer: "O'tkazma",
};

function label(provider: string): string {
  return PROVIDER_LABEL[provider?.toLowerCase()] ?? provider ?? "—";
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function PaymentsBar({ items }: { items: PaymentSlice[] }) {
  const data = (items ?? []).map((p) => ({ ...p, label: label(p.provider) }));
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 14, left: 0, bottom: 0 }} barCategoryGap="28%">
        <defs>
          {data.map((_, i) => {
            const base = PALETTE[i % PALETTE.length];
            return (
              <linearGradient key={i} id={`barFill-${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={shade(base, 0.22)} />
                <stop offset="100%" stopColor={base} />
              </linearGradient>
            );
          })}
        </defs>
        <CartesianGrid strokeDasharray="4 6" stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: CHART.axis }}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
        <YAxis
          tickFormatter={compact}
          tick={{ fontSize: 11, fill: CHART.axis }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: CHART.cursorFill, radius: 8 }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as PaymentSlice & { label: string };
            return (
              <TooltipBox
                label={p.label}
                rows={[
                  { key: "amt", label: "Summa", value: money(p.amount), color: BRAND.gold },
                  { key: "cnt", label: "Soni", value: num(p.count), color: BRAND.navy },
                ]}
              />
            );
          }}
        />
        <Bar
          dataKey="amount"
          radius={[10, 10, 4, 4]}
          maxBarSize={52}
          background={{ fill: CHART.track, radius: 10 }}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={`url(#barFill-${i})`} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
