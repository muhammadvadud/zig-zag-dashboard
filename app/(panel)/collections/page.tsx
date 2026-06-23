"use client";

import { Badge } from "@/components/ui";
import type { Column } from "@/components/ui/table";
import { ListPage } from "../_shared/list";

interface Row {
  id: number;
  title?: string;
  name?: string;
  slug?: string;
  products_count?: number;
  products?: unknown[];
  is_active?: boolean;
}

function count(r: Row): React.ReactNode {
  if (typeof r.products_count === "number") return r.products_count;
  if (Array.isArray(r.products)) return r.products.length;
  return "—";
}

const columns: Column<Row>[] = [
  {
    key: "title",
    header: "Nomi",
    render: (r) => <span className="font-medium text-navy-800">{r.title || r.name || "—"}</span>,
  },
  { key: "slug", header: "Slug", render: (r) => <span className="text-navy-500">{r.slug || "—"}</span> },
  { key: "products_count", header: "Mahsulotlar", align: "center", render: count },
  {
    key: "is_active",
    header: "Holat",
    render: (r) =>
      r.is_active == null ? "—" : r.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
  },
];

export default function CollectionsPage() {
  return (
    <ListPage<Row>
      title="Kolleksiyalar"
      path="/collections/"
      columns={columns}
      rowKey={(r) => r.slug ?? r.id}
      empty="Kolleksiyalar topilmadi"
    />
  );
}
