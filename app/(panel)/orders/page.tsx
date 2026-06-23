"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { useApi } from "@/lib/api";
import type { AdminOrderRow, Paginated } from "@/lib/types";
import { money, fmtDate } from "@/lib/format";

import {
  Card,
  Select,
  StatusBadge,
  PaymentBadge,
  ErrorState,
  ORDER_STATUS_OPTIONS,
} from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";

const PAGE_SIZE = 20;

const PAYMENT_OPTIONS = [
  { value: "unpaid", label: "To'lanmagan" },
  { value: "paid", label: "To'langan" },
  { value: "failed", label: "Xato" },
  { value: "refunded", label: "Qaytarilgan" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (paymentStatus) qs.set("payment_status", paymentStatus);
  if (search) qs.set("search", search);
  qs.set("page", String(page));

  const { data, error, isLoading } = useApi<Paginated<AdminOrderRow>>(
    `/admin/orders/?${qs.toString()}`
  );

  const rows = data?.results ?? [];

  const columns: Column<AdminOrderRow>[] = [
    {
      key: "order_number",
      header: "Raqam",
      render: (r) => (
        <span className="font-medium text-navy-800">{r.order_number}</span>
      ),
    },
    { key: "customer", header: "Mijoz", render: (r) => r.customer || "—" },
    {
      key: "status",
      header: "Holat",
      render: (r) => <StatusBadge status={r.status} />,
    },
    {
      key: "payment_status",
      header: "To'lov",
      render: (r) => <PaymentBadge status={r.payment_status} />,
    },
    {
      key: "items_count",
      header: "Mahsulot soni",
      align: "center",
      render: (r) => r.items_count,
    },
    {
      key: "total",
      header: "Summa",
      align: "right",
      render: (r) => (
        <span className="font-medium text-navy-800">{money(r.total)}</span>
      ),
    },
    {
      key: "created_at",
      header: "Sana",
      render: (r) => fmtDate(r.created_at),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Buyurtmalar" />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi (holat)</option>
          {ORDER_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          value={paymentStatus}
          onChange={(e) => {
            setPaymentStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi (to'lov)</option>
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
              empty="Buyurtmalar topilmadi"
              rowKey={(r) => r.order_number}
              onRowClick={(r) => router.push(`/orders/${r.order_number}`)}
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
