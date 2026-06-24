"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import { Card, Button, Badge, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { asList, truncate } from "../_shared/list";
import { FaqForm, type AdminFaq } from "./FaqForm";

export default function FaqPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminFaq | null>(null);
  const [deleting, setDeleting] = useState<AdminFaq | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/faq/");
  const rows = asList<AdminFaq>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/faq/${deleting.id}/`, { method: "DELETE" });
      notify("Savol o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<AdminFaq>[] = [
    {
      key: "question",
      header: "Savol",
      className: "max-w-xs !whitespace-normal",
      render: (r) => <span className="font-medium text-navy-800">{r.question || "—"}</span>,
    },
    {
      key: "answer",
      header: "Javob",
      className: "max-w-md !whitespace-normal",
      render: (r) => <span className="text-navy-600">{truncate(r.answer, 140)}</span>,
    },
    { key: "sort_order", header: "Tartib", align: "center", render: (r) => r.sort_order ?? "—" },
    {
      key: "is_active",
      header: "Holat",
      render: (r) =>
        r.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(r)}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleting(r)}
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
        title="FAQ"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi savol
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
            empty="Savollar topilmadi"
            rowKey={(r) => r.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi savol">
        <FaqForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Savolni tahrirlash">
        {editing && (
          <FaqForm faq={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
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
          <b className="text-navy-800">{deleting?.question}</b> savolini o'chirmoqchimisiz? Bu amalni
          qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
