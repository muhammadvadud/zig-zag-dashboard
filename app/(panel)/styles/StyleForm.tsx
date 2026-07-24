"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface Style {
  id: number;
  name_uz: string;
  name_ru: string;
  slug?: string;
  blurb_uz?: string;
  blurb_ru?: string;
  sort_order?: number;
  is_active?: boolean;
  image?: string | null;
}

type FormState = {
  name_uz: string;
  name_ru: string;
  blurb_uz: string;
  blurb_ru: string;
  sort_order: string;
  is_active: boolean;
};

function initial(style?: Style | null): FormState {
  return {
    name_uz: style?.name_uz ?? "",
    name_ru: style?.name_ru ?? "",
    blurb_uz: style?.blurb_uz ?? "",
    blurb_ru: style?.blurb_ru ?? "",
    sort_order: style ? String(style.sort_order ?? 0) : "0",
    is_active: style?.is_active ?? true,
  };
}

export function StyleForm({
  style,
  onClose,
  onSaved,
}: {
  style?: Style | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!style;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(style));
  const [imageFile, setImageFile] = useState<File | null>(null);
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

    setSaving(true);
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("name_uz", form.name_uz.trim());
        fd.append("name_ru", form.name_ru.trim());
        fd.append("blurb_uz", form.blurb_uz);
        fd.append("blurb_ru", form.blurb_ru);
        fd.append("sort_order", String(Number(form.sort_order) || 0));
        fd.append("is_active", String(form.is_active));
        fd.append("image", imageFile);
        if (isEdit) {
          await api(`/admin/styles/${style!.id}/`, { method: "PATCH", formData: fd });
        } else {
          await api(`/admin/styles/`, { method: "POST", formData: fd });
        }
      } else {
        const payload = {
          name_uz: form.name_uz.trim(),
          name_ru: form.name_ru.trim(),
          blurb_uz: form.blurb_uz,
          blurb_ru: form.blurb_ru,
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active,
        };
        if (isEdit) {
          await api(`/admin/styles/${style!.id}/`, { method: "PATCH", body: payload });
        } else {
          await api(`/admin/styles/`, { method: "POST", body: payload });
        }
      }
      notify("Uslub saqlandi", "success");
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
          <Input value={form.name_uz} onChange={(e) => set("name_uz", e.target.value)} />
        </Field>
        <Field label="Nomi (RU)">
          <Input value={form.name_ru} onChange={(e) => set("name_ru", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Tavsif (UZ)">
          <Textarea rows={3} value={form.blurb_uz} onChange={(e) => set("blurb_uz", e.target.value)} />
        </Field>
        <Field label="Tavsif (RU)">
          <Textarea rows={3} value={form.blurb_ru} onChange={(e) => set("blurb_ru", e.target.value)} />
        </Field>
      </div>

      <Field label="Rasm" hint="Ixtiyoriy">
        {isEdit && style?.image && !imageFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={style.image}
            alt=""
            className="mb-2 h-20 rounded-lg border border-navy-100 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-navy-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-sm file:text-navy-700"
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
