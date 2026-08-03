"use client";

import { useState } from "react";
import { MessagesSquare, MessageCircle, Users, Zap } from "lucide-react";
import { useApi } from "@/lib/api";
import { num, fmtDateTime } from "@/lib/format";
import { Card, Badge, ErrorState } from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { KpiCard } from "@/components/dashboard/KpiCard";
import type {
  Paginated,
  AdminConversation,
  AdminConversationDetail,
  AIUsageStats,
} from "@/lib/types";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 20;

export default function ConversationsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  /* ---- data ---- */
  const { data: stats } = useApi<AIUsageStats>("/admin/ai/stats/");

  const qs = new URLSearchParams();
  qs.set("page", String(page));
  if (search) qs.set("search", search);

  const { data, isLoading, error } = useApi<Paginated<AdminConversation>>(
    `/admin/ai/conversations/?${qs.toString()}`
  );

  const { data: detail, isLoading: detailLoading } =
    useApi<AdminConversationDetail>(
      selectedId ? `/admin/ai/conversations/${selectedId}/` : null
    );

  const rows = data?.results ?? [];

  /* ---- columns ---- */
  const columns: Column<AdminConversation>[] = [
    {
      key: "user",
      header: "Foydalanuvchi",
      render: (row) => (
        <div>
          <div className="font-medium text-navy-800">{row.user_name || "—"}</div>
          <div className="text-[11px] text-navy-400">{row.user_phone}</div>
        </div>
      ),
    },
    {
      key: "title",
      header: "Sarlavha",
      render: (row) => (
        <span className="max-w-[200px] truncate block text-navy-700">
          {row.title || "—"}
        </span>
      ),
    },
    {
      key: "message_count",
      header: "Xabarlar",
      align: "center",
      render: (row) => (
        <Badge color="navy">{row.message_count}</Badge>
      ),
    },
    {
      key: "total_tokens",
      header: "Tokenlar",
      align: "right",
      render: (row) => (
        <span className="font-medium tabular-nums text-navy-700">
          {num(row.total_tokens)}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Sana",
      hideOnMobile: true,
      render: (row) => (
        <span className="text-navy-500">{fmtDateTime(row.created_at)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Suhbatlar"
        subtitle="Barcha foydalanuvchilarning AI suhbatlari"
      />

      {/* ---- KPI Cards ---- */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <KpiCard
          label="Jami suhbatlar"
          value={stats ? num(stats.total_conversations) : "—"}
          icon={<MessagesSquare className="size-5" />}
        />
        <KpiCard
          label="Jami xabarlar"
          value={stats ? num(stats.total_messages) : "—"}
          icon={<MessageCircle className="size-5" />}
        />
        <KpiCard
          label="Faol foydalanuvchilar"
          value={stats ? num(stats.active_users) : "—"}
          icon={<Users className="size-5" />}
        />
        <KpiCard
          label="Jami tokenlar"
          value={stats ? num(stats.total_tokens) : "—"}
          icon={<Zap className="size-5" />}
        />
      </div>

      {/* ---- Search ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ism, telefon yoki sarlavha..."
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
              empty="Suhbatlar topilmadi"
              rowKey={(r) => r.id}
              onRowClick={(r) => setSelectedId(r.id)}
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

      {/* ---- Thread Detail Modal ---- */}
      <Modal
        open={!!selectedId}
        onClose={() => setSelectedId(null)}
        title="Suhbat tafsilotlari"
        size="lg"
      >
        {detailLoading ? (
          <div className="flex items-center justify-center py-12">
            <span className="size-6 animate-spin rounded-full border-2 border-gold border-t-transparent" />
          </div>
        ) : detail ? (
          <div className="space-y-5">
            {/* Header info */}
            <div className="rounded-xl border border-navy-100 bg-navy-50/60 p-4">
              <h3 className="font-semibold text-navy-900">
                {detail.title || "Yangi suhbat"}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-navy-600">
                <span>
                  <strong className="text-navy-800">Foydalanuvchi:</strong>{" "}
                  {detail.user_name} ({detail.user_phone})
                </span>
                <span>
                  <strong className="text-navy-800">Input:</strong>{" "}
                  {num(detail.total_input_tokens)} tk
                </span>
                <span>
                  <strong className="text-navy-800">Output:</strong>{" "}
                  {num(detail.total_output_tokens)} tk
                </span>
                <span>
                  <strong className="text-navy-800">Xabarlar:</strong>{" "}
                  {detail.message_count}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
              {detail.messages.length === 0 && (
                <div className="py-10 text-center text-sm text-navy-400">
                  Xabarlar yo&apos;q
                </div>
              )}
              {detail.messages.map((msg) => {
                const isUser = msg.role === "user";
                const tokens =
                  (msg.input_tokens ?? 0) + (msg.output_tokens ?? 0);
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex w-full",
                      isUser ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3",
                        isUser
                          ? "rounded-br-md bg-navy-800 text-cream"
                          : "rounded-bl-md border border-gold/25 bg-gold/10 text-navy-900"
                      )}
                    >
                      <div className="mb-1.5 flex items-center justify-between gap-3">
                        <Badge
                          color={isUser ? "navy" : "gold"}
                          className="text-[10px] uppercase"
                        >
                          {msg.role}
                        </Badge>
                        {tokens > 0 && (
                          <span
                            className={cn(
                              "text-[10px] font-medium tabular-nums",
                              isUser ? "text-cream/50" : "text-navy-400"
                            )}
                          >
                            {num(tokens)} tk
                          </span>
                        )}
                      </div>
                      <div
                        className={cn(
                          "whitespace-pre-wrap text-sm leading-relaxed",
                          isUser ? "text-cream/90" : "text-navy-800"
                        )}
                      >
                        {msg.content}
                      </div>
                      <div
                        className={cn(
                          "mt-1.5 text-[10px]",
                          isUser ? "text-cream/40 text-right" : "text-navy-300"
                        )}
                      >
                        {fmtDateTime(msg.created_at)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-10 text-center text-sm text-navy-400">
            Ma&apos;lumot topilmadi
          </div>
        )}
      </Modal>
    </div>
  );
}
