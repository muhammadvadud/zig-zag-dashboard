"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import type { Material } from "@/lib/types";

type FormState = {
  name: string;
  description: string;
  sort_order: string;
  is_active: boolean;
};

function initial(material?: Material | null): FormState {
  return {
    name: material?.name ?? "",
    description: material?.description ?? "",
    sort_order: material ? String(material.sort_order ?? 0) : "0",
    is_active: material?.is_active ?? true,
  };
}

export function MaterialForm({
  material,
  onClose,
  onSaved,
}: {
  material?: Material | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!material;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(material));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) {
      setError("Nomi majburiy");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/materials/${material!.id}/`, { method: "PATCH", body: payload });
      } else {
        await api(`/admin/materials/`, { method: "POST", body: payload });
      }
      notify("Mato saqlandi", "success");
      onSaved();
      onClose();
    } catch (err) {
      setError((err as ApiError).message || "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <Field label="Nomi">
        <Input
          value={form.name}
          onChange={(e) => set("name", e.target.value)}
          placeholder="Masalan: Linen, Velvet, Paxta..."
        />
      </Field>

      <Field label="Tavsif" hint="Ixtiyoriy — mahsulot detalida ko'rsatiladi">
        <Textarea
          rows={2}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder="Mato haqida qisqa ma'lumot..."
        />
      </Field>

      <Field label="Tartib">
        <Input
          type="number"
          value={form.sort_order}
          onChange={(e) => set("sort_order", e.target.value)}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm text-navy-700">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          className="size-4 accent-gold"
        />
        Faol
      </label>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="gold" loading={saving}>
          Saqlash
        </Button>
      </div>
    </form>
  );
}
