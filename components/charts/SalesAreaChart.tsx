"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { SalesPoint } from "@/lib/types";
import { money, num, fmtDate } from "@/lib/format";
import { BRAND } from "./colors";
import { TooltipBox } from "./ChartTooltip";

function shortDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

function compact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return String(n);
}

export function SalesAreaChart({ points }: { points: SalesPoint[] }) {
  const data = points ?? [];
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.gold} stopOpacity={0.35} />
            <stop offset="100%" stopColor={BRAND.gold} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={BRAND.navy100} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fontSize: 11, fill: BRAND.navy400 }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tickFormatter={compact}
          tick={{ fontSize: 11, fill: BRAND.navy400 }}
          axisLine={false}
          tickLine={false}
          width={48}
        />
        <Tooltip
          cursor={{ stroke: BRAND.navy200, strokeWidth: 1 }}
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as SalesPoint;
            return (
              <TooltipBox
                label={fmtDate(String(label))}
                rows={[
                  { key: "rev", label: "Savdo", value: money(p.revenue), color: BRAND.gold },
                  { key: "ord", label: "Buyurtma", value: num(p.orders), color: BRAND.navy },
                ]}
              />
            );
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke={BRAND.gold}
          strokeWidth={2.5}
          fill="url(#salesFill)"
          dot={false}
          activeDot={{ r: 4, fill: BRAND.gold, stroke: "#fff", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
