"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import type { StatusSlice } from "@/lib/types";
import { num } from "@/lib/format";
import { BRAND, PALETTE, STATUS_COLOR } from "./colors";
import { TooltipBox } from "./ChartTooltip";

export function StatusDonut({ items }: { items: StatusSlice[] }) {
  const data = (items ?? []).filter((s) => s.count > 0);
  const total = data.reduce((acc, s) => acc + s.count, 0);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="relative w-full sm:w-1/2" style={{ minWidth: 0 }}>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={92}
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
            >
              {data.map((s, i) => (
                <Cell key={s.status} fill={STATUS_COLOR[s.status] ?? PALETTE[i % PALETTE.length]} />
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
                        value: `${num(p.count)} (${share}%)`,
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
          <span className="text-2xl font-semibold text-navy-900">{num(total)}</span>
          <span className="text-xs text-navy-400">Jami</span>
        </div>
      </div>

      <ul className="w-full space-y-1.5 sm:w-1/2">
        {data.map((s, i) => (
          <li key={s.status} className="flex items-center gap-2 text-sm">
            <span
              className="inline-block size-2.5 shrink-0 rounded-full"
              style={{ background: STATUS_COLOR[s.status] ?? PALETTE[i % PALETTE.length] }}
            />
            <span className="flex-1 truncate text-navy-600">{s.label}</span>
            <span className="font-medium text-navy-800">{num(s.count)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
