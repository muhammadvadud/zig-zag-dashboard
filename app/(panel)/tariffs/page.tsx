"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import { money } from "@/lib/format";
import { Card, Button, Badge, ErrorState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { asList } from "../_shared/list";
import { TariffForm, type Tariff } from "./TariffForm";

export default function TariffsPage() {
  const notify = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Tariff | null>(null);
  const [deleting, setDeleting] = useState<Tariff | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const { data, error, isLoading, mutate } = useApi<unknown>("/admin/tariffs/");
  const rows = asList<Tariff>(data);

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/tariffs/${deleting.id}/`, { method: "DELETE" });
      notify("Tarif o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<Tariff>[] = [
    {
      key: "name",
      header: "Nomi",
      render: (t) => (
        <div>
          <div className="font-medium text-navy-800">{t.name || "—"}</div>
          <div className="text-xs text-navy-400">{t.code}</div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Narx",
      align: "right",
      render: (t) => <span className="font-medium text-navy-800">{money(t.price ?? 0)}</span>,
    },
    {
      key: "price_per_m2",
      header: "1 m² narxi",
      align: "right",
      render: (t) => (t.price_per_m2 == null ? "—" : money(t.price_per_m2)),
    },
    {
      key: "is_popular",
      header: "Mashhur",
      align: "center",
      render: (t) => (t.is_popular ? <Badge color="gold">Mashhur</Badge> : "—"),
    },
    {
      key: "is_active",
      header: "Holat",
      render: (t) =>
        t.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
    },
    { key: "sort_order", header: "Tartib", align: "center", render: (t) => t.sort_order ?? "—" },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (t) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(t)}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleting(t)}
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
        title="Tariflar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi tarif
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
            empty="Tariflar topilmadi"
            rowKey={(t) => t.id}
          />
        )}
      </Card>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Yangi tarif">
        <TariffForm onClose={() => setCreateOpen(false)} onSaved={() => mutate()} />
      </Modal>

      <Modal open={!!editing} onClose={() => setEditing(null)} title="Tarifni tahrirlash">
        {editing && (
          <TariffForm tariff={editing} onClose={() => setEditing(null)} onSaved={() => mutate()} />
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
          <b className="text-navy-800">{deleting?.name}</b> tarifini o'chirmoqchimisiz? Bu amalni
          qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
