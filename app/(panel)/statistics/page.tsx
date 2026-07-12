"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Banknote,
  Eye,
  Heart,
  ImageOff,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";

import { useApi } from "@/lib/api";
import type { Category, Overview, Paginated, ProductStatRow } from "@/lib/types";
import { money, num } from "@/lib/format";

import { Card, Select, Badge, ErrorState, Loading, EmptyState } from "@/components/ui";
import { PageHeader, SearchInput } from "@/components/ui/page";
import { Pagination } from "@/components/ui/table";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { asList } from "../_shared/list";

const PAGE_SIZE = 20; // backend StandardPagination default

const SORT_OPTIONS = [
  { value: "-views", label: "Ko'rishlar: ko'pdan kamga" },
  { value: "views", label: "Ko'rishlar: kamdan ko'pga" },
  { value: "-sales", label: "Sotilgan: ko'pdan kamga" },
  { value: "-revenue", label: "Daromad: ko'pdan kamga" },
  { value: "-favorites", label: "Sevimlilar: ko'pdan kamga" },
  { value: "-rating", label: "Reyting: yuqoridan pastga" },
  { value: "-conversion", label: "Konversiya: yuqoridan pastga" },
];

export default function StatisticsPage() {
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-views");
  const [page, setPage] = useState(1);

  const overview = useApi<Overview>("/admin/stats/overview/");
  const o = overview.data;

  const { data: catData } = useApi<Category[] | Paginated<Category>>("/admin/categories/");
  const categories = useMemo(() => asList<Category>(catData), [catData]);
  const catNameBySlug = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of categories) m.set(c.slug, c.name);
    return m;
  }, [categories]);

  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (search) qs.set("search", search);
  qs.set("ordering", sort);
  qs.set("page", String(page));

  const { data, error, isLoading } = useApi<Paginated<ProductStatRow>>(
    `/admin/stats/products/?${qs.toString()}`
  );
  const rows = data?.results ?? [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Statistika"
        subtitle="Mahsulotlar bo'yicha ko'rishlar, sotuvlar, sevimlilar va konversiya"
      />

      {/* ---- overview KPI row ---- */}
      {overview.error ? (
        <ErrorState error={overview.error} />
      ) : overview.isLoading ? (
        <Card className="p-0">
          <Loading />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          <KpiCard
            label="Mahsulotlar"
            value={num(o?.products)}
            icon={<Package className="size-5" />}
            accent
          />
          <KpiCard
            label="Umumiy ko'rishlar"
            value={num(o?.total_views)}
            icon={<Eye className="size-5" />}
          />
          <KpiCard
            label="Buyurtmalar"
            value={num(o?.total_orders)}
            icon={<ShoppingBag className="size-5" />}
          />
          <KpiCard
            label="Umumiy daromad"
            value={money(o?.total_revenue)}
            icon={<Banknote className="size-5" />}
          />
          <KpiCard
            label="Mijozlar"
            value={num(o?.total_customers)}
            icon={<Users className="size-5" />}
          />
          <KpiCard
            label="Bugungi savdo"
            value={money(o?.today_sales)}
            icon={<TrendingUp className="size-5" />}
          />
          <KpiCard
            label="Oylik savdo"
            value={money(o?.month_sales)}
            icon={<TrendingUp className="size-5" />}
          />
          <KpiCard
            label="Konversiya"
            value={o?.conversion != null ? `${o.conversion.toFixed(1)}%` : "—"}
            icon={<BarChart3 className="size-5" />}
          />
        </div>
      )}

      {/* ---- filters ---- */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi (kategoriya)</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </Select>

        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Mahsulot nomi bo'yicha qidirish..."
          className="min-w-[220px] flex-1"
        />
      </div>

      {/* ---- product cards grid ---- */}
      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <Card>
          <Loading />
        </Card>
      ) : rows.length === 0 ? (
        <Card>
          <EmptyState
            icon={<BarChart3 className="size-6" />}
            title="Mahsulot topilmadi"
            hint="Filtr yoki qidiruvni o'zgartirib ko'ring"
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((p) => (
              <ProductStatCard key={p.id} p={p} categoryName={p.category ? catNameBySlug.get(p.category) : undefined} />
            ))}
          </div>
          <Card className="p-0">
            <Pagination page={page} count={data?.count ?? 0} pageSize={PAGE_SIZE} onPage={setPage} />
          </Card>
        </>
      )}
    </div>
  );
}

function ProductStatCard({
  p,
  categoryName,
}: {
  p: ProductStatRow;
  categoryName?: string;
}) {
  const rating = typeof p.rating_avg === "string" ? parseFloat(p.rating_avg) : p.rating_avg;
  const convPct = (p.conversion ?? 0) * 100;
  const views7Up = p.views_7d > 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-navy-100/80 bg-white shadow-soft transition-all hover:-translate-y-0.5 hover:border-gold/40 hover:shadow-card-hover">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-navy-50">
        {p.main_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.main_image}
            alt={p.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-navy-200">
            <ImageOff className="size-9" />
          </div>
        )}
        {categoryName && (
          <span className="absolute left-2 top-2 rounded-full bg-navy-900/70 px-2.5 py-0.5 text-[10px] font-medium text-cream backdrop-blur-sm">
            {categoryName}
          </span>
        )}
        {p.top_variant && (
          <span className="absolute bottom-2 left-2 right-2 truncate rounded-lg bg-gold/90 px-2 py-1 text-[10px] font-semibold text-navy-900 shadow-sm">
            Top variant: {p.top_variant.name} ({num(p.top_variant.sold_qty)} dona)
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate text-sm font-semibold text-navy-800" title={p.name}>
          {p.name}
        </h3>
        <div className="mt-1 flex items-center gap-1.5 text-xs">
          <Star className="size-3.5 fill-gold text-gold" />
          <span className="font-medium text-navy-700">{rating ? rating.toFixed(1) : "—"}</span>
          <span className="text-navy-300">•</span>
          <span className="text-navy-400">{p.reviews_count} sharh</span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
          <Metric
            icon={<Eye className="size-3.5" />}
            label="Ko'rishlar"
            value={num(p.views_count)}
            sub={`7k: ${num(p.views_7d)} · 30k: ${num(p.views_30d)}`}
            highlight={views7Up}
          />
          <Metric
            icon={<Heart className="size-3.5" />}
            label="Sevimli"
            value={num(p.favorites_count)}
          />
          <Metric
            icon={<ShoppingBag className="size-3.5" />}
            label="Sotilgan"
            value={num(p.sold_qty)}
          />
          <Metric
            icon={<Banknote className="size-3.5" />}
            label="Daromad"
            value={money(p.revenue)}
          />
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-navy-50 pt-3">
          <Badge color={convPct > 0 ? "green" : "gray"}>
            {convPct.toFixed(1)}% konversiya
          </Badge>
          <span className="text-[11px] text-navy-400">{p.orders_count} buyurtma</span>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  sub,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl bg-navy-50/60 px-2.5 py-2">
      <div className="flex items-center gap-1 text-navy-400">
        <span className={highlight ? "text-gold-dark" : "text-navy-400"}>{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-0.5 truncate font-semibold text-navy-800">{value}</div>
      {sub && <div className="truncate text-[10px] text-navy-400">{sub}</div>}
    </div>
  );
}
