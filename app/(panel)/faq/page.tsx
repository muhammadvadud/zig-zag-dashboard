"use client";

import type { Column } from "@/components/ui/table";
import { ListPage, truncate } from "../_shared/list";

interface Row {
  id: number;
  question?: string;
  question_uz?: string;
  answer?: string;
  answer_uz?: string;
  sort_order?: number;
}

const columns: Column<Row>[] = [
  {
    key: "question",
    header: "Savol",
    className: "max-w-xs !whitespace-normal",
    render: (r) => <span className="font-medium text-navy-800">{r.question || r.question_uz || "—"}</span>,
  },
  {
    key: "answer",
    header: "Javob",
    className: "max-w-md !whitespace-normal",
    render: (r) => <span className="text-navy-600">{truncate(r.answer || r.answer_uz, 140)}</span>,
  },
  { key: "sort_order", header: "Tartib", align: "center", render: (r) => r.sort_order ?? "—" },
];

export default function FaqPage() {
  return (
    <ListPage<Row>
      title="FAQ"
      path="/faq/"
      columns={columns}
      rowKey={(r) => r.id}
      empty="Savollar topilmadi"
    />
  );
}
