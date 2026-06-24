"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type { OrderDetail, OrderItem, OrderStatus } from "@/lib/types";
import { money, fmtDateTime } from "@/lib/format";

import {
  Card,
  CardHeader,
  Button,
  Select,
  StatusBadge,
  PaymentBadge,
  Loading,
  ErrorState,
} from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { Thumb } from "@/components/ui/thumb";
import { useToast } from "@/components/ui/toast";
import { ORDER_STATUS_OPTIONS } from "@/components/ui";

export default function OrderDetailPage() {
  const params = useParams<{ order_number: string }>();
  const orderNumber = params?.order_number;
  const toast = useToast();

  const { data, error, isLoading, mutate } = useApi<OrderDetail>(
    orderNumber ? `/admin/orders/${orderNumber}/` : null
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
          <Thumb
            src={it.image}
            alt={it.product_name_snapshot}
            className="size-10 rounded-lg object-cover border border-navy-100"
          />
        ) : (
          <div className="size-10 rounded-lg bg-navy-50 border border-navy-100" />
        ),
    },
    {
      key: "product_name_snapshot",
      header: "Nomi",
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
                className="size-4 rounded-full border border-navy-200"
                style={{ backgroundColor: it.color_hex }}
              />
            )}
            {it.color}
          </span>
        ) : (
          "—"
        ),
    },
    {
      key: "size",
      header: "O'lcham",
      render: (it) =>
        it.width_cm != null && it.height_cm != null
          ? `${it.width_cm}×${it.height_cm} sm`
          : "—",
    },
    {
      key: "unit_price",
      header: "Narx",
      align: "right",
      render: (it) => money(it.unit_price),
    },
    {
      key: "quantity",
      header: "Soni",
      align: "center",
      render: (it) => it.quantity,
    },
    {
      key: "line_total",
      header: "Jami",
      align: "right",
      render: (it) => (
        <span className="font-medium text-navy-800">{money(it.line_total)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 hover:text-navy-800"
      >
        <ArrowLeft className="size-4" />
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
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4 p-5">
              <div className="space-y-1">
                <h1 className="text-xl font-semibold text-navy-900">
                  {data.order_number}
                </h1>
                <p className="text-sm text-navy-500">{data.customer || "—"}</p>
                <p className="text-xs text-navy-400">
                  {fmtDateTime(data.created_at)}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <StatusBadge status={data.status} />
                  <PaymentBadge status={data.payment_status} />
                </div>
              </div>

              <div className="flex items-end gap-2">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                >
                  {ORDER_STATUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
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
          </Card>

          <Card>
            <CardHeader title="Mahsulotlar" />
            <DataTable
              columns={itemCols}
              rows={data.items ?? []}
              empty="Mahsulot yo'q"
              rowKey={(it) => it.id}
            />
          </Card>

          <Card className="max-w-md">
            <CardHeader title="Hisob" />
            <div className="space-y-2 px-5 pb-5 text-sm">
              <Row label="Oraliq summa" value={money(data.subtotal)} />
              <Row label="Chegirma" value={money(data.discount)} />
              <Row label="Yetkazib berish" value={money(data.delivery_fee)} />
              <div className="my-2 border-t border-navy-100" />
              <Row
                label="Jami"
                value={money(data.total)}
                bold
              />
              <div className="my-2 border-t border-navy-100" />
              <Row
                label="To'lov tizimi"
                value={data.payment_provider || "—"}
              />
              {data.comment && (
                <div className="pt-2">
                  <p className="text-navy-400">Izoh</p>
                  <p className="mt-0.5 text-navy-700">{data.comment}</p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: React.ReactNode;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-navy-400">{label}</span>
      <span className={bold ? "font-semibold text-navy-900" : "text-navy-700"}>
        {value}
      </span>
    </div>
  );
}
