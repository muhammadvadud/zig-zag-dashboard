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
import { CategoryForm, type Category } from "./CategoryForm";

export default function CategoriesPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/categories/");
  const rows = asList<Category>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/categories/${deleting.id}/`, { method: "DELETE" });
      notify("Kategoriya o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<Category>[] = [
    {
      key: "icon",
      header: "Ikonka",
      render: (c) =>
        c.icon ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={c.icon} alt="" className="size-9 rounded-lg border border-navy-100 object-cover" />
        ) : (
          <span className="text-navy-300">—</span>
        ),
    },
    {
      key: "name",
      header: "Nomi",
      render: (c) => <span className="font-medium text-navy-800">{c.name || "—"}</span>,
    },
    { key: "slug", header: "Slug", render: (c) => <span className="text-navy-500">{c.slug || "—"}</span> },
    {
      key: "is_active",
      header: "Holat",
      render: (c) =>
        c.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
    },
    { key: "sort_order", header: "Tartib", align: "center", render: (c) => c.sort_order ?? "—" },
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
        title="Kategoriyalar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi kategoriya
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
            empty="Kategoriyalar topilmadi"
            rowKey={(c) => c.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi kategoriya">
        <CategoryForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Kategoriyani tahrirlash">
        {editing && (
          <CategoryForm
            category={editing}
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
          <b className="text-navy-800">{deleting?.name}</b> kategoriyasini o'chirmoqchimisiz? Bu
          amalni qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
