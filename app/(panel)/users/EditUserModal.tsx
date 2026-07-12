"use client";

import { useEffect, useState } from "react";

import { api, ApiError } from "@/lib/api";
import type { AdminUser, Lang, Role } from "@/lib/types";

import { Button, Input, Select, Field } from "@/components/ui";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";

interface Form {
  full_name: string;
  email: string;
  role: Role;
  language: Lang;
  is_active: boolean;
}

export function EditUserModal({
  user,
  onClose,
  onSaved,
}: {
  user: AdminUser | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Form>({
    full_name: "",
    email: "",
    role: "customer",
    language: "uz",
    is_active: true,
  });

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name ?? "",
        email: user.email ?? "",
        role: user.role,
        language: user.language,
        is_active: user.is_active,
      });
    }
  }, [user]);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await api(`/admin/users/${user.id}/`, {
        method: "PATCH",
        body: form,
      });
      toast("Foydalanuvchi saqlandi", "success");
      onSaved();
      onClose();
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "Xatolik yuz berdi";
      toast(msg, "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={!!user}
      onClose={onClose}
      title="Foydalanuvchini tahrirlash"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Bekor qilish
          </Button>
          <Button onClick={save} loading={saving}>
            Saqlash
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Telefon">
          <Input value={user?.phone ?? ""} disabled readOnly />
        </Field>

        <Field label="Ism">
          <Input
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
        </Field>

        <Field label="Email">
          <Input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Rol">
            <Select
              className="w-full"
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as Role })
              }
            >
              <option value="customer">Mijoz</option>
              <option value="employee">Xodim</option>
              <option value="manager">Menejer</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>

          <Field label="Til">
            <Select
              className="w-full"
              value={form.language}
              onChange={(e) =>
                setForm({ ...form, language: e.target.value as Lang })
              }
            >
              <option value="uz">O'zbekcha</option>
              <option value="ru">Ruscha</option>
            </Select>
          </Field>

          <Field label="Holat">
            <Select
              className="w-full"
              value={form.is_active ? "true" : "false"}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.value === "true" })
              }
            >
              <option value="true">Faol</option>
              <option value="false">Nofaol</option>
            </Select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
