"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import { Card, Button, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { asList } from "../_shared/list";
import { ColorForm, type Color } from "./ColorForm";

export default function ColorsPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Color | null>(null);
  const [deleting, setDeleting] = useState<Color | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/colors/");
  const rows = asList<Color>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/colors/${deleting.id}/`, { method: "DELETE" });
      notify("Rang o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<Color>[] = [
    {
      key: "swatch",
      header: "Rang",
      render: (c) => (
        <span
          className="inline-block size-6 rounded-full border border-navy-200 align-middle"
          style={{ backgroundColor: c.hex || "transparent" }}
          title={c.hex}
        />
      ),
    },
    {
      key: "name",
      header: "Nomi",
      render: (c) => <span className="font-medium text-navy-800">{c.name || "—"}</span>,
    },
    {
      key: "hex",
      header: "HEX",
      render: (c) => <span className="font-mono text-navy-500">{c.hex || "—"}</span>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(c)}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleting(c)}
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
        title="Ranglar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi rang
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
            empty="Ranglar topilmadi"
            rowKey={(c) => c.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi rang">
        <ColorForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Rangni tahrirlash">
        {editing && (
          <ColorForm color={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
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
          <b className="text-navy-800">{deleting?.name}</b> rangini o'chirmoqchimisiz? Bu amalni
          qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
