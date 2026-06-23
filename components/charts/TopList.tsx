"use client";

import { money, num } from "@/lib/format";
import { BRAND } from "./colors";

export interface TopListItem {
  key: string | number;
  name: string;
  qty: number;
  revenue: number;
}

// Ranked horizontal-bar list. Works for top products and top categories.
// `metric` decides which value drives the bar width and the headline number.
export function TopList({
  items,
  metric = "revenue",
}: {
  items: TopListItem[];
  metric?: "revenue" | "qty";
}) {
  const data = items ?? [];
  const max = Math.max(1, ...data.map((d) => (metric === "qty" ? d.qty : d.revenue)));

  return (
    <ul className="space-y-3">
      {data.map((d, i) => {
        const value = metric === "qty" ? d.qty : d.revenue;
        const w = Math.max(4, (value / max) * 100);
        return (
          <li key={d.key} className="flex items-center gap-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-lg bg-navy-50 text-xs font-semibold text-navy-500">
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium text-navy-800">{d.name}</span>
                <span className="shrink-0 text-sm font-semibold text-navy-900">
                  {metric === "qty" ? num(d.qty) : money(d.revenue)}
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-navy-50">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${w}%`, background: BRAND.gold }}
                  />
                </div>
                <span className="shrink-0 text-xs text-navy-400">
                  {metric === "qty" ? money(d.revenue) : `${num(d.qty)} dona`}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
