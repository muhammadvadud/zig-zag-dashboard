"use client";

import { Badge } from "@/components/ui";
import { money } from "@/lib/format";
import type { Column } from "@/components/ui/table";
import { ListPage } from "../_shared/list";

interface Row {
  id: number;
  code?: string;
  name?: string;
  price?: string | number;
  price_per_m2?: string | number | null;
  is_popular?: boolean;
}

const columns: Column<Row>[] = [
  { key: "name", header: "Nomi", render: (r) => <span className="font-medium text-navy-800">{r.name || "—"}</span> },
  {
    key: "price",
    header: "Narx",
    align: "right",
    render: (r) => <span className="font-medium text-navy-800">{money(r.price ?? 0)}</span>,
  },
  {
    key: "price_per_m2",
    header: "1 m² narxi",
    align: "right",
    render: (r) => (r.price_per_m2 == null ? "—" : money(r.price_per_m2)),
  },
  {
    key: "is_popular",
    header: "Mashhur",
    align: "center",
    render: (r) => (r.is_popular ? <Badge color="gold">Mashhur</Badge> : "—"),
  },
];

export default function TariffsPage() {
  return (
    <ListPage<Row>
      title="Tariflar"
      path="/tariffs/"
      columns={columns}
      rowKey={(r) => r.code ?? r.id}
      empty="Tariflar topilmadi"
    />
  );
}
