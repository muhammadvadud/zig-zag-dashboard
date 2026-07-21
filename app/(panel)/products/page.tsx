"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, ImageOff } from "lucide-react";
import { useApi, api, ApiError } from "@/lib/api";
import type { AdminProduct, AdminTailor, Category, Paginated } from "@/lib/types";
import { money } from "@/lib/format";
import { Card, Button, Badge, ErrorState } from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

const PAGE_SIZE = 20;

export default function ProductsPage() {
  const notify = useToast();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<AdminProduct | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const listKey = `/admin/products/?search=${encodeURIComponent(search)}&page=${page}`;
  const { data, error, isLoading, mutate } = useApi<Paginated<AdminProduct>>(listKey);

  const { data: catData } = useApi<Category[] | Paginated<Category>>("/admin/categories/");
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
      key: "image",
      header: "",
      hideOnMobile: true,
      render: (p) =>
        p.main_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.main_image}
            alt=""
            className="w-12 h-12 rounded-lg border border-navy-100 object-cover"
          />
        ) : (
          <div className="flex w-12 h-12 items-center justify-center rounded-lg border border-dashed border-navy-200 bg-navy-50/50 text-navy-300">
            <ImageOff className="size-4" />
          </div>
        ),
    },
    {
      key: "name",
      header: "Nomi",
      render: (p) => (
        <div className="max-w-[200px] sm:max-w-[300px]">
          <div className="font-medium text-navy-800 line-clamp-2 break-words" title={p.name_uz}>
            {p.name_uz}
          </div>
          {p.name_ru && (
            <div className="text-xs text-navy-400 line-clamp-2 break-words" title={p.name_ru}>
              {p.name_ru}
            </div>
          )}
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
      key: "starting_price",
      header: "Narx (dan)",
      align: "right",
      render: (p) => money(p.starting_price),
    },
    {
      key: "discount_percent",
      header: "Chegirma",
      align: "right",
      render: (p) => `${p.discount_percent ?? 0}%`,
    },
    {
      key: "badges",
      header: "Nishonlar",
      render: (p) =>
        p.badges_detail?.length ? (
          <div className="flex flex-wrap gap-1">
            {p.badges_detail.map((b) => (
              <span
                key={b.id}
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
                style={{ backgroundColor: b.color }}
              >
                {b.name}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-navy-300">—</span>
        ),
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
          <Link
            href={`/products/${p.slug}/edit`}
            className="rounded-lg p-1.5 text-navy-500 hover:bg-navy-50"
            title="Tahrirlash"
          >
            <Pencil className="size-4" />
          </Link>
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
          <Button variant="gold" onClick={() => router.push("/products/new")}>
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
