"use client";

import type { ReactNode } from "react";

// Shared tooltip shell so every chart has the same brand styling.
export function TooltipBox({
  label,
  rows,
}: {
  label?: ReactNode;
  rows: { key: string; label: string; value: ReactNode; color?: string }[];
}) {
  return (
    <div className="min-w-[9rem] rounded-xl border border-navy-100/80 bg-white/95 px-3.5 py-2.5 shadow-card-hover ring-1 ring-navy-900/5 backdrop-blur-sm">
      {label != null && (
        <p className="mb-1.5 border-b border-navy-50 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-navy-500">
          {label}
        </p>
      )}
      <div className="space-y-1">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-2 text-sm">
            {r.color && (
              <span
                className="inline-block size-2.5 shrink-0 rounded-full ring-2 ring-white"
                style={{ background: r.color, boxShadow: `0 0 0 1px ${r.color}33` }}
              />
            )}
            <span className="text-navy-400">{r.label}</span>
            <span className="ml-auto font-semibold tabular-nums text-navy-900">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
