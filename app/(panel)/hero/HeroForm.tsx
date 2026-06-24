"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface AdminHero {
  id: number;
  eyebrow: string;
  title: string;
  title_italic: string;
  description: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  sort_order: number;
  is_active: boolean;
}

type FormState = {
  eyebrow: string;
  title: string;
  title_italic: string;
  description: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  sort_order: string;
  is_active: boolean;
};

function initial(h?: AdminHero | null): FormState {
  return {
    eyebrow: h?.eyebrow ?? "",
    title: h?.title ?? "",
    title_italic: h?.title_italic ?? "",
    description: h?.description ?? "",
    stat1_value: h?.stat1_value ?? "",
    stat1_label: h?.stat1_label ?? "",
    stat2_value: h?.stat2_value ?? "",
    stat2_label: h?.stat2_label ?? "",
    stat3_value: h?.stat3_value ?? "",
    stat3_label: h?.stat3_label ?? "",
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

    if (!form.title.trim()) {
      setError("Sarlavha majburiy");
      return;
    }

    const payload = {
      eyebrow: form.eyebrow,
      title: form.title.trim(),
      title_italic: form.title_italic,
      description: form.description,
      stat1_value: form.stat1_value,
      stat1_label: form.stat1_label,
      stat2_value: form.stat2_value,
      stat2_label: form.stat2_label,
      stat3_value: form.stat3_value,
      stat3_label: form.stat3_label,
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
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Eyebrow (yuqori matn)">
          <Input value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
        <Field label="Tartib">
          <Input
            type="number"
            min="0"
            value={form.sort_order}
            onChange={(e) => set("sort_order", e.target.value)}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Sarlavha">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Sarlavha (kursiv)">
          <Input value={form.title_italic} onChange={(e) => set("title_italic", e.target.value)} />
        </Field>
      </div>

      <Field label="Tavsif">
        <Textarea
          rows={3}
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Statistika 1 — qiymat">
          <Input value={form.stat1_value} onChange={(e) => set("stat1_value", e.target.value)} />
        </Field>
        <Field label="Statistika 1 — matn">
          <Input value={form.stat1_label} onChange={(e) => set("stat1_label", e.target.value)} />
        </Field>
        <Field label="Statistika 2 — qiymat">
          <Input value={form.stat2_value} onChange={(e) => set("stat2_value", e.target.value)} />
        </Field>
        <Field label="Statistika 2 — matn">
          <Input value={form.stat2_label} onChange={(e) => set("stat2_label", e.target.value)} />
        </Field>
        <Field label="Statistika 3 — qiymat">
          <Input value={form.stat3_value} onChange={(e) => set("stat3_value", e.target.value)} />
        </Field>
        <Field label="Statistika 3 — matn">
          <Input value={form.stat3_label} onChange={(e) => set("stat3_label", e.target.value)} />
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
          Saqlash
        </Button>
      </div>
    </form>
  );
}
