"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface Category {
  id: number;
  name: string;
  slug?: string;
  sort_order?: number;
  is_active?: boolean;
  image?: string | null;
}

type FormState = {
  name: string;
  slug: string;
  sort_order: string;
  is_active: boolean;
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/['''ʻʼ`]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseApiErrors(err: unknown): string {
  if (!(err instanceof ApiError)) return (err as Error)?.message || "Xatolik";
  const data = err.data as Record<string, string[] | string> | null;
  if (!data || typeof data !== "object") return err.message;
  const msgs: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    const arr = Array.isArray(val) ? val : [val];
    for (const msg of arr) {
      msgs.push(key === "non_field_errors" || key === "detail" ? String(msg) : `${key}: ${msg}`);
    }
  }
  return msgs.length ? msgs.join("\n") : err.message;
}

function initial(category?: Category | null): FormState {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    sort_order: category ? String(category.sort_order ?? 0) : "0",
    is_active: category?.is_active ?? true,
  };
}

export function CategoryForm({
  category,
  onClose,
  onSaved,
}: {
  category?: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!category;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(category));
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [slugEdited, setSlugEdited] = useState(isEdit && !!category?.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleNameChange(value: string) {
    setForm((f) => ({
      ...f,
      name: value,
      slug: slugEdited ? f.slug : slugify(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setForm((f) => ({ ...f, slug: value }));
  }

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
        fd.append("sort_order", String(Number(form.sort_order) || 0));
        fd.append("is_active", String(form.is_active));
        fd.append("image", imageFile);
        if (isEdit) {
          await api(`/admin/categories/${category!.id}/`, { method: "PATCH", formData: fd });
        } else {
          await api(`/admin/categories/`, { method: "POST", formData: fd });
        }
      } else {
        const payload = {
          name: form.name.trim(),
          slug: form.slug.trim(),
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active,
        };
        if (isEdit) {
          await api(`/admin/categories/${category!.id}/`, { method: "PATCH", body: payload });
        } else {
          await api(`/admin/categories/`, { method: "POST", body: payload });
        }
      }
      notify("Kategoriya saqlandi", "success");
      onSaved();
      onClose();
    } catch (err) {
      setError(parseApiErrors(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700 whitespace-pre-line">
          {error}
        </div>
      )}

      <Field label="Nomi">
        <Input value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
      </Field>

      <Field label="Slug" hint="Nom yozilganda avtomatik to'ldiriladi">
        <Input
          value={form.slug}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="masalan: pardalar"
        />
      </Field>

      <Field label="Rasm" hint="Ixtiyoriy">
        {isEdit && category?.image && !imageFile && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt=""
            className="mb-2 size-14 rounded-lg border border-navy-100 object-cover"
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
