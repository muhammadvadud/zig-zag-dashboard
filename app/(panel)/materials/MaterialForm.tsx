"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
export interface AdminMaterial {
  id: number;
  name_uz: string;
  name_ru: string;
  slug?: string;
  description_uz?: string;
  description_ru?: string;
  sort_order?: number;
  is_active?: boolean;
  products_count?: number;
}

type FormState = {
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  sort_order: string;
  is_active: boolean;
};

function initial(material?: AdminMaterial | null): FormState {
  return {
    name_uz: material?.name_uz ?? "",
    name_ru: material?.name_ru ?? "",
    description_uz: material?.description_uz ?? "",
    description_ru: material?.description_ru ?? "",
    sort_order: material ? String(material.sort_order ?? 0) : "0",
    is_active: material?.is_active ?? true,
  };
}

export function MaterialForm({
  material,
  onClose,
  onSaved,
}: {
  material?: AdminMaterial | null;
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

    if (!form.name_uz.trim()) {
      setError("Nomi (UZ) majburiy");
      return;
    }

    const payload = {
      name_uz: form.name_uz.trim(),
      name_ru: form.name_ru.trim(),
      description_uz: form.description_uz.trim(),
      description_ru: form.description_ru.trim(),
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nomi (UZ)">
          <Input
            value={form.name_uz}
            onChange={(e) => set("name_uz", e.target.value)}
            placeholder="Masalan: Linen, Velvet, Paxta..."
          />
        </Field>
        <Field label="Nomi (RU)">
          <Input
            value={form.name_ru}
            onChange={(e) => set("name_ru", e.target.value)}
            placeholder="Например: Лен, Бархат, Хлопок..."
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tavsif (UZ)" hint="Ixtiyoriy — mahsulot detalida ko'rsatiladi">
          <Textarea
            rows={2}
            value={form.description_uz}
            onChange={(e) => set("description_uz", e.target.value)}
            placeholder="Mato haqida qisqa ma'lumot..."
          />
        </Field>
        <Field label="Tavsif (RU)" hint="Ixtiyoriy">
          <Textarea
            rows={2}
            value={form.description_ru}
            onChange={(e) => set("description_ru", e.target.value)}
            placeholder="Краткое описание ткани..."
          />
        </Field>
      </div>

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
