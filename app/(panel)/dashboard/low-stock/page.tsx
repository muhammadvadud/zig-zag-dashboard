"use client";

import Link from "next/link";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useApi } from "@/lib/api";
import type { LowStockItem } from "@/lib/types";
import { num } from "@/lib/format";
import { Card, Badge, Loading, ErrorState, EmptyState, Button } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";

interface Listed<T> { items: T[] }

const THRESHOLDS = [5, 10, 20, 50];

export default function LowStockPage() {
  const [threshold, setThreshold] = useState(10);
  const { data, isLoading, error } = useApi<Listed<LowStockItem>>(
    `/admin/stats/low-stock/?threshold=${threshold}`
  );
  const items = data?.items ?? [];

  const cols: Column<LowStockItem>[] = [
    {
      key: "name",
      header: "Mahsulot",
      render: (r) => (
        <Link
          href={`/products/${r.slug}/edit`}
          className="font-medium text-navy-800 hover:text-gold-dark"
        >
          {r.name}
        </Link>
      ),
    },
    { key: "slug", header: "Slug", render: (r) => <span className="text-navy-400">{r.slug}</span> },
    {
      key: "stock",
      header: "Qoldiq",
      align: "right",
      render: (r) => (
        <Badge color={r.stock <= 0 ? "red" : r.stock <= 5 ? "amber" : "gold"}>
          {num(r.stock)} dona
        </Badge>
      ),
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) => (
        <Link href={`/products/${r.slug}/edit`}>
          <Button variant="outline" className="text-xs px-3 py-1.5">
            Tahrirlash
          </Button>
        </Link>
      ),
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
        <PageHeader
          title="Kam qolgan mahsulotlar"
          subtitle="Stok chegarasidan past mahsulotlar ro'yxati"
        />
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-navy-500">Chegara:</span>
          {THRESHOLDS.map((t) => (
            <button
              key={t}
              onClick={() => setThreshold(t)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors border ${
                threshold === t
                  ? "bg-gold text-navy-900 border-transparent"
                  : "border-navy-200 text-navy-600 hover:border-navy-300 bg-white"
              }`}
            >
              ≤ {t}
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
            icon={<AlertTriangle className="size-6" />}
            title="Hammasi yetarli"
            hint={`Stok ${threshold} donadan kam bo'lgan mahsulot topilmadi`}
          />
        ) : (
          <DataTable
            columns={cols}
            rows={items}
            rowKey={(r) => r.id}
            empty="Ma'lumot yo'q"
          />
        )}
      </Card>
    </div>
  );
}
