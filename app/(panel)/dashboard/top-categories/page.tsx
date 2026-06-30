"use client";

import Link from "next/link";
import { ArrowLeft, Layers, CalendarDays } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/api";
import type { TopCategory } from "@/lib/types";
import { money, num } from "@/lib/format";
import { Card, Badge, Loading, ErrorState, EmptyState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";

interface Listed<T> { items: T[] }
type RankedCategory = TopCategory & { rank: number };

const PERIODS = [
  { label: "7 kun", days: 7 },
  { label: "30 kun", days: 30 },
  { label: "3 oy", days: 90 },
  { label: "6 oy", days: 180 },
  { label: "1 yil", days: 365 },
];

export default function TopCategoriesPage() {
  const [days, setDays] = useState(30);
  const { data, isLoading, error } = useApi<Listed<TopCategory>>(
    `/admin/stats/top-categories/?days=${days}`
  );
  const items: RankedCategory[] = (data?.items ?? []).map((c, i) => ({ ...c, rank: i + 1 }));

  const cols: Column<RankedCategory>[] = [
    {
      key: "rank",
      header: "#",
      render: (c) => (
        <span className={`font-bold tabular-nums ${c.rank <= 3 ? "text-gold-dark" : "text-navy-400"}`}>
          {c.rank}
        </span>
      ),
    },
    {
      key: "name",
      header: "Kategoriya",
      render: (c) => <span className="font-medium text-navy-800">{c.name}</span>,
    },
    {
      key: "qty",
      header: "Sotildi",
      align: "right",
      render: (c) => <Badge color="navy">{num(c.qty)} dona</Badge>,
    },
    {
      key: "revenue",
      header: "Daromad",
      align: "right",
      render: (c) => <span className="font-semibold text-navy-900">{money(c.revenue)}</span>,
    },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft className="size-4" /> Boshqaruv paneliga qaytish
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader title="Top kategoriyalar" subtitle="Daromad bo'yicha reytingli kategoriyalar" />
        <div className="flex items-center gap-1.5 rounded-xl border border-navy-100 bg-white p-1 shadow-sm shrink-0">
          <CalendarDays className="ml-2 size-4 text-navy-400" />
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                days === p.days
                  ? "bg-gold text-navy-900"
                  : "text-navy-500 hover:bg-navy-50 hover:text-navy-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <Loading />
        ) : error ? (
          <div className="p-5"><ErrorState error={error} /></div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={<Layers className="size-6" />}
            title="Ma'lumot yo'q"
            hint="Tanlangan davr uchun ma'lumotlar topilmadi"
          />
        ) : (
          <DataTable
            columns={cols}
            rows={items}
            rowKey={(c) => c.category + "-" + c.rank}
            empty="Ma'lumot yo'q"
          />
        )}
      </Card>
    </div>
  );
}
