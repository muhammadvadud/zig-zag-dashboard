"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { filterNav } from "@/lib/nav";
import { useAuth } from "@/lib/auth";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

const STORAGE_KEY = "zigzag.sidebar.collapsed";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const groups = useMemo(() => filterNav(user?.role), [user?.role]);

  // Which titled groups are collapsed (by title). Default: all expanded.
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [hydrated, setHydrated] = useState(false);

  // Restore persisted collapse state once on mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCollapsed(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
    setHydrated(true);
  }, []);

  // Persist whenever the collapse state changes (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(collapsed));
    } catch {
      // ignore quota/availability errors
    }
  }, [collapsed, hydrated]);

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  // Title of the group that holds the active route (so we can force it open).
  const activeGroupTitle = groups.find(
    (g) => g.title && g.items.some((i) => isActive(i.href))
  )?.title;

  const toggle = (title: string) =>
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <>
      {/* mobile overlay */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-navy-900/40 lg:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-gradient-to-b from-navy-800 to-navy-900 text-cream shadow-xl transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10 shrink-0">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold-light to-gold-dark text-navy-900 font-bold shadow-md ring-1 ring-white/20">
            Z
          </div>
          <div>
            <p className="font-semibold leading-tight tracking-tight">ZigZag</p>
            <p className="text-[11px] text-cream/50 leading-tight">Admin panel</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5">
          {groups.map((group, gi) => {
            const renderLink = (item: (typeof group.items)[number]) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-150",
                      active
                        ? "bg-gold/15 font-semibold text-gold-light"
                        : "text-cream/75 hover:bg-white/10 hover:text-cream"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-gold transition-all duration-150",
                        active ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      )}
                    />
                    <Icon
                      name={item.icon}
                      className={cn(
                        "size-4.5 shrink-0 transition-colors",
                        active
                          ? "text-gold"
                          : "text-cream/55 group-hover:text-cream/90"
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            };

            // The empty-title group (Dashboard) is always shown, not collapsible.
            if (!group.title) {
              return (
                <div key={gi} className="pb-1.5 mb-1.5 border-b border-white/5">
                  <ul className="space-y-1">{group.items.map(renderLink)}</ul>
                </div>
              );
            }

            const forcedOpen = group.title === activeGroupTitle;
            const isCollapsed = !forcedOpen && !!collapsed[group.title];

            return (
              <div key={gi}>
                <button
                  type="button"
                  onClick={() => toggle(group.title)}
                  aria-expanded={!isCollapsed}
                  className="group flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream/35 transition-colors hover:text-cream/60"
                >
                  <span>{group.title}</span>
                  <Icon
                    name="ChevronDown"
                    className={cn(
                      "size-3.5 transition-transform duration-200",
                      isCollapsed ? "-rotate-90" : "rotate-0"
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200 ease-in-out",
                    isCollapsed
                      ? "grid-rows-[0fr] opacity-0"
                      : "grid-rows-[1fr] opacity-100"
                  )}
                >
                  <div className="overflow-hidden">
                    <ul className="space-y-1 pt-1 pb-1">
                      {group.items.map(renderLink)}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
