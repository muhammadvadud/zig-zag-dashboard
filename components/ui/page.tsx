"use client";

import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { FIELD_STATE_CLASSES } from "./index";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-navy-900">{title}</h1>
        {subtitle && <p className="text-sm text-navy-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Qidirish...",
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [local, setLocal] = useState(value);
  const t = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => setLocal(value), [value]);
  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
      <input
        value={local}
        onChange={(e) => {
          setLocal(e.target.value);
          if (t.current) clearTimeout(t.current);
          t.current = setTimeout(() => onChange(e.target.value), 350);
        }}
        placeholder={placeholder}
        className={cn(
          "w-full rounded-xl border border-navy-200 bg-white py-2 pl-9 pr-3 text-sm text-navy-800 placeholder:text-navy-300",
          FIELD_STATE_CLASSES
        )}
      />
    </div>
  );
}
