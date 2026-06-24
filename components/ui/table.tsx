"use client";

import { cn } from "@/lib/cn";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Loading, EmptyState } from "./index";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "right" | "center";
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty,
  onRowClick,
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[] | undefined;
  loading?: boolean;
  empty?: string;
  onRowClick?: (row: T) => void;
  rowKey?: (row: T, i: number) => string | number;
}) {
  if (loading) return <Loading />;
  if (!rows || rows.length === 0) return <EmptyState title={empty || "Ma'lumot yo'q"} />;

  const cell = (c: Column<T>, row: T): React.ReactNode =>
    c.render ? c.render(row) : ((row as Record<string, unknown>)[c.key] as React.ReactNode);

  // Columns with an empty header act as action/icon columns (no label in card view).
  const actionCols = columns.filter((c) => !c.header);
  const labeledCols = columns.filter((c) => c.header);
  const titleCol = labeledCols[0];
  const bodyCols = labeledCols.slice(1);

  return (
    <>
      {/* Desktop / tablet: table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-100 bg-navy-50 text-left text-navy-400">
              {columns.map((c) => (
                <th
                  key={c.key}
                  className={cn(
                    "px-4 py-2.5 text-xs font-semibold uppercase tracking-wide whitespace-nowrap",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center"
                  )}
                >
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr
                key={(rowKey ? rowKey(row, i) : i) ?? i}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn(
                  "border-b border-navy-50 last:border-0 transition-colors hover:bg-navy-50/50",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "px-4 py-3 text-navy-700 whitespace-nowrap",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      c.className
                    )}
                  >
                    {cell(c, row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: card per row */}
      <div className="space-y-3 p-3 md:hidden">
        {rows.map((row, i) => (
          <div
            key={(rowKey ? rowKey(row, i) : i) ?? i}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={cn(
              "rounded-xl border border-navy-100 bg-white p-4 shadow-sm",
              onRowClick && "cursor-pointer active:bg-navy-50"
            )}
          >
            <div className="flex items-start justify-between gap-3">
              {titleCol && (
                <div className="min-w-0 flex-1 font-medium text-navy-800">{cell(titleCol, row)}</div>
              )}
              {actionCols.length > 0 && (
                <div className="flex shrink-0 items-center gap-1">
                  {actionCols.map((c) => (
                    <span key={c.key}>{cell(c, row)}</span>
                  ))}
                </div>
              )}
            </div>
            {bodyCols.length > 0 && (
              <dl className="mt-3 grid gap-2">
                {bodyCols.map((c) => (
                  <div key={c.key} className="flex items-center justify-between gap-3 text-sm">
                    <dt className="shrink-0 text-navy-400">{c.header}</dt>
                    <dd className={cn("min-w-0 text-right text-navy-700", c.className)}>{cell(c, row)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export function Pagination({
  page,
  count,
  pageSize = 20,
  onPage,
}: {
  page: number;
  count: number;
  pageSize?: number;
  onPage: (p: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(count / pageSize));
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 text-sm text-navy-500">
      <span>
        Jami: <b className="text-navy-700">{count}</b>
      </span>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-lg border border-navy-200 p-1.5 disabled:opacity-40 hover:bg-navy-50"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span>
          {page} / {pages}
        </span>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="rounded-lg border border-navy-200 p-1.5 disabled:opacity-40 hover:bg-navy-50"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
