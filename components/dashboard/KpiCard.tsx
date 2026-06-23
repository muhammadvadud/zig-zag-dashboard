"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { pct } from "@/lib/format";

export function KpiCard({
  label,
  value,
  delta,
  icon,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  delta?: number | null;
  icon?: ReactNode;
  accent?: boolean;
}) {
  const hasDelta = delta != null && isFinite(delta);
  const up = hasDelta && (delta as number) >= 0;

  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm",
        accent
          ? "border-navy-700 bg-navy-800 text-cream"
          : "border-navy-100 bg-white"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p
          className={cn(
            "text-sm font-medium",
            accent ? "text-cream/70" : "text-navy-400"
          )}
        >
          {label}
        </p>
        {icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl",
              accent ? "bg-white/10 text-gold-light" : "bg-gold/15 text-gold-dark"
            )}
          >
            {icon}
          </span>
        )}
      </div>

      <p
        className={cn(
          "mt-2 text-2xl font-semibold tracking-tight",
          accent ? "text-cream" : "text-navy-900"
        )}
      >
        {value}
      </p>

      {hasDelta && (
        <p
          className={cn(
            "mt-2 inline-flex items-center gap-1 text-xs font-medium",
            up ? "text-green-600" : "text-red-600",
            accent && (up ? "text-green-300" : "text-red-300")
          )}
        >
          <span>{up ? "▲" : "▼"}</span>
          <span>{pct(delta)}</span>
          <span className={cn("font-normal", accent ? "text-cream/50" : "text-navy-400")}>
            o'tgan davrga nisbatan
          </span>
        </p>
      )}
    </div>
  );
}
