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
import { StyleForm, type Style } from "./StyleForm";

export default function StylesPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Style | null>(null);
  const [deleting, setDeleting] = useState<Style | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/styles/");
  const rows = asList<Style>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/styles/${deleting.id}/`, { method: "DELETE" });
      notify("Uslub o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<Style>[] = [
    {
      key: "image",
      header: "Rasm",
      render: (s) =>
        s.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={s.image} alt="" className="h-9 w-14 rounded-lg border border-navy-100 object-cover" />
        ) : (
          <span className="text-navy-300">—</span>
        ),
    },
    {
      key: "name",
      header: "Nomi",
      render: (s) => <span className="font-medium text-navy-800">{s.name || "—"}</span>,
    },
    {
      key: "blurb",
      header: "Tavsif",
      render: (s) => <span className="text-navy-500">{truncate(s.blurb, 60)}</span>,
    },
    {
      key: "is_active",
      header: "Holat",
      render: (s) =>
        s.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
    },
    { key: "sort_order", header: "Tartib", align: "center", render: (s) => s.sort_order ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (s) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(s)}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleting(s)}
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
        title="Uslublar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi uslub
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
            empty="Uslublar topilmadi"
            rowKey={(s) => s.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi uslub">
        <StyleForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Uslubni tahrirlash">
        {editing && (
          <StyleForm style={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
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
          <b className="text-navy-800">{deleting?.name}</b> uslubini o'chirmoqchimisiz? Bu amalni
          qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
