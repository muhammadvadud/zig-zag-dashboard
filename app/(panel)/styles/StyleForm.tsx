"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { Thumb } from "@/components/ui/thumb";
import { useToast } from "@/components/ui/toast";

export interface Style {
  id: number;
  name: string;
  slug?: string;
  blurb?: string;
  sort_order?: number;
  is_active?: boolean;
  image?: string | null;
}

type FormState = {
  name: string;
  slug: string;
  blurb: string;
  sort_order: string;
  is_active: boolean;
};

function initial(style?: Style | null): FormState {
  return {
    name: style?.name ?? "",
    slug: style?.slug ?? "",
    blurb: style?.blurb ?? "",
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

    if (!form.name.trim()) {
      setError("Nomi majburiy");
      return;
    }

    setSaving(true);
    try {
      if (imageFile) {
        const fd = new FormData();
        fd.append("name", form.name.trim());
        fd.append("slug", form.slug.trim());
        fd.append("blurb", form.blurb);
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
          name: form.name.trim(),
          slug: form.slug.trim(),
          blurb: form.blurb,
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

      <Field label="Nomi">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>

      <Field label="Slug" hint="Bo'sh qoldirsangiz avtomatik yaratiladi">
        <Input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="masalan: klassik"
        />
      </Field>

      <Field label="Tavsif">
        <Textarea rows={3} value={form.blurb} onChange={(e) => set("blurb", e.target.value)} />
      </Field>

      <Field label="Rasm" hint="Ixtiyoriy">
        {isEdit && style?.image && !imageFile && (
          <Thumb
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
