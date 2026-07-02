"use client";

import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Banknote,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Layers,
  PieChart,
  Receipt,
  Ruler,
  ShoppingBag,
  Star,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { useApi } from "@/lib/api";
import type {
  Overview,
  PaymentSlice,
  RecentOrder,
  SalesPoint,
  StatusSlice,
  TopCategory,
  TopProduct,
} from "@/lib/types";
import { money, num, fmtDate, pct } from "@/lib/format";

import {
  Card,
  CardHeader,
  Loading,
  ErrorState,
  EmptyState,
  Badge,
  StatusBadge,
  PaymentBadge,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SalesAreaChart } from "@/components/charts/SalesAreaChart";
import { StatusDonut } from "@/components/charts/StatusDonut";
import { PaymentsBar } from "@/components/charts/PaymentsBar";
import { TopList, type TopListItem } from "@/components/charts/TopList";

/* ---- period options ---- */
const PERIODS = [
  { label: "7 kun", days: 7 },
  { label: "30 kun", days: 30 },
  { label: "3 oy", days: 90 },
  { label: "6 oy", days: 180 },
  { label: "1 yil", days: 365 },
];

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

/* ---- "View all" styled link ---- */
function ViewAll({ href, label = "Hammasi" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="group/va inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-navy-500 transition-colors hover:bg-gold/10 hover:text-gold-dark"
    >
      {label}
      <ArrowRight className="size-3.5 transition-transform group-hover/va:translate-x-0.5" />
    </Link>
  );
}

/* ---- count chip ---- */
function CountChip({ n }: { n?: number }) {
  if (n == null) return null;
  return (
    <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-navy-50 px-2 py-0.5 text-xs font-bold text-navy-600 ring-1 ring-inset ring-navy-100">
      {n}
    </span>
  );
}

/* ---- section wrapper ---- */
function Section({
  title,
  subtitle,
  icon,
  action,
  loading,
  error,
  isEmpty,
  emptyHint,
  bodyClassName,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  loading?: boolean;
  error?: unknown;
  isEmpty?: boolean;
  emptyHint?: string;
  bodyClassName?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Card className={`flex h-full flex-col hover:shadow-card-hover ${className ?? ""}`}>
      <CardHeader title={title} subtitle={subtitle} icon={icon} action={action} />
      <div className={bodyClassName ?? "px-6 pb-6 pt-1"}>
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
  const [days, setDays] = useState(30);

  const overview = useApi<Overview>(`/admin/stats/overview/?days=${days}`);
  const sales = useApi<SalesResp>(`/admin/stats/sales/?days=${days}`);
  const status = useApi<Listed<StatusSlice>>("/admin/stats/orders-by-status/");
  const payments = useApi<Listed<PaymentSlice>>("/admin/stats/payments/");
  const topProducts = useApi<Listed<TopProduct>>(`/admin/stats/top-products/?limit=8&days=${days}`);
  const topCategories = useApi<Listed<TopCategory>>(`/admin/stats/top-categories/?days=${days}`);
  const recentOrders = useApi<Listed<RecentOrder>>("/admin/stats/recent-orders/?limit=8");
  const recentMeasurements = useApi<Listed<RecentMeasurement>>(
    "/admin/stats/recent-measurements/?limit=6"
  );
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
    {
      key: "order_number",
      header: "Raqam",
      render: (r) => (
        <Link
          href={`/orders/${r.order_number}`}
          className="font-medium text-navy-800 hover:text-gold-dark"
        >
          {r.order_number}
        </Link>
      ),
    },
    { key: "customer", header: "Mijoz" },
    { key: "status", header: "Holat", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "payment_status",
      header: "To'lov",
      hideOnMobile: true,
      render: (r) => <PaymentBadge status={r.payment_status} />,
    },
    { key: "total", header: "Summa", align: "right", render: (r) => money(r.total) },
    {
      key: "created_at",
      header: "Sana",
      align: "right",
      hideOnMobile: true,
      render: (r) => fmtDate(r.created_at),
    },
  ];

  const measurementCols: Column<RecentMeasurement>[] = [
    {
      key: "customer",
      header: "Mijoz",
      render: (r) => <span className="font-medium text-navy-800">{r.customer}</span>,
    },
    { key: "preferred_date", header: "Sana", render: (r) => fmtDate(r.preferred_date) },
    { key: "time_slot", header: "Vaqt", hideOnMobile: true, render: (r) => r.time_slot || "—" },
    {
      key: "status",
      header: "Holat",
      align: "right",
      render: (r) => <Badge color="navy">{r.status}</Badge>,
    },
  ];

  const reviewCols: Column<PendingReview>[] = [
    {
      key: "product",
      header: "Mahsulot",
      render: (r) => <span className="font-medium text-navy-800">{r.product}</span>,
    },
    { key: "user_name", header: "Mijoz", hideOnMobile: true },
    {
      key: "rating",
      header: "Baho",
      align: "center",
      render: (r) => <Badge color="gold">{r.rating} ★</Badge>,
    },
    {
      key: "comment",
      header: "Izoh",
      render: (r) => (
        <span className="block max-w-[10rem] truncate text-navy-600 sm:max-w-[16rem]">
          {r.comment || "—"}
        </span>
      ),
    },
    {
      key: "created_at",
      header: "Sana",
      align: "right",
      hideOnMobile: true,
      render: (r) => fmtDate(r.created_at),
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* ---- header + period filter ---- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Boshqaruv paneli"
          subtitle="Do'kon ko'rsatkichlari, savdo dinamikasi va so'nggi faoliyat"
        />
        <div className="flex items-center gap-1.5 rounded-xl border border-navy-100 bg-white p-1 shadow-sm shrink-0">
          <CalendarDays className="ml-2 size-4 text-navy-400" />
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                days === p.days
                  ? "bg-gold text-navy-900"
                  : "text-navy-500 hover:bg-navy-50 hover:text-navy-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* ---- KPI row ---- */}
      {overview.error ? (
        <ErrorState error={overview.error} />
      ) : overview.isLoading ? (
        <Card className="p-0">
          <Loading />
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 xl:grid-cols-4">
          <KpiCard
            label="Bugungi savdo"
            value={money(o?.today_sales)}
            delta={d.today_sales_pct}
            icon={<Banknote className="size-5" />}
            accent
          />
          <KpiCard
            label="Oylik savdo"
            value={money(o?.month_sales)}
            delta={d.month_sales_pct}
            icon={<TrendingUp className="size-5" />}
          />
          <KpiCard
            label="Buyurtmalar (oy)"
            value={num(o?.orders_month)}
            delta={d.orders_pct}
            icon={<ClipboardList className="size-5" />}
          />
          <KpiCard
            label="O'rtacha chek"
            value={money(o?.avg_check)}
            delta={d.avg_check_pct}
            icon={<Receipt className="size-5" />}
          />
          <KpiCard
            label="Yangi mijozlar"
            value={num(o?.new_customers_month)}
            delta={d.new_customers_pct}
            icon={<UserPlus className="size-5" />}
          />
          <KpiCard
            label="Kutilayotgan buyurtma"
            value={num(o?.pending_orders)}
            icon={<ClipboardList className="size-5" />}
          />
          <KpiCard
            label="O'lchov so'rovlari"
            value={num(o?.measurement_requests)}
            icon={<Ruler className="size-5" />}
          />
          <KpiCard
            label="Konversiya"
            value={o?.conversion != null ? pct(o.conversion) : "—"}
            delta={d.conversion_pct}
            icon={<Users className="size-5" />}
          />
        </div>
      )}

      {/* ---- chart row 1: Savdo dinamikasi (full) ---- */}
      <div className="animate-rise">
        <Section
          title="Savdo dinamikasi"
          subtitle={`So'nggi ${days} kun`}
          icon={<Activity className="size-5" />}
          action={<ViewAll href="/orders" label="Buyurtmalar" />}
          loading={sales.isLoading}
          error={sales.error}
          isEmpty={!sales.data?.points?.length}
        >
          <SalesAreaChart points={sales.data?.points ?? []} />
        </Section>
      </div>

      {/* ---- chart row 2: To'lov usullari + Top mahsulotlar + Top kategoriyalar ---- */}
      <div className="grid animate-rise grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
        <Section
          title="To'lov usullari"
          subtitle="Tushum manbalari"
          icon={<CreditCard className="size-5" />}
          loading={payments.isLoading}
          error={payments.error}
          isEmpty={!payments.data?.items?.length}
        >
          <PaymentsBar items={payments.data?.items ?? []} />
        </Section>
        <Section
          title="Top mahsulotlar"
          subtitle={`Daromad bo'yicha (${days} kun)`}
          icon={<Trophy className="size-5" />}
          action={<ViewAll href="/dashboard/top-products" />}
          loading={topProducts.isLoading}
          error={topProducts.error}
          isEmpty={!productItems.length}
        >
          <TopList items={productItems} metric="revenue" />
        </Section>
        <Section
          title="Top kategoriyalar"
          subtitle={`Daromad bo'yicha (${days} kun)`}
          icon={<Layers className="size-5" />}
          action={<ViewAll href="/dashboard/top-categories" />}
          loading={topCategories.isLoading}
          error={topCategories.error}
          isEmpty={!categoryItems.length}
        >
          <TopList items={categoryItems} metric="revenue" />
        </Section>
      </div>

      {/* ---- tables ---- */}
      <div className="animate-rise space-y-4 sm:space-y-6">
        {/* Oxirgi buyurtmalar — full width */}
        <Section
          title="Oxirgi buyurtmalar"
          subtitle="So'nggi faoliyat"
          icon={<ShoppingBag className="size-5" />}
          action={
            <div className="flex items-center gap-2">
              <CountChip n={recentOrders.data?.items?.length} />
              <ViewAll href="/orders" />
            </div>
          }
          loading={recentOrders.isLoading}
          error={recentOrders.error}
          bodyClassName="px-2 pb-3 pt-1 sm:px-6"
        >
          <DataTable
            columns={orderCols}
            rows={recentOrders.data?.items}
            rowKey={(r) => r.order_number}
            empty="Buyurtmalar yo'q"
          />
        </Section>

        {/* Tor jadvallar yonma-yon */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
          <Section
            title="Yangi o'lchov so'rovlari"
            subtitle="Rejalashtirilgan uchrashuvlar"
            icon={<Ruler className="size-5" />}
            action={
              <div className="flex items-center gap-2">
                <CountChip n={recentMeasurements.data?.items?.length} />
                <ViewAll href="/measurements" />
              </div>
            }
            loading={recentMeasurements.isLoading}
            error={recentMeasurements.error}
            bodyClassName="px-2 pb-3 pt-1 sm:px-6"
          >
            <DataTable
              columns={measurementCols}
              rows={recentMeasurements.data?.items}
              rowKey={(r) => r.id}
              empty="So'rovlar yo'q"
            />
          </Section>
        </div>

        {/* Buyurtmalar holati — alohida qatorda, to'liq kenglik */}
        <Section
          title="Buyurtmalar holati"
          subtitle="Joriy taqsimot"
          icon={<PieChart className="size-5" />}
          action={<ViewAll href="/orders" label="Buyurtmalar" />}
          loading={status.isLoading}
          error={status.error}
          isEmpty={!status.data?.items?.length}
        >
          <StatusDonut items={status.data?.items ?? []} />
        </Section>

        {/* Yangi sharhlar — full width */}
        <Section
          title="Yangi sharhlar"
          subtitle="Moderatsiya kutilmoqda"
          icon={<Star className="size-5" />}
          action={
            <div className="flex items-center gap-2">
              <CountChip n={pendingReviews.data?.items?.length} />
              <ViewAll href="/reviews" />
            </div>
          }
          loading={pendingReviews.isLoading}
          error={pendingReviews.error}
          bodyClassName="px-2 pb-3 pt-1 sm:px-6"
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
