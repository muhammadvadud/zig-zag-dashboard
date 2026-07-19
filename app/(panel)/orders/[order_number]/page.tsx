"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Package,
  CreditCard,
  Calendar,
  Hash,
  ChevronRight,
} from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type { OrderDetail, OrderItem, OrderStatus } from "@/lib/types";
import { money, fmtDateTime } from "@/lib/format";
import { nextStatuses, isTerminalStatus } from "@/lib/orderFlow";

import {
  Card,
  Button,
  Select,
  StatusBadge,
  PaymentBadge,
  Loading,
  ErrorState,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { useToast } from "@/components/ui/toast";
import { ORDER_STATUS_OPTIONS } from "@/components/ui";

export default function OrderDetailPage() {
  const params = useParams<{ order_number: string }>();
  const orderNumber = params?.order_number;
  const toast = useToast();

  const { data, error, isLoading, mutate } = useApi<OrderDetail>(
    orderNumber ? `/admin/orders/${orderNumber}/` : null,
  );

  const [status, setStatus] = useState<OrderStatus | "">("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data?.status) setStatus(data.status);
  }, [data?.status]);

  async function save() {
    if (!orderNumber || !status) return;
    setSaving(true);
    try {
      await api(`/admin/orders/${orderNumber}/`, {
        method: "PATCH",
        body: { status },
      });
      await mutate();
      toast("Holat yangilandi", "success");
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Xatolik yuz berdi";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  const itemCols: Column<OrderItem>[] = [
    {
      key: "image",
      header: "Rasm",
      render: (it) =>
        it.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={it.image}
            alt={it.product_name_snapshot}
            className="size-11 rounded-xl object-cover border border-navy-100 shadow-sm"
          />
        ) : (
          <div className="size-11 rounded-xl bg-navy-50 border border-navy-100 flex items-center justify-center text-navy-300">
            <Package className="size-5" />
          </div>
        ),
    },
    {
      key: "product_name_snapshot",
      header: "Mahsulot",
      render: (it) => (
        <span className="font-medium text-navy-800">
          {it.product_name_snapshot}
        </span>
      ),
    },
    {
      key: "color",
      header: "Rang",
      render: (it) =>
        it.color ? (
          <span className="inline-flex items-center gap-2">
            {it.color_hex && (
              <span
                className="size-4 rounded-full border border-navy-200 shadow-sm"
                style={{ backgroundColor: it.color_hex }}
              />
            )}
            <span className="text-navy-700">{it.color}</span>
          </span>
        ) : (
          <span className="text-navy-300">—</span>
        ),
    },
    {
      key: "size",
      header: "O'lcham",
      render: (it) =>
        it.width_cm != null && it.height_cm != null ? (
          <span className="text-navy-700 font-mono text-xs bg-navy-50 px-2 py-0.5 rounded-lg">
            {it.width_cm}×{it.height_cm} sm
          </span>
        ) : (
          <span className="text-navy-300">—</span>
        ),
    },
    {
      key: "unit_price",
      header: "Narx",
      align: "right",
      render: (it) => (
        <span className="text-navy-600">{money(it.unit_price)}</span>
      ),
    },
    {
      key: "quantity",
      header: "Soni",
      align: "center",
      render: (it) => (
        <span className="inline-flex items-center justify-center size-7 rounded-lg bg-navy-50 text-navy-700 text-sm font-medium">
          {it.quantity}
        </span>
      ),
    },
    {
      key: "line_total",
      header: "Jami",
      align: "right",
      render: (it) => (
        <span className="font-semibold text-navy-800">
          {money(it.line_total)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-5 animate-rise">
      {/* Back link */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-colors group"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Buyurtmalarga qaytish
      </Link>

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : !data ? (
        <ErrorState error={new Error("Buyurtma topilmadi")} />
      ) : (
        <>
          {/* ── Header card ── */}
          <Card>
            <div className="p-5 space-y-4">
              {/* Title row */}
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-navy-400 text-xs">
                    <Hash className="size-3.5" />
                    <span>Buyurtma raqami</span>
                  </div>
                  <h1 className="text-2xl font-bold text-navy-900 tracking-tight">
                    {data.order_number}
                  </h1>
                  <div className="flex items-center gap-1.5 text-xs text-navy-400">
                    <Calendar className="size-3.5" />
                    <span>{fmtDateTime(data.created_at)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge status={data.status} />
                  <PaymentBadge status={data.payment_status} />
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-navy-100" />

              {/* Status changer */}
              {isTerminalStatus(data.status) ? (
                <p className="text-sm text-navy-400 italic">
                  Bu buyurtma yakuniy holatda — holatni o&apos;zgartirib
                  bo&apos;lmaydi.
                </p>
              ) : (
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm text-navy-500 font-medium">Holatni o&apos;zgartirish:</p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as OrderStatus)}
                    >
                      <option value={data.status} disabled>
                        {ORDER_STATUS_OPTIONS.find((o) => o.value === data.status)
                          ?.label ?? data.status}{" "}
                        (joriy)
                      </option>
                      {nextStatuses(data.status).map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_OPTIONS.find((o) => o.value === s)
                            ?.label ?? s}
                        </option>
                      ))}
                    </Select>
                    <Button
                      onClick={save}
                      loading={saving}
                      disabled={!status || status === data.status}
                    >
                      Saqlash
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* ── Info grid ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Customer */}
            <InfoCard
              icon={<User className="size-4" />}
              label="Buyurtma beruvchi"
            >
              <div className="space-y-2">
                <p className="font-semibold text-navy-800 text-base">
                  {data.customer?.full_name || "—"}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-navy-500">
                  <Phone className="size-3.5 shrink-0" />
                  <span>{data.customer?.phone || "—"}</span>
                </div>
              </div>
            </InfoCard>

            {/* Recipient — agar boshqa odam qabul qilsa */}
            {data.recipient && (
              <InfoCard
                icon={<User className="size-4" />}
                label="Buyurtmani qabul qiluvchi"
              >
                <div className="space-y-2">
                  <p className="font-semibold text-navy-800 text-base">
                    {data.recipient.full_name || "—"}
                  </p>
                  <div className="flex items-center gap-1.5 text-sm text-navy-500">
                    <Phone className="size-3.5 shrink-0" />
                    <span>{data.recipient.phone || "—"}</span>
                  </div>
                </div>
              </InfoCard>
            )}

            {/* To'lov ma'lumoti */}
            <InfoCard
              icon={<CreditCard className="size-4" />}
              label="To'lov"
            >
              <div className="space-y-2">
                <p className="font-semibold text-navy-800 text-base capitalize">
                  {data.payment_provider || "—"}
                </p>
                <div className="pt-1">
                  <PaymentBadge status={data.payment_status} />
                </div>
              </div>
            </InfoCard>

            {/* Yetkazib berish manzili */}
            <InfoCard
              icon={<MapPin className="size-4" />}
              label="Yetkazib berish manzili"
              className="md:col-span-2 lg:col-span-3"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gold-dark bg-gold/10 ring-1 ring-gold/25 px-2.5 py-0.5 rounded-lg">
                    {data.delivery_method === "pickup" ? "O'zi olib ketish" : "Pochta orqali yuborish"}
                  </span>
                </div>

                {data.delivery_method === "pickup" ? (
                  <p className="text-sm text-navy-500">
                    Mijoz buyurtmani do'kondan o'zi olib ketadi.
                  </p>
                ) : data.address ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="space-y-1">
                      <span className="text-xs text-navy-400 block font-medium uppercase tracking-wider">Viloyat / Shahar</span>
                      <p className="text-sm font-semibold text-navy-800">{data.address.city || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-navy-400 block font-medium uppercase tracking-wider">Tuman / Shahar tumani</span>
                      <p className="text-sm font-semibold text-navy-800">{data.address.district || "—"}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-navy-400 block font-medium uppercase tracking-wider">Ko'cha, uy / xonadon</span>
                      <p className="text-sm font-semibold text-navy-800">{data.address.address || "—"}</p>
                    </div>
                    {data.address.landmark && (
                      <div className="space-y-1 sm:col-span-3 pt-2 border-t border-navy-100/50">
                        <span className="text-xs text-navy-400 block font-medium uppercase tracking-wider">Mo'ljal (Landmark)</span>
                        <p className="text-sm font-semibold text-navy-800">{data.address.landmark}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-navy-400 italic">Manzil ma'lumotlari kiritilmagan.</p>
                )}
              </div>
            </InfoCard>

            {/* Comment */}
            {data.comment && (
              <InfoCard
                icon={<MessageSquare className="size-4" />}
                label="Izoh"
                className="md:col-span-2 lg:col-span-3"
              >
                <p className="text-navy-700 text-sm leading-relaxed whitespace-pre-line">
                  {data.comment}
                </p>
              </InfoCard>
            )}
          </div>

          {/* ── Products + Billing ── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 items-start">
            {/* Products table */}
            <Card>
              <div className="flex items-center justify-between px-5 pt-5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-gold/12 text-gold-dark ring-1 ring-gold/15">
                    <Package className="size-4" />
                  </span>
                  <h3 className="font-semibold text-navy-800">Mahsulotlar</h3>
                </div>
                <span className="text-xs text-navy-400 bg-navy-50 px-2.5 py-1 rounded-full font-medium">
                  {data.items?.length ?? 0} ta
                </span>
              </div>
              <DataTable
                columns={itemCols}
                rows={data.items ?? []}
                empty="Mahsulot yo'q"
                rowKey={(it) => it.id}
              />
            </Card>

            {/* Billing summary */}
            <Card className="sticky top-5">
              <div className="px-5 pt-5 pb-3 border-b border-navy-100">
                <div className="flex items-center gap-2">
                  <span className="flex size-8 items-center justify-center rounded-xl bg-gold/12 text-gold-dark ring-1 ring-gold/15">
                    <CreditCard className="size-4" />
                  </span>
                  <h3 className="font-semibold text-navy-800">Hisob</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <BillingRow label="Oraliq summa" value={money(data.subtotal)} />
                {parseFloat(data.discount) > 0 && (
                  <BillingRow
                    label="Chegirma"
                    value={`− ${money(data.discount)}`}
                    valueClassName="text-green-600"
                  />
                )}
                <BillingRow
                  label="Yetkazib berish"
                  value={money(data.delivery_fee)}
                />
                <div className="border-t border-navy-100 pt-3">
                  <BillingRow
                    label="Jami"
                    value={money(data.total)}
                    bold
                  />
                </div>
                {data.payment_provider && (
                  <div className="pt-2 border-t border-navy-100">
                    <BillingRow
                      label="To'lov tizimi"
                      value={
                        <span className="capitalize font-medium text-navy-700">
                          {data.payment_provider}
                        </span>
                      }
                    />
                  </div>
                )}
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Helpers ── */

function InfoCard({
  icon,
  label,
  children,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-navy-100/80 bg-white/95 shadow-soft p-5 space-y-3 card-lift ${className ?? ""}`}
    >
      <div className="flex items-center gap-2 text-navy-400">
        <span className="flex size-7 items-center justify-center rounded-lg bg-navy-50 ring-1 ring-navy-100">
          {icon}
        </span>
        <span className="text-xs font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function BillingRow({
  label,
  value,
  bold,
  valueClassName,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
  valueClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={bold ? "font-semibold text-navy-800" : "text-navy-400"}>
        {label}
      </span>
      <span
        className={`${bold ? "font-bold text-navy-900 text-base" : "text-navy-700"} ${valueClassName ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}
