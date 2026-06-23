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
    <div className="rounded-xl border border-navy-100 bg-white px-3 py-2 shadow-md">
      {label != null && (
        <p className="mb-1 text-xs font-medium text-navy-500">{label}</p>
      )}
      <div className="space-y-0.5">
        {rows.map((r) => (
          <div key={r.key} className="flex items-center gap-2 text-sm">
            {r.color && (
              <span
                className="inline-block size-2.5 rounded-full"
                style={{ background: r.color }}
              />
            )}
            <span className="text-navy-400">{r.label}:</span>
            <span className="font-medium text-navy-800">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
