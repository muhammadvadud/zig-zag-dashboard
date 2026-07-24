"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Layers } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import { Card, Button, Badge, ErrorState, EmptyState, Loading } from "@/components/ui";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { asList } from "../_shared/list";
import { MaterialForm, type AdminMaterial } from "./MaterialForm";

export default function MaterialsPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminMaterial | null>(null);
  const [deleting, setDeleting] = useState<AdminMaterial | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/materials/");
  const rows = asList<AdminMaterial>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/materials/${deleting.id}/`, { method: "DELETE" });
      notify("Mato o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title="Matolar"
        subtitle="Mahsulotlar qaysi matolardan tayyorlangani"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi mato
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <Card>
          <Loading />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<Layers className="size-6" />}
            title="Hali mato yo'q"
            hint="Birinchi matoni qo'shing — mahsulot qo'shishda tanlab bo'ladi"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {rows.map((m) => (
            <div
              key={m.id}
              className="group relative overflow-hidden rounded-2xl border border-navy-100/80 bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card-hover"
            >
              {/* dekorativ gradient */}
              <div className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full bg-gradient-to-br from-gold/15 to-transparent blur-xl" />

              <div className="flex items-start justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold/20 to-gold/5 text-gold-dark ring-1 ring-gold/20">
                  <Layers className="size-6" />
                </span>
                {m.is_active ? (
                  <Badge color="green">Faol</Badge>
                ) : (
                  <Badge color="gray">Nofaol</Badge>
                )}
              </div>

              <div className="mt-4">
                <h3 className="truncate text-base font-semibold text-navy-800">
                  {m.name_uz}
                  {m.name_ru && <span className="text-navy-400 font-normal"> / {m.name_ru}</span>}
                </h3>
                <p className="mt-0.5 truncate text-sm text-navy-400">
                  {m.description_uz || m.slug || "—"}
                  {m.description_ru && <span className="text-navy-300"> / {m.description_ru}</span>}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-navy-50 pt-3">
                <span className="text-xs font-medium text-navy-500">
                  {m.products_count ?? 0} ta mahsulot
                </span>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => setEditing(m)}
                    className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
                    title="Tahrirlash"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => setDeleting(m)}
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50"
                    title="O'chirish"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi mato">
        <MaterialForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Matoni tahrirlash">
        {editing && (
          <MaterialForm
            material={editing}
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
          <b className="text-navy-800">{deleting?.name_uz}</b> matosini o'chirmoqchimisiz? Bu amalni
          qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
