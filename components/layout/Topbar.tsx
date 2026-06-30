"use client";

import { Menu, LogOut, Search, User } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  // Derive initials from the name only; fall back to a person icon for
  // nameless accounts so we never render a stray "+" from the phone number.
  const name = (user?.full_name || "").trim();
  const initials = name
    ? name
        .split(/\s+/)
        .map((s) => s[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-100 bg-cream/80 px-4 shadow-sm backdrop-blur-md lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-navy-600 transition-colors hover:bg-navy-50 lg:hidden"
        aria-label="Menyu"
      >
        <Menu className="size-5" />
      </button>

      <div className="group relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-navy-300 transition-colors group-focus-within:text-gold" />
        <input
          placeholder="Qidirish..."
          className="w-full rounded-full border border-navy-200 bg-white/60 py-2 pl-10 pr-4 text-sm text-navy-800 shadow-sm outline-none transition-all placeholder:text-navy-400 focus:border-gold focus:bg-white focus:shadow-md focus:ring-2 focus:ring-gold/25"
        />
      </div>

      <div className="ml-auto flex items-center gap-2.5">
        <div className="flex items-center gap-2.5 rounded-full border border-navy-100 bg-white/60 py-1 pl-1 pr-3 shadow-sm transition-shadow hover:shadow-md">
          <div className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-sm font-semibold text-cream shadow-inner ring-1 ring-gold/20">
            {initials || <User className="size-4.5 text-gold-light" />}
          </div>
          <div className="hidden text-right leading-tight sm:block">
            <p className="text-sm font-semibold text-navy-800">
              {user?.full_name || user?.phone}
            </p>
            <p className="text-[11px] capitalize text-navy-400">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Chiqish"
          aria-label="Chiqish"
          className="rounded-full border border-transparent p-2.5 text-navy-500 transition-colors hover:border-danger/20 hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
