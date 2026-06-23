"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import type { AdminTailor, Paginated } from "@/lib/types";
import { num } from "@/lib/format";
import { Card, Button, Badge, Loading, ErrorState, EmptyState } from "@/components/ui";
import { Pagination } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { TailorForm } from "./TailorForm";

const PAGE_SIZE = 20;

export default function TailorsPage() {
  const notify = useToast();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminTailor | null>(null);
  const [deleting, setDeleting] = useState<AdminTailor | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<Paginated<AdminTailor>>(
    `/admin/tailors/?page=${page}`
  );
  const tailors = data?.results ?? [];

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/tailors/${deleting.id}/`, { method: "DELETE" });
      notify("Chevar o'chirildi", "success");
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
        title="Chevarlar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi chevar
          </Button>
        }
      />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <Loading />
      ) : tailors.length === 0 ? (
        <EmptyState title="Chevarlar topilmadi" />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tailors.map((t) => (
            <Card key={t.id} className="p-5">
              <div className="flex items-start gap-4">
                {t.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={t.photo}
                    alt={t.name_uz}
                    className="size-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-navy-800 text-lg font-semibold text-cream">
                    {t.initials || t.name_uz.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="truncate font-semibold text-navy-800">{t.name_uz}</h3>
                    {t.is_active ? (
                      <Badge color="green">Faol</Badge>
                    ) : (
                      <Badge color="gray">Nofaol</Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-navy-400">{t.specialty_uz || "—"}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm text-navy-600">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-4 fill-gold text-gold" />
                      {Number(t.rating || 0).toFixed(1)}
                    </span>
                    <span className="text-navy-400">
                      {num(t.orders_count)} buyurtma
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-navy-50 pt-3">
                <Button variant="outline" onClick={() => setEditing(t)} className="px-3 py-1.5">
                  <Pencil className="size-4" /> Tahrirlash
                </Button>
                <Button variant="ghost" onClick={() => setDeleting(t)} className="px-3 py-1.5 text-red-600 hover:bg-red-50">
                  <Trash2 className="size-4" /> O'chirish
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!error && (data?.count ?? 0) > PAGE_SIZE && (
        <Card>
          <Pagination page={page} count={data?.count ?? 0} pageSize={PAGE_SIZE} onPage={setPage} />
        </Card>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi chevar">
        <TailorForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Chevarni tahrirlash">
        {editing && (
          <TailorForm
            tailor={editing}
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
          <b className="text-navy-800">{deleting?.name_uz}</b> chevarini o'chirmoqchimisiz?
        </p>
      </Modal>
    </div>
  );
}
