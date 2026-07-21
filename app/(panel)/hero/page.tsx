"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Star, ArrowUp, ArrowDown } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import { Card, Button, Badge, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { asList, truncate } from "../_shared/list";
import { HeroForm, type AdminHero } from "./HeroForm";

export default function HeroPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminHero | null>(null);
  const [deleting, setDeleting] = useState<AdminHero | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/hero/");
  const rows = asList<AdminHero>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/hero/${deleting.id}/`, { method: "DELETE" });
      notify("Hero o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  async function makeFirst(target: AdminHero) {
    setUpdatingId(target.id);
    try {
      const sorted = [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
      const others = sorted.filter((r) => r.id !== target.id);

      await api(`/admin/hero/${target.id}/`, {
        method: "PATCH",
        body: { sort_order: 1, is_active: true },
      });

      let nextOrder = 2;
      for (const item of others) {
        await api(`/admin/hero/${item.id}/`, {
          method: "PATCH",
          body: { sort_order: nextOrder },
        });
        nextOrder++;
      }

      notify("Asosiy hero matni o'zgartirildi!", "success");
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "Xatolik yuz berdi", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  async function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rows.length) return;

    const itemA = rows[index];
    const itemB = rows[targetIndex];

    setUpdatingId(itemA.id);
    try {
      const tempOrder = itemA.sort_order ?? 0;
      await api(`/admin/hero/${itemA.id}/`, {
        method: "PATCH",
        body: { sort_order: itemB.sort_order ?? 0 },
      });
      await api(`/admin/hero/${itemB.id}/`, {
        method: "PATCH",
        body: { sort_order: tempOrder },
      });

      notify("Tartib yangilandi", "success");
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "Xatolik yuz berdi", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  const columns: Column<AdminHero>[] = [
    {
      key: "is_first",
      header: "Asosiy",
      align: "center",
      render: (r) => {
        const index = rows.indexOf(r);
        const isMain = index === 0 && r.is_active;
        const loading = updatingId === r.id;

        if (loading) {
          return (
            <div className="flex h-8 w-8 items-center justify-center">
              <span className="size-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            </div>
          );
        }

        return (
          <button
            type="button"
            disabled={isMain}
            onClick={() => makeFirst(r)}
            className="flex size-8 items-center justify-center rounded-full transition-colors hover:bg-navy-50 disabled:hover:bg-transparent"
            title={isMain ? "Asosiy matn" : "Asosiy qilish"}
          >
            {isMain ? (
              <Star className="size-5 fill-gold text-gold" />
            ) : (
              <Star className="size-5 text-navy-300 transition-all hover:scale-110 hover:text-gold" />
            )}
          </button>
        );
      },
    },
    {
      key: "title",
      header: "Sarlavha",
      render: (r) => (
        <div>
          {r.eyebrow && <div className="text-xs text-gold-dark">{r.eyebrow}</div>}
          <span className="font-medium text-navy-800">
            {r.title || "—"} {r.title_italic && <i className="text-navy-500">{r.title_italic}</i>}
          </span>
        </div>
      ),
    },
    {
      key: "description",
      header: "Tavsif",
      className: "max-w-md !whitespace-normal",
      render: (r) => <span className="text-navy-600">{truncate(r.description, 120)}</span>,
    },
    {
      key: "sort_order",
      header: "Tartib",
      align: "center",
      render: (r) => {
        const index = rows.indexOf(r);
        const canMoveUp = index > 0;
        const canMoveDown = index < rows.length - 1;
        const loading = updatingId === r.id;

        return (
          <div className="flex items-center justify-center gap-1">
            <button
              type="button"
              disabled={!canMoveUp || loading}
              onClick={() => moveItem(index, "up")}
              className="rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Yuqoriga"
            >
              <ArrowUp className="size-3.5" />
            </button>
            <span className="min-w-[1.5rem] text-center text-xs font-semibold text-navy-600">
              {r.sort_order ?? 0}
            </span>
            <button
              type="button"
              disabled={!canMoveDown || loading}
              onClick={() => moveItem(index, "down")}
              className="rounded-md p-1 text-navy-400 hover:bg-navy-50 hover:text-navy-700 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Pastga"
            >
              <ArrowDown className="size-3.5" />
            </button>
          </div>
        );
      },
    },
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
        title="Hero matnlari"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi hero
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
            empty="Hero matnlari topilmadi"
            rowKey={(r) => r.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi hero" size="lg">
        <HeroForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Hero matnini tahrirlash"
        size="lg"
      >
        {editing && (
          <HeroForm hero={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
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
          <b className="text-navy-800">{deleting?.title}</b> hero matnini o'chirmoqchimisiz? Bu
          amalni qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
