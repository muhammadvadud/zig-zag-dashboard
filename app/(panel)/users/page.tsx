"use client";

import { useState } from "react";

import { useApi } from "@/lib/api";
import type { AdminUser, Paginated, Role } from "@/lib/types";
import { fmtDate } from "@/lib/format";

import {
  Card,
  Select,
  Badge,
  ErrorState,
} from "@/components/ui";
import { DataTable, Pagination, type Column } from "@/components/ui/table";
import { PageHeader, SearchInput } from "@/components/ui/page";
import { EditUserModal } from "./EditUserModal";

const PAGE_SIZE = 20;

const ROLE_META: Record<Role, { label: string; color: "gold" | "blue" | "navy" }> = {
  admin: { label: "Admin", color: "gold" },
  manager: { label: "Menejer", color: "blue" },
  customer: { label: "Mijoz", color: "navy" },
};

function initials(name: string): string {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function UsersPage() {
  const [role, setRole] = useState("");
  const [isActive, setIsActive] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<AdminUser | null>(null);

  const qs = new URLSearchParams();
  if (role) qs.set("role", role);
  if (isActive) qs.set("is_active", isActive);
  if (search) qs.set("search", search);
  qs.set("page", String(page));

  const { data, error, isLoading, mutate } = useApi<Paginated<AdminUser>>(
    `/admin/users/?${qs.toString()}`
  );

  const rows = data?.results ?? [];

  const columns: Column<AdminUser>[] = [
    {
      key: "avatar",
      header: "",
      render: (u) => (
        <span className="flex size-9 items-center justify-center rounded-full bg-navy-50 text-xs font-semibold text-navy-700">
          {initials(u.full_name)}
        </span>
      ),
    },
    { key: "phone", header: "Telefon", render: (u) => u.phone || "—" },
    {
      key: "full_name",
      header: "Ism",
      render: (u) => (
        <span className="font-medium text-navy-800">{u.full_name || "—"}</span>
      ),
    },
    {
      key: "role",
      header: "Rol",
      render: (u) => {
        const m = ROLE_META[u.role] ?? { label: u.role, color: "gray" as const };
        return <Badge color={m.color}>{m.label}</Badge>;
      },
    },
    {
      key: "is_phone_verified",
      header: "Tasdiqlangan",
      align: "center",
      render: (u) =>
        u.is_phone_verified ? (
          <Badge color="green">✓</Badge>
        ) : (
          <Badge color="gray">✗</Badge>
        ),
    },
    {
      key: "is_active",
      header: "Faol",
      align: "center",
      render: (u) =>
        u.is_active ? (
          <Badge color="green">Faol</Badge>
        ) : (
          <Badge color="gray">Nofaol</Badge>
        ),
    },
    {
      key: "date_joined",
      header: "Ro'yxatdan o'tgan",
      render: (u) => fmtDate(u.date_joined),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Foydalanuvchilar" />

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={role}
          onChange={(e) => {
            setRole(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi (rol)</option>
          <option value="customer">Mijoz</option>
          <option value="manager">Menejer</option>
          <option value="admin">Admin</option>
        </Select>

        <Select
          value={isActive}
          onChange={(e) => {
            setIsActive(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Hammasi (holat)</option>
          <option value="true">Faol</option>
          <option value="false">Nofaol</option>
        </Select>

        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Ism yoki telefon..."
          className="min-w-[220px] flex-1"
        />
      </div>

      <Card>
        {error ? (
          <div className="p-5">
            <ErrorState error={error} />
          </div>
        ) : (
          <>
            <DataTable
              columns={columns}
              rows={rows}
              loading={isLoading}
              empty="Foydalanuvchilar topilmadi"
              rowKey={(u) => u.id}
              onRowClick={(u) => setEditing(u)}
            />
            <Pagination
              page={page}
              count={data?.count ?? 0}
              pageSize={PAGE_SIZE}
              onPage={setPage}
            />
          </>
        )}
      </Card>

      <EditUserModal
        user={editing}
        onClose={() => setEditing(null)}
        onSaved={() => mutate()}
      />
    </div>
  );
}
