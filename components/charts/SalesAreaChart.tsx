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
import { BRAND, CHART } from "./colors";
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
      <AreaChart data={data} margin={{ top: 10, right: 14, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={BRAND.gold} stopOpacity={0.32} />
            <stop offset="55%" stopColor={BRAND.gold} stopOpacity={0.1} />
            <stop offset="100%" stopColor={BRAND.gold} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="salesStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={BRAND.goldDark} />
            <stop offset="50%" stopColor={BRAND.gold} />
            <stop offset="100%" stopColor={BRAND.goldLight} />
          </linearGradient>
          <filter id="salesGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor={BRAND.gold} floodOpacity="0.3" />
          </filter>
        </defs>
        <CartesianGrid strokeDasharray="4 6" stroke={CHART.grid} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fontSize: 11, fill: CHART.axis }}
          axisLine={false}
          tickLine={false}
          minTickGap={24}
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
          cursor={{ stroke: BRAND.gold, strokeWidth: 1.5, strokeDasharray: "4 4" }}
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
          type="natural"
          dataKey="revenue"
          stroke="url(#salesStroke)"
          strokeWidth={3}
          strokeLinecap="round"
          fill="url(#salesFill)"
          filter="url(#salesGlow)"
          dot={false}
          activeDot={{
            r: 5,
            fill: BRAND.gold,
            stroke: "#fff",
            strokeWidth: 2.5,
            style: { filter: "drop-shadow(0 2px 5px rgba(201,167,105,0.55))" },
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
