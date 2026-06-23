"use client";

import { Badge } from "@/components/ui";
import type { Column } from "@/components/ui/table";
import { ListPage } from "../_shared/list";

interface Row {
  id: number;
  title?: string;
  eyebrow?: string;
  subtitle?: string;
  link?: string;
  image?: string | null;
  is_active?: boolean;
}

const columns: Column<Row>[] = [
  {
    key: "image",
    header: "Rasm",
    render: (r) =>
      r.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={r.image}
          alt={r.title || "banner"}
          className="h-10 w-16 rounded-md object-cover border border-navy-100"
        />
      ) : (
        <span className="text-navy-300">—</span>
      ),
  },
  {
    key: "title",
    header: "Sarlavha",
    render: (r) => (
      <div>
        {r.eyebrow && <div className="text-xs text-gold-dark">{r.eyebrow}</div>}
        <span className="font-medium text-navy-800">{r.title || "—"}</span>
      </div>
    ),
  },
  {
    key: "link",
    header: "Havola",
    render: (r) =>
      r.link ? (
        <span className="text-navy-500 max-w-[16rem] truncate inline-block align-bottom">{r.link}</span>
      ) : (
        "—"
      ),
  },
  {
    key: "is_active",
    header: "Holat",
    render: (r) =>
      r.is_active == null ? "—" : r.is_active ? <Badge color="green">Faol</Badge> : <Badge color="gray">Nofaol</Badge>,
  },
];

export default function BannersPage() {
  return (
    <ListPage<Row>
      title="Bannerlar"
      path="/banners/"
      columns={columns}
      rowKey={(r) => r.id}
      empty="Bannerlar topilmadi"
    />
  );
}
