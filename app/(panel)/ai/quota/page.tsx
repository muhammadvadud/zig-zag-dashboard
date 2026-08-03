"use client";

import { useState } from "react";
import { useApi } from "@/lib/api";
import { num, fmtDateTime } from "@/lib/format";
import { Card, Badge, ErrorState } from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";
import type { Paginated, AdminTokenUsage } from "@/lib/types";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 20;

function UsageBar({ percent }: { percent: number }) {
  const clamped = Math.min(percent, 100);
  const color =
    clamped >= 85 ? "bg-danger" : clamped >= 60 ? "bg-warn" : "bg-ok";

  return (
    <div className="w-full min-w-[120px]">
      <div className="mb-1 flex justify-between text-[11px]">
        <span className="font-semibold tabular-nums text-navy-800">
          {percent.toFixed(1)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
        <div
          className={cn("h-full rounded-full transition-all duration-500", color)}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

export default function QuotaPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (search) qs.set("search", search);

  const { data, isLoading, error } = useApi<Paginated<AdminTokenUsage>>(
    `/admin/ai/token-usage/?${qs.toString()}`
  );

  const rows = data?.results ?? [];

  const columns: Column<AdminTokenUsage>[] = [
    {
      key: "user",
      header: "Foydalanuvchi",
      render: (row) => (
        <div>
          <div className="font-medium text-navy-800">
            {row.user_name || "—"}
          </div>
          <div className="text-[11px] text-navy-400">{row.user_phone}</div>
        </div>
      ),
    },
    {
      key: "period",
      header: "Davr",
      render: (row) => (
        <Badge color="navy" className="font-mono text-[11px]">
          {row.period}
        </Badge>
      ),
    },
    {
      key: "usage",
      header: "Foydalanish",
      render: (row) => (
        <div className="space-y-0.5">
          <UsageBar percent={row.usage_percent} />
          <div className="flex justify-between text-[10px] text-navy-400">
            <span>{num(row.tokens_used)}</span>
            <span>/ {num(row.token_limit)}</span>
          </div>
        </div>
      ),
    },
    {
      key: "messages_used",
      header: "Xabarlar",
      align: "center",
      render: (row) => (
        <span className="font-medium tabular-nums text-navy-700">
          {num(row.messages_used)}
        </span>
      ),
    },
    {
      key: "images_used",
      header: "Rasmlar",
      align: "center",
      hideOnMobile: true,
      render: (row) => (
        <span className="tabular-nums text-navy-700">
          {row.images_used}
          {row.image_limit > 0 && (
            <span className="text-navy-400"> / {row.image_limit}</span>
          )}
        </span>
      ),
    },
    {
      key: "conversations",
      header: "Suhbatlar",
      align: "center",
      hideOnMobile: true,
      render: (row) => (
        <span className="tabular-nums text-navy-700">
          {row.conversation_count}
        </span>
      ),
    },
    {
      key: "updated_at",
      header: "Yangilangan",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-navy-500">{fmtDateTime(row.updated_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="AI Kvota"
        subtitle="Foydalanuvchilar token sarfi va limitlari"
      />

      {/* ---- Search ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ism yoki telefon..."
          className="min-w-[220px] flex-1"
        />
      </div>

      {/* ---- Table ---- */}
      <Card>
        {error ? (
          <div className="p-5">
            <ErrorState error={error} />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              loading={isLoading}
              empty="Kvota ma'lumotlari topilmadi"
              rowKey={(r) => `${r.user_id}-${r.period}`}
            />
            <Pagination
              page={page}
              count={data?.count ?? 0}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </>
        )}
      </Card>
    </div>
  );
}
