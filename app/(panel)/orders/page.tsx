"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Package, User, Calendar } from "lucide-react";

import { cn } from "@/lib/cn";
import { useApi } from "@/lib/api";
import type { AdminOrderRow, OrderStatus, Paginated } from "@/lib/types";
import { money, fmtDate } from "@/lib/format";

import {
  Card,
  Select,
  Badge,
  StatusBadge,
  PaymentBadge,
  ErrorState,
  Loading,
  EmptyState,
} from "@/components/ui";
import { Pagination } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";

const PAGE_SIZE = 20;

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "To'lanmagan" },
  { value: "paid", label: "To'langan" },
  { value: "failed", label: "Xato" },
  { value: "refunded", label: "Qaytarilgan" },
];

type StatusCounts = Record<OrderStatus, number>;

interface Tab {
  key: string;
  label: string;
  statuses: OrderStatus[];
}

// "Hammasi" has no status filter (statuses: []); every other tab groups a
// few backend statuses under one human-friendly bucket.
const TABS: Tab[] = [
  { key: "all", label: "Hammasi", statuses: [] },
  { key: "new", label: "Yangi", statuses: ["pending", "paid"] },
  { key: "in_progress", label: "Jarayonda", statuses: ["processing", "measuring"] },
  { key: "sewing", label: "Tikuvda", statuses: ["sewing"] },
  { key: "shipped", label: "Jo'natildi", statuses: ["shipped"] },
  { key: "completed", label: "Yakunlangan", statuses: ["completed"] },
  { key: "cancelled", label: "Bekor qilingan", statuses: ["cancelled", "refunded"] },
];

function tabCount(tab: Tab, counts: StatusCounts | undefined): number {
  if (!counts) return 0;
  if (tab.statuses.length === 0) {
    return Object.values(counts).reduce((sum, n) => sum + n, 0);
  }
  return tab.statuses.reduce((sum, s) => sum + (counts[s] ?? 0), 0);
}

export default function OrdersPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(TABS[0]);
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: counts } = useApi<StatusCounts>("/admin/orders/status-counts/", {
    refreshInterval: 30000,
  });

  const qs = new URLSearchParams();
  if (tab.statuses.length > 0) qs.set("status__in", tab.statuses.join(","));
  if (paymentStatus) qs.set("payment_status", paymentStatus);
  if (search) qs.set("search", search);
  qs.set("page", String(page));

  const { data, error, isLoading } = useApi<Paginated<AdminOrderRow>>(
    `/admin/orders/?${qs.toString()}`
  );

  const rows = data?.results ?? [];

  function selectTab(t: Tab) {
    setTab(t);
    setPage(1);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Buyurtmalar" />

      {/* ---- Status tabs ---- */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const active = t.key === tab.key;
          const n = tabCount(t, counts);
          return (
            <button
              key={t.key}
              onClick={() => selectTab(t)}
              className={cn(
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-navy-800 text-cream shadow-sm"
                  : "border border-navy-200 bg-white text-navy-600 hover:bg-navy-50"
              )}
            >
              {t.label}
              <span
                className={cn(
                  "flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-semibold leading-none",
                  active ? "bg-white/15 text-cream" : "bg-navy-100 text-navy-500"
                )}
              >
                {n}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi (to&apos;lov)</option>
          {PAYMENT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Raqam yoki mijoz..."
          className="min-w-[220px] flex-1"
        />
      </div>

      {error ? (
        <Card>
          <div className="p-5">
            <ErrorState error={error} />
          </div>
        </Card>
      ) : isLoading ? (
        <Card>
          <Loading />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState icon={<Package className="size-6" />} title="Buyurtmalar topilmadi" />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((o) => (
              <button
                key={o.order_number}
                onClick={() => router.push(`/orders/${o.order_number}`)}
                className="group relative overflow-hidden rounded-2xl border border-navy-100/80 bg-white p-5 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card-hover"
              >
                <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-gold/15 to-transparent blur-xl" />

                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 text-gold-dark ring-1 ring-gold/20">
                    <Package className="size-5" />
                  </span>
                  <div className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={o.status} />
                    <PaymentBadge status={o.payment_status} />
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="truncate text-base font-semibold text-navy-800">
                    {o.order_number}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 truncate text-sm text-navy-400">
                    <User className="size-3.5 shrink-0" />
                    {o.customer || "—"}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-3">
                  <div className="flex items-center gap-3 text-xs text-navy-400">
                    <Badge color="navy">{o.items_count} ta</Badge>
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {fmtDate(o.created_at)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-navy-800">{money(o.total)}</span>
                </div>
              </button>
            ))}
          </div>

          <Card>
            <Pagination page={page} count={data?.count ?? 0} pageSize={PAGE_SIZE} onPage={setPage} />
          </Card>
        </>
      )}
    </div>
  );
}
