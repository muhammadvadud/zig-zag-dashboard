"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusSlice } from "@/lib/types";
import { num } from "@/lib/format";
import { BRAND, PALETTE, STATUS_COLOR, shade } from "./colors";
import { TooltipBox } from "./ChartTooltip";

export function StatusDonut({ items }: { items: StatusSlice[] }) {
  const data = (items ?? []).filter((s) => s.count > 0);
  const total = data.reduce((acc, s) => acc + s.count, 0);
  const colorOf = (s: StatusSlice, i: number) =>
    STATUS_COLOR[s.status] ?? PALETTE[i % PALETTE.length];

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div className="relative w-full sm:w-[46%]" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <defs>
              {data.map((s, i) => {
                const c = colorOf(s, i);
                return (
                  <linearGradient key={s.status} id={`donut-${i}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={shade(c, 0.18)} />
                    <stop offset="100%" stopColor={shade(c, -0.06)} />
                  </linearGradient>
                );
              })}
            </defs>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={94}
              paddingAngle={2.5}
              cornerRadius={5}
              stroke="#fff"
              strokeWidth={2.5}
            >
              {data.map((s, i) => (
                <Cell key={s.status} fill={`url(#donut-${i})`} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const p = payload[0].payload as StatusSlice;
                const share = total ? ((p.count / total) * 100).toFixed(1) : "0";
                return (
                  <TooltipBox
                    rows={[
                      {
                        key: "c",
                        label: p.label,
                        value: `${num(p.count)} · ${share}%`,
                        color: STATUS_COLOR[p.status] ?? BRAND.gold,
                      },
                    ]}
                  />
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight text-navy-900">{num(total)}</span>
          <span className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-navy-400">
            Jami buyurtma
          </span>
        </div>
      </div>

      <ul className="w-full space-y-1 sm:w-[54%]">
        {data.map((s, i) => {
          const share = total ? (s.count / total) * 100 : 0;
          return (
            <li
              key={s.status}
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-navy-50/70"
            >
              <span
                className="inline-block size-2.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ background: colorOf(s, i), boxShadow: `0 0 0 1px ${colorOf(s, i)}33` }}
              />
              <span className="flex-1 truncate text-navy-600">{s.label}</span>
              <span className="font-semibold tabular-nums text-navy-900">{num(s.count)}</span>
              <span className="w-12 shrink-0 text-right text-xs tabular-nums text-navy-400">
                {share.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
