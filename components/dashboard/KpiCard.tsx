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
        "group relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        accent
          ? "border-navy-700 bg-navy-900 text-cream"
          : "border-navy-100 bg-white"
      )}
    >
      {accent && (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-gold/10 blur-2xl"
        />
      )}

      <div className="relative flex items-start justify-between gap-3">
        {icon && (
          <span
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors",
              accent
                ? "bg-white/10 text-gold-light"
                : "bg-gold/15 text-gold-dark group-hover:bg-gold/25"
            )}
          >
            {icon}
          </span>
        )}

        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold",
              accent
                ? up
                  ? "bg-green-400/15 text-green-300"
                  : "bg-red-400/15 text-red-300"
                : up
                  ? "bg-green-600/10 text-green-700"
                  : "bg-red-600/10 text-red-700"
            )}
          >
            <span aria-hidden>{up ? "↑" : "↓"}</span>
            <span>{pct(delta)}</span>
          </span>
        )}
      </div>

      <p
        className={cn(
          "relative mt-4 text-xs font-semibold uppercase tracking-wide",
          accent ? "text-cream/60" : "text-navy-400"
        )}
      >
        {label}
      </p>

      <p
        className={cn(
          "relative mt-1 text-2xl font-bold tracking-tight",
          accent ? "text-cream" : "text-navy-900"
        )}
      >
        {value}
      </p>

      {hasDelta && (
        <p
          className={cn(
            "relative mt-2 text-xs font-normal",
            accent ? "text-cream/50" : "text-navy-400"
          )}
        >
          o'tgan davrga nisbatan
        </p>
      )}
    </div>
  );
}
