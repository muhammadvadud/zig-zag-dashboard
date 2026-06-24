"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";
import { Thumb } from "@/components/ui/thumb";
import { useToast } from "@/components/ui/toast";

export interface AdminCollection {
  id: number;
  title: string;
  slug: string;
  sort_order: number;
  is_active: boolean;
  image: string | null;
}

type FormState = {
  title: string;
  slug: string;
  sort_order: string;
  is_active: boolean;
};

function initial(c?: AdminCollection | null): FormState {
  return {
    title: c?.title ?? "",
    slug: c?.slug ?? "",
    sort_order: c ? String(c.sort_order ?? 0) : "0",
    is_active: c?.is_active ?? true,
  };
}

export function CollectionForm({
  collection,
  onClose,
  onSaved,
}: {
  collection?: AdminCollection | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!collection;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(collection));
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.title.trim()) {
      setError("Nomi majburiy");
      return;
    }

    setSaving(true);
    try {
      if (file) {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        if (form.slug.trim()) fd.append("slug", form.slug.trim());
        fd.append("sort_order", String(Number(form.sort_order) || 0));
        fd.append("is_active", String(form.is_active));
        fd.append("image", file);
        if (isEdit) {
          await api(`/admin/collections/${collection!.id}/`, { method: "PATCH", formData: fd });
        } else {
          await api(`/admin/collections/`, { method: "POST", formData: fd });
        }
      } else {
        const payload: Record<string, unknown> = {
          title: form.title.trim(),
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active,
        };
        if (form.slug.trim()) payload.slug = form.slug.trim();
        if (isEdit) {
          await api(`/admin/collections/${collection!.id}/`, { method: "PATCH", body: payload });
        } else {
          await api(`/admin/collections/`, { method: "POST", body: payload });
        }
      }
      notify("Kolleksiya saqlandi", "success");
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
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
      </Field>

      <Field label="Slug" hint="Bo'sh qoldirilsa avtomatik yaratiladi">
        <Input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          placeholder="oq-kolleksiya"
        />
      </Field>

      <Field label="Tartib">
        <Input
          type="number"
          min="0"
          value={form.sort_order}
          onChange={(e) => set("sort_order", e.target.value)}
        />
      </Field>

      <Field label="Rasm" hint={isEdit ? "Yangi rasm tanlasangiz almashtiriladi" : undefined}>
        {isEdit && collection?.image && !file && (
          <Thumb
            src={collection.image}
            alt={collection.title}
            className="mb-2 h-20 w-32 rounded-md border border-navy-100 object-cover"
          />
        )}
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-navy-600 file:mr-3 file:rounded-lg file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-sm file:text-navy-700 hover:file:bg-navy-100"
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
