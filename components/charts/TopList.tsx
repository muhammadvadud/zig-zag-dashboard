"use client";

import { money, num } from "@/lib/format";
import { BRAND } from "./colors";

// Rank chip styling — #1 gets the warm-gold treatment, the rest stay quiet navy.
function rankClass(i: number): string {
  if (i === 0)
    return "bg-gradient-to-br from-gold-light to-gold-dark text-white shadow-[0_2px_6px_-1px_rgba(168,135,63,0.5)]";
  if (i === 1) return "bg-navy-100 text-navy-700";
  if (i === 2) return "bg-cream-dark text-gold-dark";
  return "bg-navy-50 text-navy-500";
}

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
    <ul className="space-y-1">
      {data.map((d, i) => {
        const value = metric === "qty" ? d.qty : d.revenue;
        const w = Math.max(5, (value / max) * 100);
        const isTop = i === 0;
        return (
          <li
            key={d.key}
            className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-navy-50/60"
          >
            <span
              className={`flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${rankClass(i)}`}
            >
              {i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-navy-800">{d.name}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-navy-900">
                  {metric === "qty" ? num(d.qty) : money(d.revenue)}
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-2.5">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-navy-50">
                  <div
                    className="h-full rounded-full transition-[width] duration-500 ease-out"
                    style={{
                      width: `${w}%`,
                      background: isTop
                        ? `linear-gradient(90deg, ${BRAND.goldDark}, ${BRAND.gold} 60%, ${BRAND.goldLight})`
                        : `linear-gradient(90deg, ${BRAND.navy400}, ${BRAND.navy600})`,
                    }}
                  />
                </div>
                <span className="shrink-0 text-xs tabular-nums text-navy-400">
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
