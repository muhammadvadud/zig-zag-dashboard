"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AdminBadge } from "@/lib/types";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

type FormState = {
  name_uz: string;
  name_ru: string;
  color: string;
  sort_order: string;
  is_active: boolean;
};

// Tez tanlash uchun tayyor ranglar palitrasi.
const PRESETS = ["#c9a769", "#16a34a", "#dc2626", "#2563eb", "#d97706", "#1a2a4a", "#7c3aed", "#0891b2"];

function normalizeHex(hex?: string): string {
  if (!hex) return "#c9a769";
  return hex.startsWith("#") ? hex : `#${hex}`;
}

function initial(badge?: AdminBadge | null): FormState {
  return {
    name_uz: badge?.name_uz ?? "",
    name_ru: badge?.name_ru ?? "",
    color: normalizeHex(badge?.color),
    sort_order: badge ? String(badge.sort_order ?? 0) : "0",
    is_active: badge?.is_active ?? true,
  };
}

export function BadgeForm({
  badge,
  onClose,
  onSaved,
}: {
  badge?: AdminBadge | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!badge;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(badge));
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

    const payload = {
      name_uz: form.name_uz.trim(),
      name_ru: form.name_ru.trim(),
      color: form.color.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/badges/${badge!.id}/`, { method: "PATCH", body: payload });
      } else {
        await api(`/admin/badges/`, { method: "POST", body: payload });
      }
      notify("Nishon saqlandi", "success");
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

      {/* live preview */}
      <div className="flex items-center gap-2 rounded-xl bg-navy-50 px-4 py-3">
        <span className="text-sm text-navy-500">Ko&apos;rinishi:</span>
        <span
          className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
          style={{ backgroundColor: normalizeHex(form.color) }}
        >
          {form.name_uz || "Nishon"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nomi (uz)">
          <Input value={form.name_uz} onChange={(e) => set("name_uz", e.target.value)} placeholder="Yangi" />
        </Field>
        <Field label="Nomi (ru)">
          <Input value={form.name_ru} onChange={(e) => set("name_ru", e.target.value)} placeholder="Новинка" />
        </Field>
      </div>

      <Field label="Rang">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={normalizeHex(form.color)}
            onChange={(e) => set("color", e.target.value)}
            className="size-10 shrink-0 cursor-pointer rounded-lg border border-navy-200 bg-white p-0.5"
          />
          <Input
            value={form.color}
            onChange={(e) => set("color", e.target.value)}
            placeholder="#c9a769"
            className="flex-1 font-mono"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("color", c)}
              title={c}
              className="size-6 rounded-full border border-navy-200 transition-transform hover:scale-110"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tartib">
          <Input
            type="number"
            min="0"
            value={form.sort_order}
            onChange={(e) => set("sort_order", e.target.value)}
          />
        </Field>
        <Field label="Holat">
          <label className="flex h-[42px] items-center gap-2 text-sm text-navy-700">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => set("is_active", e.target.checked)}
              className="size-4 accent-gold"
            />
            Faol
          </label>
        </Field>
      </div>

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
