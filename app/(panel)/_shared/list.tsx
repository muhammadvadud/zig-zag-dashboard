"use client";

import { useApi } from "@/lib/api";
import { Card, ErrorState, EmptyState } from "@/components/ui";
import { DataTable, type Column } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page";

// Public list endpoints may return either a bare array or { results: [...] }.
export function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object" && Array.isArray((data as { results?: unknown }).results)) {
    return (data as { results: T[] }).results;
  }
  return [];
}

// A reusable read-only list page backed by a public endpoint.
export function ListPage<T>({
  title,
  subtitle,
  path,
  columns,
  rowKey,
  empty,
}: {
  title: string;
  subtitle?: string;
  path: string;
  columns: Column<T>[];
  rowKey?: (row: T, i: number) => string | number;
  empty?: string;
}) {
  const { data, error, isLoading } = useApi<unknown>(path);
  const rows = asList<T>(data);

  return (
    <div className="space-y-5">
      <PageHeader title={title} subtitle={subtitle} />
      {error ? (
        <ErrorState error={error} />
      ) : (
        <Card className="overflow-hidden">
          <DataTable<T>
            columns={columns}
            rows={rows}
            loading={isLoading}
            rowKey={rowKey}
            empty={empty}
          />
        </Card>
      )}
    </div>
  );
}

// Placeholder page for sections without an admin endpoint yet.
export function Placeholder({ title }: { title: string }) {
  return (
    <div className="space-y-5">
      <PageHeader title={title} />
      <Card className="overflow-hidden">
        <EmptyState
          title="Tez orada"
          hint="Bu bo'lim tez orada qo'shiladi"
        />
      </Card>
    </div>
  );
}

// Star rating display — hidden when value is 0 (no reviews yet).
export function Stars({ value }: { value: number }) {
  if (!value || value <= 0) return null;
  const n = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span className="text-gold" title={`${value} / 5`}>
      {"★".repeat(n)}
      <span className="text-navy-200">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export function truncate(s: string | null | undefined, len = 80): string {
  if (!s) return "—";
  return s.length > len ? s.slice(0, len).trimEnd() + "…" : s;
}
