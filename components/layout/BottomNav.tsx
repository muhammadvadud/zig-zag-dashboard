"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

// Primary destinations surfaced as a phone bottom tab bar.
// The full navigation stays reachable via the "Ko'proq" button (opens the sidebar).
const ITEMS = [
  { label: "Asosiy", href: "/dashboard", icon: "LayoutDashboard" },
  { label: "Buyurtma", href: "/orders", icon: "ClipboardList" },
  { label: "Mahsulot", href: "/products", icon: "Package" },
  { label: "Mijozlar", href: "/users", icon: "Users" },
];

export function BottomNav({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-navy-100 bg-cream/90 shadow-[0_-4px_20px_-8px_rgb(19_31_56_/_0.18)] backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-label="Asosiy navigatsiya"
    >
      <div className="mx-auto flex max-w-md items-stretch justify-around px-1">
        {ITEMS.map((it) => {
          const active = isActive(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium transition-colors",
                active ? "text-gold-dark" : "text-navy-400"
              )}
            >
              <span
                className={cn(
                  "flex h-8 w-12 items-center justify-center rounded-full transition-colors",
                  active ? "bg-gold/15 text-gold-dark" : "text-navy-500"
                )}
              >
                <Icon name={it.icon} className="size-5" />
              </span>
              {it.label}
            </Link>
          );
        })}
        <button
          onClick={onMenu}
          aria-label="Barcha bo'limlar"
          className="flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-medium text-navy-400 transition-colors active:text-gold-dark"
        >
          <span className="flex h-8 w-12 items-center justify-center rounded-full text-navy-500">
            <Icon name="Menu" className="size-5" />
          </span>
          Ko&apos;proq
        </button>
      </div>
    </nav>
  );
}
