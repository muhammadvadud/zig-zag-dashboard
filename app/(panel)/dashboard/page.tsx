"use client";

import {
  Banknote,
  CalendarRange,
  ClipboardList,
  Receipt,
  Ruler,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { useApi } from "@/lib/api";
import type {
  LowStockItem,
  Overview,
  PaymentSlice,
  RecentOrder,
  SalesPoint,
  StatusSlice,
  TopCategory,
  TopProduct,
} from "@/lib/types";
import { money, num, fmtDate, pct } from "@/lib/format";

import { Card, CardHeader, Loading, ErrorState, EmptyState, Badge, StatusBadge, PaymentBadge } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SalesAreaChart } from "@/components/charts/SalesAreaChart";
import { StatusDonut } from "@/components/charts/StatusDonut";
import { PaymentsBar } from "@/components/charts/PaymentsBar";
import { TopList, type TopListItem } from "@/components/charts/TopList";

/* ---- response envelopes ---- */
interface Listed<T> {
  items: T[];
}
interface SalesResp {
  points: SalesPoint[];
}
interface RecentMeasurement {
  id: number;
  customer: string;
  preferred_date: string;
  time_slot: string;
  status: string;
}
interface PendingReview {
  id: number;
  product: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

/* ---- generic section that handles loading / error / empty ---- */
function Section({
  title,
  subtitle,
  action,
  loading,
  error,
  isEmpty,
  emptyHint,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyHint?: string;
  bodyClassName?: string;
  children: ReactNode;
}) {
  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className={bodyClassName ?? "px-5 pb-5"}>
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState error={error} />
        ) : isEmpty ? (
          <EmptyState hint={emptyHint} />
        ) : (
          children
        )}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const overview = useApi<Overview>("/admin/stats/overview/");
  const sales = useApi<SalesResp>("/admin/stats/sales/?days=30");
  const status = useApi<Listed<StatusSlice>>("/admin/stats/orders-by-status/");
  const payments = useApi<Listed<PaymentSlice>>("/admin/stats/payments/");
  const topProducts = useApi<Listed<TopProduct>>("/admin/stats/top-products/?limit=8");
  const topCategories = useApi<Listed<TopCategory>>("/admin/stats/top-categories/");
  const recentOrders = useApi<Listed<RecentOrder>>("/admin/stats/recent-orders/?limit=8");
  const recentMeasurements = useApi<Listed<RecentMeasurement>>("/admin/stats/recent-measurements/?limit=6");
  const lowStock = useApi<Listed<LowStockItem>>("/admin/stats/low-stock/?threshold=10");
  const pendingReviews = useApi<Listed<PendingReview>>("/admin/stats/pending-reviews/?limit=6");

  const o = overview.data;
  const d = o?.deltas ?? {};

  const productItems: TopListItem[] = (topProducts.data?.items ?? []).map((p) => ({
    key: p.product_id,
    name: p.name,
    qty: p.qty,
    revenue: p.revenue,
  }));
  const categoryItems: TopListItem[] = (topCategories.data?.items ?? []).map((c) => ({
    key: c.category,
    name: c.name,
    qty: c.qty,
    revenue: c.revenue,
  }));

  /* ---- table columns ---- */
  const orderCols: Column<RecentOrder>[] = [
    { key: "order_number", header: "Raqam", render: (r) => <span className="font-medium text-navy-800">{r.order_number}</span> },
    { key: "customer", header: "Mijoz" },
    { key: "status", header: "Holat", render: (r) => <StatusBadge status={r.status} /> },
    { key: "payment_status", header: "To'lov", render: (r) => <PaymentBadge status={r.payment_status} /> },
    { key: "total", header: "Summa", align: "right", render: (r) => money(r.total) },
    { key: "created_at", header: "Sana", align: "right", render: (r) => fmtDate(r.created_at) },
  ];

  const measurementCols: Column<RecentMeasurement>[] = [
    { key: "customer", header: "Mijoz", render: (r) => <span className="font-medium text-navy-800">{r.customer}</span> },
    { key: "preferred_date", header: "Sana", render: (r) => fmtDate(r.preferred_date) },
    { key: "time_slot", header: "Vaqt", render: (r) => r.time_slot || "—" },
    { key: "status", header: "Holat", align: "right", render: (r) => <Badge color="navy">{r.status}</Badge> },
  ];

  const lowStockCols: Column<LowStockItem>[] = [
    { key: "name", header: "Mahsulot", render: (r) => <span className="font-medium text-navy-800">{r.name}</span> },
    {
      key: "stock",
      header: "Qoldiq",
      align: "right",
      render: (r) => (
        <Badge color={r.stock <= 0 ? "red" : r.stock <= 5 ? "amber" : "gold"}>{num(r.stock)} dona</Badge>
      ),
    },
  ];

  const reviewCols: Column<PendingReview>[] = [
    { key: "product", header: "Mahsulot", render: (r) => <span className="font-medium text-navy-800">{r.product}</span> },
    { key: "user_name", header: "Mijoz" },
    { key: "rating", header: "Baho", align: "center", render: (r) => <Badge color="gold">{r.rating} ★</Badge> },
    {
      key: "comment",
      header: "Izoh",
      render: (r) => <span className="block max-w-[16rem] truncate text-navy-600">{r.comment || "—"}</span>,
    },
    { key: "created_at", header: "Sana", align: "right", render: (r) => fmtDate(r.created_at) },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Boshqaruv paneli"
        subtitle="Do'kon ko'rsatkichlari, savdo dinamikasi va so'nggi faoliyat"
      />

      {/* ---- KPI row ---- */}
      {overview.error ? (
        <ErrorState error={overview.error} />
      ) : overview.isLoading ? (
        <Card className="p-0">
          <Loading />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Bugungi savdo" value={money(o?.today_sales)} delta={d.today_sales_pct} icon={<Banknote className="size-5" />} accent />
          <KpiCard label="Oylik savdo" value={money(o?.month_sales)} delta={d.month_sales_pct} icon={<TrendingUp className="size-5" />} />
          <KpiCard label="Buyurtmalar (oy)" value={num(o?.orders_month)} delta={d.orders_pct} icon={<ClipboardList className="size-5" />} />
          <KpiCard label="O'rtacha chek" value={money(o?.avg_check)} delta={d.avg_check_pct} icon={<Receipt className="size-5" />} />
          <KpiCard label="Yangi mijozlar" value={num(o?.new_customers_month)} delta={d.new_customers_pct} icon={<UserPlus className="size-5" />} />
          <KpiCard label="Kutilayotgan buyurtma" value={num(o?.pending_orders)} icon={<ClipboardList className="size-5" />} />
          <KpiCard label="O'lchov so'rovlari" value={num(o?.measurement_requests)} icon={<Ruler className="size-5" />} />
          <KpiCard
            label="Konversiya"
            value={o?.conversion != null ? pct(o.conversion) : "—"}
            delta={d.conversion_pct}
            icon={<Users className="size-5" />}
          />
        </div>
      )}

      {/* ---- charts row 1 ---- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Section
            title="Savdo dinamikasi"
            subtitle="So'nggi 30 kun"
            loading={sales.isLoading}
            error={sales.error}
            isEmpty={!sales.data?.points?.length}
          >
            <SalesAreaChart points={sales.data?.points ?? []} />
          </Section>
        </div>
        <Section
          title="Buyurtmalar holati"
          loading={status.isLoading}
          error={status.error}
          isEmpty={!status.data?.items?.length}
        >
          <StatusDonut items={status.data?.items ?? []} />
        </Section>
      </div>

      {/* ---- charts row 2 ---- */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Section
          title="To'lov usullari"
          loading={payments.isLoading}
          error={payments.error}
          isEmpty={!payments.data?.items?.length}
        >
          <PaymentsBar items={payments.data?.items ?? []} />
        </Section>
        <Section
          title="Top mahsulotlar"
          subtitle="Daromad bo'yicha"
          loading={topProducts.isLoading}
          error={topProducts.error}
          isEmpty={!productItems.length}
        >
          <TopList items={productItems} metric="revenue" />
        </Section>
        <Section
          title="Top kategoriyalar"
          subtitle="Daromad bo'yicha"
          loading={topCategories.isLoading}
          error={topCategories.error}
          isEmpty={!categoryItems.length}
        >
          <TopList items={categoryItems} metric="revenue" />
        </Section>
      </div>

      {/* ---- tables ---- */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section
          title="Oxirgi buyurtmalar"
          loading={recentOrders.isLoading}
          error={recentOrders.error}
          bodyClassName="pb-2"
        >
          <DataTable
            columns={orderCols}
            rows={recentOrders.data?.items}
            rowKey={(r) => r.order_number}
            empty="Buyurtmalar yo'q"
          />
        </Section>

        <Section
          title="Yangi o'lchov so'rovlari"
          loading={recentMeasurements.isLoading}
          error={recentMeasurements.error}
          bodyClassName="pb-2"
        >
          <DataTable
            columns={measurementCols}
            rows={recentMeasurements.data?.items}
            rowKey={(r) => r.id}
            empty="So'rovlar yo'q"
          />
        </Section>

        <Section
          title="Kam qolgan mahsulotlar"
          subtitle="Qoldiq ≤ 10"
          loading={lowStock.isLoading}
          error={lowStock.error}
          bodyClassName="pb-2"
        >
          <DataTable
            columns={lowStockCols}
            rows={lowStock.data?.items}
            rowKey={(r) => r.id}
            empty="Hammasi yetarli"
          />
        </Section>

        <Section
          title="Yangi sharhlar"
          subtitle="Moderatsiya kutilmoqda"
          loading={pendingReviews.isLoading}
          error={pendingReviews.error}
          bodyClassName="pb-2"
        >
          <DataTable
            columns={reviewCols}
            rows={pendingReviews.data?.items}
            rowKey={(r) => r.id}
            empty="Yangi sharhlar yo'q"
          />
        </Section>
      </div>
    </div>
  );
}
