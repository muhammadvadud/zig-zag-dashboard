"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, ClipboardList, Megaphone } from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type { Paginated } from "@/lib/types";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useToast } from "@/components/ui/toast";

interface NotificationRow {
  id: number;
  kind: "order_new" | "order_status";
  title: string;
  body: string;
  order_number: string | null;
  is_read: boolean;
  created_at: string;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const notify = useToast();

  // Poll the lightweight unread-count endpoint regardless of whether the
  // panel is open — this is what drives the badge.
  const { data: countData, mutate: mutateCount } = useApi<{ count: number }>(
    "/notifications/unread-count/",
    { refreshInterval: 30000 }
  );
  const unread = countData?.count ?? 0;

  // Only fetch the actual list while the dropdown is open (SWR key = null skips it).
  const { data, mutate } = useApi<Paginated<NotificationRow>>(
    open ? "/notifications/?page_size=15" : null,
    { refreshInterval: open ? 20000 : 0 }
  );
  const rows = data?.results ?? [];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function markRead(id: number) {
    try {
      await api(`/notifications/${id}/read/`, { method: "POST" });
      mutate();
      mutateCount();
    } catch (err) {
      notify((err as ApiError).message || "Xatolik yuz berdi", "error");
    }
  }

  async function markAll() {
    try {
      await api("/notifications/read-all/", { method: "POST" });
      mutate();
      mutateCount();
    } catch (err) {
      notify((err as ApiError).message || "Xatolik yuz berdi", "error");
    }
  }

  function onRowClick(n: NotificationRow) {
    if (!n.is_read) markRead(n.id);
    setOpen(false);
    if (n.order_number) router.push(`/orders/${n.order_number}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        title="Bildirishnomalar"
        aria-label="Bildirishnomalar"
        className="relative rounded-full border border-transparent p-2.5 text-navy-500 transition-colors hover:border-gold/20 hover:bg-gold/10 hover:text-gold-dark"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold leading-none text-white ring-2 ring-cream">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 max-w-[92vw] overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-xl animate-rise">
          <div className="flex items-center justify-between border-b border-navy-100 px-4 py-3">
            <h3 className="text-sm font-semibold text-navy-800">Bildirishnomalar</h3>
            {unread > 0 && (
              <button
                onClick={markAll}
                className="text-xs font-semibold text-gold-dark hover:underline"
              >
                Hammasini o&apos;qish
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {rows.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-navy-400">
                Bildirishnoma yo&apos;q
              </p>
            ) : (
              <ul className="divide-y divide-navy-50">
                {rows.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => onRowClick(n)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-navy-50/60",
                        !n.is_read && "bg-gold/[0.06]"
                      )}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl",
                          n.kind === "order_new"
                            ? "bg-gold/15 text-gold-dark"
                            : "bg-navy-100 text-navy-600"
                        )}
                      >
                        {n.kind === "order_new" ? (
                          <ClipboardList className="size-4" />
                        ) : (
                          <Megaphone className="size-4" />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-sm",
                            n.is_read ? "text-navy-600" : "font-semibold text-navy-800"
                          )}
                        >
                          {n.title}
                        </span>
                        {n.body && (
                          <span className="mt-0.5 line-clamp-2 block text-xs text-navy-400">
                            {n.body}
                          </span>
                        )}
                        <span className="mt-1 block text-[11px] text-navy-300">
                          {fmtDateTime(n.created_at)}
                        </span>
                      </span>
                      {!n.is_read && (
                        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-gold" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
