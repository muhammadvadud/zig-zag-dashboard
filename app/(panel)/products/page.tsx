"use client";

import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import type { AdminProduct, AdminTailor, Category, Paginated } from "@/lib/types";
import { money } from "@/lib/format";
import { Card, Button, Badge, ErrorState } from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { ProductForm } from "./ProductForm";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const notify = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const listKey = `/admin/products/?search=${encodeURIComponent(search)}&page=${page}`;
  const { data, error, isLoading, mutate } = useApi<Paginated<AdminProduct>>(listKey);

  const { data: catData } = useApi<Category[] | Paginated<Category>>("/categories/");
  const { data: tailorData } = useApi<Paginated<AdminTailor>>("/admin/tailors/?page=1");

  const categories: Category[] = useMemo(
    () => (Array.isArray(catData) ? catData : catData?.results ?? []),
    [catData]
  );
  const tailors: AdminTailor[] = useMemo(() => tailorData?.results ?? [], [tailorData]);

  const catName = useMemo(() => {
    const m = new Map<number, string>();
    for (const c of categories) m.set(c.id, c.name);
    return m;
  }, [categories]);

  const tailorName = useMemo(() => {
    const m = new Map<number, string>();
    for (const t of tailors) m.set(t.id, t.name_uz);
    return m;
  }, [tailors]);

  const rows = data?.results ?? [];

  async function onDelete() {
    if (!deleting) return;
    setDeletingBusy(true);
    try {
      await api(`/admin/products/${deleting.slug}/`, { method: "DELETE" });
      notify("Mahsulot o'chirildi", "success");
      setDeleting(null);
      mutate();
    } catch (err) {
      notify((err as ApiError).message || "O'chirishda xatolik", "error");
    } finally {
      setDeletingBusy(false);
    }
  }

  const columns: Column<AdminProduct>[] = [
    {
      key: "name",
      header: "Nomi",
      render: (p) => (
        <div>
          <div className="font-medium text-navy-800">{p.name_uz}</div>
          {p.name_ru && <div className="text-xs text-navy-400">{p.name_ru}</div>}
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategoriya",
      render: (p) => (p.category != null ? catName.get(p.category) ?? "—" : "—"),
    },
    {
      key: "tailor",
      header: "Chevar",
      render: (p) => (p.tailor != null ? tailorName.get(p.tailor) ?? "—" : "—"),
    },
    {
      key: "base_price",
      header: "Narx",
      align: "right",
      render: (p) => money(p.base_price),
    },
    {
      key: "discount_percent",
      header: "Chegirma",
      align: "right",
      render: (p) => `${p.discount_percent ?? 0}%`,
    },
    {
      key: "stock",
      header: "Stok",
      align: "right",
      render: (p) =>
        p.stock < 10 ? <Badge color="red">{p.stock}</Badge> : <span>{p.stock}</span>,
    },
    {
      key: "is_new",
      header: "Yangi",
      render: (p) =>
        p.is_new ? <Badge color="gold">Yangi</Badge> : <span className="text-navy-300">—</span>,
    },
    {
      key: "is_active",
      header: "Faol",
      render: (p) =>
        p.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (p) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() => setEditing(p)}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </button>
          <button
            onClick={() => setDeleting(p)}
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
        title="Mahsulotlar"
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="size-4" /> Yangi mahsulot
          </Button>
        }
      />

      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Nomi bo'yicha qidirish..."
        />
      </div>

      <Card>
        {error ? (
          <div className="p-5">
            <ErrorState error={error} />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              loading={isLoading}
              empty="Mahsulotlar topilmadi"
              rowKey={(p) => p.id}
            />
            <Pagination
              page={page}
              count={data?.count ?? 0}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </>
        )}
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Yangi mahsulot"
        size="lg"
      >
        <ProductForm
          categories={categories}
          tailors={tailors}
          onClose={() => setCreateOpen(false)}
          onSaved={() => mutate()}
        />
      </Modal>

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Mahsulotni tahrirlash"
        size="lg"
      >
        {editing && (
          <ProductForm
            product={editing}
            categories={categories}
            tailors={tailors}
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
          <b className="text-navy-800">{deleting?.name_uz}</b> mahsulotini o'chirmoqchimisiz? Bu
          amalni qaytarib bo'lmaydi.
        </p>
      </Modal>
    </div>
  );
}
