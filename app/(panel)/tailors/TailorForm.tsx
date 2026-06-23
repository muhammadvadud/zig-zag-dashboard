"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AdminTailor } from "@/lib/types";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

type FormState = {
  name_uz: string;
  name_ru: string;
  initials: string;
  specialty_uz: string;
  specialty_ru: string;
  rating: string;
  orders_count: string;
  sort_order: string;
  is_active: boolean;
};

function initial(tailor?: AdminTailor | null): FormState {
  return {
    name_uz: tailor?.name_uz ?? "",
    name_ru: tailor?.name_ru ?? "",
    initials: tailor?.initials ?? "",
    specialty_uz: tailor?.specialty_uz ?? "",
    specialty_ru: tailor?.specialty_ru ?? "",
    rating: tailor ? String(parseFloat(String(tailor.rating)) || 0) : "0",
    orders_count: tailor ? String(tailor.orders_count ?? 0) : "0",
    sort_order: tailor ? String(tailor.sort_order ?? 0) : "0",
    is_active: tailor?.is_active ?? true,
  };
}

export function TailorForm({
  tailor,
  onClose,
  onSaved,
}: {
  tailor?: AdminTailor | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!tailor;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(tailor));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name_uz.trim() || !form.name_ru.trim()) {
      setError("Nomi (uz/ru) majburiy");
      return;
    }
    if (!form.initials.trim()) {
      setError("Initsiallar majburiy");
      return;
    }

    const payload = {
      name_uz: form.name_uz.trim(),
      name_ru: form.name_ru.trim(),
      initials: form.initials.trim(),
      specialty_uz: form.specialty_uz,
      specialty_ru: form.specialty_ru,
      rating: String(parseFloat(form.rating) || 0),
      orders_count: Number(form.orders_count) || 0,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/tailors/${tailor!.id}/`, { method: "PATCH", body: payload });
        notify("Chevar yangilandi", "success");
      } else {
        await api(`/admin/tailors/`, { method: "POST", body: payload });
        notify("Chevar qo'shildi", "success");
      }
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
        <Field label="Nomi (uz)">
          <Input value={form.name_uz} onChange={(e) => set("name_uz", e.target.value)} />
        </Field>
        <Field label="Nomi (ru)">
          <Input value={form.name_ru} onChange={(e) => set("name_ru", e.target.value)} />
        </Field>
      </div>

      <Field label="Initsiallar" hint="Masalan: DY">
        <Input
          value={form.initials}
          onChange={(e) => set("initials", e.target.value)}
          maxLength={4}
          placeholder="DY"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Mutaxassislik (uz)">
          <Input
            value={form.specialty_uz}
            onChange={(e) => set("specialty_uz", e.target.value)}
          />
        </Field>
        <Field label="Mutaxassislik (ru)">
          <Input
            value={form.specialty_ru}
            onChange={(e) => set("specialty_ru", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Reyting">
          <Input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={form.rating}
            onChange={(e) => set("rating", e.target.value)}
          />
        </Field>
        <Field label="Buyurtmalar">
          <Input
            type="number"
            min="0"
            value={form.orders_count}
            onChange={(e) => set("orders_count", e.target.value)}
          />
        </Field>
        <Field label="Tartib">
          <Input
            type="number"
            value={form.sort_order}
            onChange={(e) => set("sort_order", e.target.value)}
          />
        </Field>
      </div>

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
          {isEdit ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </form>
  );
}
