"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface AdminBanner {
  id: number;
  title: string;
  eyebrow: string;
  subtitle: string;
  cta: string;
  link: string;
  sort_order: number;
  is_active: boolean;
  image: string | null;
}

type FormState = {
  title: string;
  eyebrow: string;
  subtitle: string;
  cta: string;
  link: string;
  sort_order: string;
  is_active: boolean;
};

function initial(b?: AdminBanner | null): FormState {
  return {
    title: b?.title ?? "",
    eyebrow: b?.eyebrow ?? "",
    subtitle: b?.subtitle ?? "",
    cta: b?.cta ?? "",
    link: b?.link ?? "",
    sort_order: b ? String(b.sort_order ?? 0) : "0",
    is_active: b?.is_active ?? true,
  };
}

export function BannerForm({
  banner,
  onClose,
  onSaved,
}: {
  banner?: AdminBanner | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!banner;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(banner));
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
      setError("Sarlavha majburiy");
      return;
    }
    if (!isEdit && !file) {
      setError("Rasm majburiy");
      return;
    }

    setSaving(true);
    try {
      if (file) {
        const fd = new FormData();
        fd.append("title", form.title.trim());
        fd.append("eyebrow", form.eyebrow);
        fd.append("subtitle", form.subtitle);
        fd.append("cta", form.cta);
        fd.append("link", form.link);
        fd.append("sort_order", String(Number(form.sort_order) || 0));
        fd.append("is_active", String(form.is_active));
        fd.append("image", file);
        if (isEdit) {
          await api(`/admin/banners/${banner!.id}/`, { method: "PATCH", formData: fd });
        } else {
          await api(`/admin/banners/`, { method: "POST", formData: fd });
        }
      } else {
        const payload = {
          title: form.title.trim(),
          eyebrow: form.eyebrow,
          subtitle: form.subtitle,
          cta: form.cta,
          link: form.link,
          sort_order: Number(form.sort_order) || 0,
          is_active: form.is_active,
        };
        await api(`/admin/banners/${banner!.id}/`, { method: "PATCH", body: payload });
      }
      notify("Banner saqlandi", "success");
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
        <Field label="Sarlavha">
          <Input value={form.title} onChange={(e) => set("title", e.target.value)} />
        </Field>
        <Field label="Eyebrow (yuqori matn)">
          <Input value={form.eyebrow} onChange={(e) => set("eyebrow", e.target.value)} />
        </Field>
      </div>

      <Field label="Subtitle (qo'shimcha matn)">
        <Input value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="CTA (tugma matni)">
          <Input value={form.cta} onChange={(e) => set("cta", e.target.value)} />
        </Field>
        <Field label="Havola">
          <Input
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
            placeholder="/collections/oq"
          />
        </Field>
      </div>

      <Field label="Tartib">
        <Input
          type="number"
          min="0"
          value={form.sort_order}
          onChange={(e) => set("sort_order", e.target.value)}
        />
      </Field>

      <Field
        label="Rasm"
        hint={isEdit ? "Yangi rasm tanlasangiz almashtiriladi" : "Banner uchun rasm majburiy"}
      >
        {isEdit && banner?.image && !file && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={banner.image}
            alt={banner.title}
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
