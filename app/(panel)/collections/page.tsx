"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import { Card, Button, Badge, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { asList } from "../_shared/list";
import { CollectionForm, type AdminCollection } from "./CollectionForm";

export default function CollectionsPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminCollection | null>(null);
  const [deleting, setDeleting] = useState<AdminCollection | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/collections/");
  const rows = asList<AdminCollection>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/collections/${deleting.id}/`, { method: "DELETE" });
      notify("Kolleksiya o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<AdminCollection>[] = [
    {
      key: "image",
      header: "Rasm",
      render: (r) =>
        r.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={r.image}
            alt={r.title}
            className="h-10 w-16 rounded-md border border-navy-100 object-cover"
          />
        ) : (
          <span className="text-navy-300">—</span>
        ),
    },
    {
      key: "title",
      header: "Nomi",
      render: (r) => <span className="font-medium text-navy-800">{r.title}</span>,
    },
    { key: "slug", header: "Slug", render: (r) => <span className="text-navy-500">{r.slug || "—"}</span> },
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
        title="Kolleksiyalar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi kolleksiya
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
            empty="Kolleksiyalar topilmadi"
            rowKey={(r) => r.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi kolleksiya">
        <CollectionForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Kolleksiyani tahrirlash">
        {editing && (
          <CollectionForm
            collection={editing}
            onClose={() => setEditing(null)}
            onSaved={() => mutate()}
          />
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
          <b className="text-navy-800">{deleting?.title}</b> kolleksiyasini o'chirmoqchimisiz? Bu
          amalni qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
