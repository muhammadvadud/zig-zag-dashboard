"use client";

import { Menu, LogOut, Search } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, logout } = useAuth();
  const initials = (user?.full_name || user?.phone || "A")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-navy-100 bg-cream/90 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onMenu}
        className="rounded-lg p-2 text-navy-600 hover:bg-navy-50 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
        <input
          placeholder="Qidirish..."
          className="w-full rounded-xl border border-navy-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gold focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-cream">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight text-navy-800">
              {user?.full_name || user?.phone}
            </p>
            <p className="text-[11px] capitalize leading-tight text-navy-400">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Chiqish"
          className="rounded-lg p-2 text-navy-500 hover:bg-navy-50 hover:text-danger"
        >
          <LogOut className="size-5" />
        </button>
      </div>
    </header>
  );
}
