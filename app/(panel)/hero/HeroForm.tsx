"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface AdminHero {
  id: number;
  eyebrow_uz: string;
  eyebrow_ru: string;
  title_uz: string;
  title_ru: string;
  title_italic_uz: string;
  title_italic_ru: string;
  description_uz: string;
  description_ru: string;
  stat1_value: string;
  stat1_label_uz: string;
  stat1_label_ru: string;
  stat2_value: string;
  stat2_label_uz: string;
  stat2_label_ru: string;
  stat3_value: string;
  stat3_label_uz: string;
  stat3_label_ru: string;
  sort_order: number;
  is_active: boolean;
}

type FormState = {
  eyebrow_uz: string;
  eyebrow_ru: string;
  title_uz: string;
  title_ru: string;
  title_italic_uz: string;
  title_italic_ru: string;
  description_uz: string;
  description_ru: string;
  stat1_value: string;
  stat1_label_uz: string;
  stat1_label_ru: string;
  stat2_value: string;
  stat2_label_uz: string;
  stat2_label_ru: string;
  stat3_value: string;
  stat3_label_uz: string;
  stat3_label_ru: string;
  sort_order: string;
  is_active: boolean;
};

function initial(h?: AdminHero | null): FormState {
  return {
    eyebrow_uz: h?.eyebrow_uz ?? "",
    eyebrow_ru: h?.eyebrow_ru ?? "",
    title_uz: h?.title_uz ?? "",
    title_ru: h?.title_ru ?? "",
    title_italic_uz: h?.title_italic_uz ?? "",
    title_italic_ru: h?.title_italic_ru ?? "",
    description_uz: h?.description_uz ?? "",
    description_ru: h?.description_ru ?? "",
    stat1_value: h?.stat1_value ?? "",
    stat1_label_uz: h?.stat1_label_uz ?? "",
    stat1_label_ru: h?.stat1_label_ru ?? "",
    stat2_value: h?.stat2_value ?? "",
    stat2_label_uz: h?.stat2_label_uz ?? "",
    stat2_label_ru: h?.stat2_label_ru ?? "",
    stat3_value: h?.stat3_value ?? "",
    stat3_label_uz: h?.stat3_label_uz ?? "",
    stat3_label_ru: h?.stat3_label_ru ?? "",
    sort_order: h ? String(h.sort_order ?? 0) : "0",
    is_active: h?.is_active ?? true,
  };
}

export function HeroForm({
  hero,
  onClose,
  onSaved,
}: {
  hero?: AdminHero | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!hero;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(hero));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title_uz.trim()) {
      setError("Sarlavha (uz) majburiy");
      return;
    }

    const payload = {
      eyebrow_uz: form.eyebrow_uz.trim(),
      eyebrow_ru: form.eyebrow_ru.trim(),
      title_uz: form.title_uz.trim(),
      title_ru: form.title_ru.trim(),
      title_italic_uz: form.title_italic_uz.trim(),
      title_italic_ru: form.title_italic_ru.trim(),
      description_uz: form.description_uz.trim(),
      description_ru: form.description_ru.trim(),
      stat1_value: form.stat1_value.trim(),
      stat1_label_uz: form.stat1_label_uz.trim(),
      stat1_label_ru: form.stat1_label_ru.trim(),
      stat2_value: form.stat2_value.trim(),
      stat2_label_uz: form.stat2_label_uz.trim(),
      stat2_label_ru: form.stat2_label_ru.trim(),
      stat3_value: form.stat3_value.trim(),
      stat3_label_uz: form.stat3_label_uz.trim(),
      stat3_label_ru: form.stat3_label_ru.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/hero/${hero!.id}/`, { method: "PATCH", body: payload });
      } else {
        await api(`/admin/hero/`, { method: "POST", body: payload });
      }
      notify("Hero saqlandi", "success");
      onSaved();
      onClose();
    } catch (err) {
      setError((err as ApiError).message || "Saqlashda xatolik");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Eyebrows */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Eyebrow (uz)">
          <Input value={form.eyebrow_uz} onChange={(e) => set("eyebrow_uz", e.target.value)} />
        </Field>
        <Field label="Eyebrow (ru)">
          <Input value={form.eyebrow_ru} onChange={(e) => set("eyebrow_ru", e.target.value)} />
        </Field>
      </div>

      {/* Titles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sarlavha (uz)">
          <Input value={form.title_uz} onChange={(e) => set("title_uz", e.target.value)} />
        </Field>
        <Field label="Sarlavha (ru)">
          <Input value={form.title_ru} onChange={(e) => set("title_ru", e.target.value)} />
        </Field>
      </div>

      {/* Italic Titles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sarlavha (kursiv, uz)">
          <Input value={form.title_italic_uz} onChange={(e) => set("title_italic_uz", e.target.value)} />
        </Field>
        <Field label="Sarlavha (kursiv, ru)">
          <Input value={form.title_italic_ru} onChange={(e) => set("title_italic_ru", e.target.value)} />
        </Field>
      </div>

      {/* Descriptions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tavsif (uz)">
          <Textarea
            rows={3}
            value={form.description_uz}
            onChange={(e) => set("description_uz", e.target.value)}
          />
        </Field>
        <Field label="Tavsif (ru)">
          <Textarea
            rows={3}
            value={form.description_ru}
            onChange={(e) => set("description_ru", e.target.value)}
          />
        </Field>
      </div>

      {/* Statistics 1 */}
      <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500">Statistika 1</h4>
        <div className="space-y-4">
          <Field label="Qiymat (masalan: +1500)">
            <Input value={form.stat1_value} onChange={(e) => set("stat1_value", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sarlavha (uz)">
              <Input value={form.stat1_label_uz} onChange={(e) => set("stat1_label_uz", e.target.value)} />
            </Field>
            <Field label="Sarlavha (ru)">
              <Input value={form.stat1_label_ru} onChange={(e) => set("stat1_label_ru", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Statistics 2 */}
      <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500">Statistika 2</h4>
        <div className="space-y-4">
          <Field label="Qiymat (masalan: 99%)">
            <Input value={form.stat2_value} onChange={(e) => set("stat2_value", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sarlavha (uz)">
              <Input value={form.stat2_label_uz} onChange={(e) => set("stat2_label_uz", e.target.value)} />
            </Field>
            <Field label="Sarlavha (ru)">
              <Input value={form.stat2_label_ru} onChange={(e) => set("stat2_label_ru", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Statistics 3 */}
      <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-4 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-navy-500">Statistika 3</h4>
        <div className="space-y-4">
          <Field label="Qiymat (masalan: 15 yillik)">
            <Input value={form.stat3_value} onChange={(e) => set("stat3_value", e.target.value)} />
          </Field>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Sarlavha (uz)">
              <Input value={form.stat3_label_uz} onChange={(e) => set("stat3_label_uz", e.target.value)} />
            </Field>
            <Field label="Sarlavha (ru)">
              <Input value={form.stat3_label_ru} onChange={(e) => set("stat3_label_ru", e.target.value)} />
            </Field>
          </div>
        </div>
      </div>

      {/* Active Checkbox */}
      <label className="flex items-center gap-2 text-sm text-navy-700 select-none">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => set("is_active", e.target.checked)}
          className="size-4 accent-gold cursor-pointer"
        />
        Faol
      </label>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t border-navy-100">
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
