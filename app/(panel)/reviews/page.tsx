"use client";

import { useState } from "react";

import { api, useApi } from "@/lib/api";
import type { AdminReview, Paginated } from "@/lib/types";
import { fmtDate } from "@/lib/format";

import { Card, Badge, Button, Select, ErrorState } from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";

import { Stars, truncate } from "../_shared/list";

const PAGE_SIZE = 20;

export default function ReviewsPage() {
  const notify = useToast();
  const [published, setPublished] = useState(""); // "", "true", "false"
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const qs = new URLSearchParams();
  if (published) qs.set("is_published", published);
  if (search) qs.set("search", search);
  qs.set("page", String(page));

  const { data, error, isLoading, mutate } = useApi<Paginated<AdminReview>>(
    `/admin/reviews/?${qs.toString()}`
  );

  const rows = data?.results ?? [];

  async function toggle(r: AdminReview) {
    setBusyId(r.id);
    try {
      await api(`/admin/reviews/${r.id}/`, {
        method: "PATCH",
        body: { is_published: !r.is_published },
      });
      notify(r.is_published ? "Sharh yashirildi" : "Sharh e'lon qilindi", "success");
      mutate();
    } catch (err) {
      notify((err as Error).message || "Xatolik", "error");
    } finally {
      setBusyId(null);
    }
  }

  const columns: Column<AdminReview>[] = [
    {
      key: "product",
      header: "Mahsulot",
      render: (r) => <span className="font-medium text-navy-800">{r.product}</span>,
    },
    { key: "user_name", header: "Mijoz", render: (r) => r.user_name || "—" },
    {
      key: "rating",
      header: "Baho",
      render: (r) => <Stars value={r.rating} />,
    },
    {
      key: "comment",
      header: "Sharh",
      className: "max-w-xs !whitespace-normal",
      render: (r) => <span className="text-navy-600">{truncate(r.comment, 120)}</span>,
    },
    {
      key: "is_published",
      header: "Holat",
      render: (r) =>
        r.is_published ? (
          <Badge color="green">E&apos;lon qilingan</Badge>
        ) : (
          <Badge color="amber">Kutilmoqda</Badge>
        ),
    },
    {
      key: "created_at",
      header: "Sana",
      render: (r) => fmtDate(r.created_at),
    },
    {
      key: "action",
      header: "",
      align: "right",
      render: (r) => (
        <Button
          variant={r.is_published ? "outline" : "gold"}
          className="px-3 py-1.5 text-xs"
          loading={busyId === r.id}
          onClick={() => toggle(r)}
        >
          {r.is_published ? "Yashirish" : "E'lon qilish"}
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Sharhlar" />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={published}
          onChange={(e) => {
            setPublished(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi</option>
          <option value="true">E&apos;lon qilingan</option>
          <option value="false">Kutilmoqda</option>
        </Select>

        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Mahsulot yoki mijoz bo'yicha..."
          className="w-72"
        />
      </div>

      {error ? (
        <ErrorState error={error} />
      ) : (
        <Card className="overflow-hidden">
          <DataTable<AdminReview>
            columns={columns}
            rows={rows}
            loading={isLoading}
            rowKey={(r) => r.id}
            empty="Sharhlar topilmadi"
          />
          <Pagination
            page={page}
            count={data?.count ?? 0}
            pageSize={PAGE_SIZE}
            onPage={setPage}
          />
        </Card>
      )}
    </div>
  );
}
