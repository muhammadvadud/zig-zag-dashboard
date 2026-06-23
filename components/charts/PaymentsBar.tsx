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
import { BRAND, PALETTE } from "./colors";
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
      <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={BRAND.navy100} vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: BRAND.navy400 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={compact}
          tick={{ fontSize: 11, fill: BRAND.navy400 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ fill: "#f3f5f9" }}
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
        <Bar dataKey="amount" radius={[8, 8, 0, 0]} maxBarSize={56}>
          {data.map((_, i) => (
            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
