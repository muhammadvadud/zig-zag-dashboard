"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { Icon } from "./Icon";
import { cn } from "@/lib/cn";

export function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();

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

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
          {NAV.map((group, gi) => (
            <div key={gi}>
              {group.title && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-cream/35">
                  {group.title}
                </p>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const active =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onClose}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-150",
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
                            active ? "text-gold" : "text-cream/55 group-hover:text-cream/90"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
