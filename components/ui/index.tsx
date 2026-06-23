"use client";

import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, InputHTMLAttributes, SelectHTMLAttributes } from "react";

/* ----------------------------- Card ----------------------------- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-navy-100 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
      <div>
        <h3 className="text-navy-800 font-semibold">{title}</h3>
        {subtitle && <p className="text-sm text-navy-400 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ----------------------------- Button ----------------------------- */
type BtnVariant = "primary" | "gold" | "ghost" | "danger" | "outline";
export function Button({
  variant = "primary",
  className,
  loading,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: BtnVariant;
  loading?: boolean;
}) {
  const variants: Record<BtnVariant, string> = {
    primary: "bg-navy-800 text-cream hover:bg-navy-900 disabled:opacity-50",
    gold: "bg-gold text-navy-900 hover:bg-gold-dark disabled:opacity-50",
    ghost: "text-navy-600 hover:bg-navy-50",
    outline: "border border-navy-200 text-navy-700 hover:bg-navy-50",
    danger: "bg-danger text-white hover:opacity-90 disabled:opacity-50",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  );
}

/* ----------------------------- Inputs ----------------------------- */
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm text-navy-800 placeholder:text-navy-300 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30",
        className
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-800 outline-none focus:border-gold focus:ring-2 focus:ring-gold/30",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-navy-700 mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-navy-400 mt-1">{hint}</span>}
    </label>
  );
}

/* ----------------------------- Badges ----------------------------- */
export function Badge({
  children,
  color = "navy",
  className,
}: {
  children: React.ReactNode;
  color?: "navy" | "green" | "amber" | "red" | "blue" | "gold" | "gray";
  className?: string;
}) {
  const map: Record<string, string> = {
    navy: "bg-navy-50 text-navy-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    red: "bg-red-50 text-red-700",
    blue: "bg-blue-50 text-blue-700",
    gold: "bg-gold/15 text-gold-dark",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        map[color],
        className
      )}
    >
      {children}
    </span>
  );
}

const ORDER_STATUS: Record<string, { label: string; color: "green" | "amber" | "red" | "blue" | "navy" | "gold" }> = {
  pending: { label: "Kutilmoqda", color: "amber" },
  paid: { label: "To'langan", color: "green" },
  processing: { label: "Jarayonda", color: "blue" },
  measuring: { label: "O'lchovda", color: "blue" },
  sewing: { label: "Tikuvda", color: "gold" },
  shipped: { label: "Jo'natildi", color: "navy" },
  completed: { label: "Yakunlangan", color: "green" },
  cancelled: { label: "Bekor qilingan", color: "red" },
  refunded: { label: "Qaytarilgan", color: "red" },
};
const PAYMENT_STATUS: Record<string, { label: string; color: "green" | "amber" | "red" }> = {
  unpaid: { label: "To'lanmagan", color: "amber" },
  paid: { label: "To'langan", color: "green" },
  failed: { label: "Xato", color: "red" },
  refunded: { label: "Qaytarilgan", color: "red" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = ORDER_STATUS[status];
  if (!s) return <Badge color="gray">{status}</Badge>;
  return <Badge color={s.color}>{s.label}</Badge>;
}

export function PaymentBadge({ status }: { status: string }) {
  const s = PAYMENT_STATUS[status];
  if (!s) return <Badge color="gray">{status}</Badge>;
  return <Badge color={s.color}>{s.label}</Badge>;
}

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUS).map(([value, v]) => ({
  value,
  label: v.label,
}));

/* ----------------------------- Spinner / states ----------------------------- */
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-2 border-current border-t-transparent",
        className || "size-5"
      )}
    />
  );
}

export function Loading({ label = "Yuklanmoqda..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-navy-400">
      <Spinner /> <span>{label}</span>
    </div>
  );
}

export function EmptyState({
  title = "Ma'lumot yo'q",
  hint,
  icon,
}: {
  title?: string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="text-navy-200">{icon}</div>}
      <p className="text-navy-600 font-medium">{title}</p>
      {hint && <p className="text-sm text-navy-400">{hint}</p>}
    </div>
  );
}

export function ErrorState({ error }: { error: unknown }) {
  const msg = (error as Error)?.message || "Xatolik yuz berdi";
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-red-700">
      {msg}
    </div>
  );
}
