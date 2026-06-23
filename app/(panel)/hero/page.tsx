"use client";

import { useApi } from "@/lib/api";
import { Card, ErrorState, EmptyState, Loading } from "@/components/ui";
import { PageHeader } from "@/components/ui/page";
import { asList } from "../_shared/list";

type HeroObj = Record<string, unknown>;

function isImageUrl(v: unknown): v is string {
  return typeof v === "string" && /^https?:\/\//.test(v) && /\.(png|jpe?g|webp|gif|svg)/i.test(v);
}

function renderValue(v: unknown): React.ReactNode {
  if (v == null || v === "") return <span className="text-navy-300">—</span>;
  if (typeof v === "boolean") return v ? "Ha" : "Yo'q";
  if (isImageUrl(v)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={v} alt="" className="mt-1 h-24 rounded-md object-cover border border-navy-100" />
    );
  }
  if (typeof v === "object") return <code className="text-xs text-navy-500">{JSON.stringify(v)}</code>;
  return String(v);
}

function HeroCard({ hero }: { hero: HeroObj }) {
  const entries = Object.entries(hero).filter(([k]) => k !== "id");
  return (
    <Card className="p-5">
      <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs uppercase tracking-wide text-navy-400">{k}</dt>
            <dd className="mt-0.5 text-sm text-navy-800">{renderValue(v)}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export default function HeroPage() {
  const { data, error, isLoading } = useApi<unknown>("/hero/");

  // Normalize: data may be a single object or an array / { results }.
  let items: HeroObj[] = [];
  if (data && typeof data === "object" && !Array.isArray(data) && !("results" in (data as object))) {
    items = [data as HeroObj];
  } else {
    items = asList<HeroObj>(data);
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Hero matnlari" />
      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <Loading />
      ) : items.length === 0 ? (
        <Card className="overflow-hidden">
          <EmptyState title="Hero matnlari topilmadi" />
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((h, i) => (
            <HeroCard key={(h.id as number) ?? i} hero={h} />
          ))}
        </div>
      )}
    </div>
  );
}
