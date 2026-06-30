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
        "group card-lift animate-rise relative flex flex-col overflow-hidden rounded-2xl border p-4 hover:shadow-card-hover sm:p-6",
        accent
          ? "border-navy-700 bg-gradient-to-br from-navy-800 via-navy-900 to-navy-900 text-cream shadow-card-hover"
          : "border-navy-100/80 bg-white/95 shadow-soft hover:-translate-y-0.5"
      )}
    >
      {/* decorative glow */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -right-12 -top-12 size-36 rounded-full blur-2xl transition-opacity",
          accent ? "bg-gold/20" : "bg-gold/0 group-hover:bg-gold/10"
        )}
      />
      {/* gold top accent line */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px",
          accent
            ? "bg-gradient-to-r from-transparent via-gold/60 to-transparent"
            : "bg-gradient-to-r from-transparent via-gold/30 to-transparent"
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        {icon && (
          <span
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors sm:size-12",
              accent
                ? "bg-white/10 text-gold-light ring-1 ring-white/10"
                : "bg-gold/12 text-gold-dark ring-1 ring-gold/15 group-hover:bg-gold/20"
            )}
          >
            {icon}
          </span>
        )}

        {hasDelta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold tracking-tight sm:px-2.5 sm:py-1 sm:text-xs",
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
          "relative mt-3.5 text-[10px] font-semibold uppercase tracking-[0.1em] sm:mt-5 sm:text-[11px] sm:tracking-[0.12em]",
          accent ? "text-cream/55" : "text-navy-400"
        )}
      >
        {label}
      </p>

      <p
        className={cn(
          "relative mt-1 text-xl font-bold leading-tight tracking-tight tabular-nums break-words sm:mt-1.5 sm:text-3xl sm:leading-none",
          accent ? "text-cream" : "text-navy-900"
        )}
      >
        {value}
      </p>

      {hasDelta && (
        <p
          className={cn(
            "relative mt-2 text-[11px] sm:mt-2.5 sm:text-xs",
            accent ? "text-cream/50" : "text-navy-400"
          )}
        >
          o&apos;tgan davrga nisbatan
        </p>
      )}
    </div>
  );
}
