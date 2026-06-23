"use client";

import { Badge } from "@/components/ui";
import type { Column } from "@/components/ui/table";
import { ListPage } from "../_shared/list";

interface Row {
  id: number;
  name?: string;
  slug?: string;
  is_active?: boolean;
  sort_order?: number;
}

const columns: Column<Row>[] = [
  { key: "name", header: "Nomi", render: (r) => <span className="font-medium text-navy-800">{r.name || "—"}</span> },
  { key: "slug", header: "Slug", render: (r) => <span className="text-navy-500">{r.slug || "—"}</span> },
  {
    key: "is_active",
    header: "Holat",
    render: (r) =>
      r.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
  },
  { key: "sort_order", header: "Tartib", align: "center", render: (r) => r.sort_order ?? "—" },
];

export default function CategoriesPage() {
  return (
    <ListPage<Row>
      title="Kategoriyalar"
      path="/categories/"
      columns={columns}
      rowKey={(r) => r.slug ?? r.id}
      empty="Kategoriyalar topilmadi"
    />
  );
}
