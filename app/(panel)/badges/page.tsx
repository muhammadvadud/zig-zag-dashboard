"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import type { AdminBadge } from "@/lib/types";
import { Card, Button, Badge as BadgeChip, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { asList } from "../_shared/list";
import { BadgeForm } from "./BadgeForm";

export default function BadgesPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminBadge | null>(null);
  const [deleting, setDeleting] = useState<AdminBadge | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/badges/");
  const rows = asList<AdminBadge>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/badges/${deleting.id}/`, { method: "DELETE" });
      notify("Nishon o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<AdminBadge>[] = [
    {
      key: "preview",
      header: "Nishon",
      render: (b) => (
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: b.color || "#888" }}
        >
          {b.name_uz || "—"}
        </span>
      ),
    },
    {
      key: "name_ru",
      header: "Nomi (ru)",
      render: (b) => <span className="text-navy-600">{b.name_ru || "—"}</span>,
    },
    {
      key: "color",
      header: "Rang",
      render: (b) => <span className="font-mono text-navy-500">{b.color || "—"}</span>,
    },
    {
      key: "is_active",
      header: "Holat",
      render: (b) =>
        b.is_active ? <BadgeChip color="green">Faol</BadgeChip> : <BadgeChip color="gray">Nofaol</BadgeChip>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (b) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(b)}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleting(b)}
            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
            title="O'chirish"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Nishonlar"
        subtitle="Mahsulotlarga biriktiriladigan rangli nishonlar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi nishon
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {error ? (
          <div className="p-5">
            <ErrorState error={error} />
          </div>
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            loading={isLoading}
            empty="Nishonlar topilmadi"
            rowKey={(b) => b.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi nishon">
        <BadgeForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Nishonni tahrirlash">
        {editing && (
          <BadgeForm badge={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
        )}
      </Modal>

      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="O'chirishni tasdiqlang"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              Bekor qilish
            </Button>
            <Button variant="danger" loading={deletingBusy} onClick={onDelete}>
              O'chirish
            </Button>
          </>
        }
      >
        <p className="text-sm text-navy-600">
          <b className="text-navy-800">{deleting?.name_uz}</b> nishonini o'chirmoqchimisiz? Bu amalni
          qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
