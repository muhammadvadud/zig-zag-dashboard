"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { AdminProduct, Category, AdminTailor } from "@/lib/types";
import { Button, Field, Input, Textarea, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

type FormState = {
  category: string;
  tailor: string;
  slug: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  material: string;
  base_price: string;
  price_per_m2: string;
  discount_percent: string;
  stock: string;
  is_new: boolean;
  is_active: boolean;
};

function initial(product?: AdminProduct | null): FormState {
  return {
    category: product?.category != null ? String(product.category) : "",
    tailor: product?.tailor != null ? String(product.tailor) : "",
    slug: product?.slug ?? "",
    name_uz: product?.name_uz ?? "",
    name_ru: product?.name_ru ?? "",
    description_uz: product?.description_uz ?? "",
    description_ru: product?.description_ru ?? "",
    material: product?.material ?? "",
    base_price: product ? String(parseFloat(product.base_price) || 0) : "",
    price_per_m2: product ? String(parseFloat(product.price_per_m2) || 0) : "",
    discount_percent: product ? String(product.discount_percent ?? 0) : "0",
    stock: product ? String(product.stock ?? 0) : "0",
    is_new: product?.is_new ?? false,
    is_active: product?.is_active ?? true,
  };
}

export function ProductForm({
  product,
  categories,
  tailors,
  onClose,
  onSaved,
}: {
  product?: AdminProduct | null;
  categories: Category[];
  tailors: AdminTailor[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!product;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.category) {
      setError("Kategoriyani tanlang");
      return;
    }
    if (!isEdit && !form.slug.trim()) {
      setError("Slug majburiy");
      return;
    }
    if (!form.name_uz.trim() || !form.name_ru.trim()) {
      setError("Nomi (uz/ru) majburiy");
      return;
    }

    const payload = {
      category: Number(form.category),
      tailor: form.tailor ? Number(form.tailor) : null,
      slug: form.slug.trim(),
      name_uz: form.name_uz.trim(),
      name_ru: form.name_ru.trim(),
      description_uz: form.description_uz,
      description_ru: form.description_ru,
      material: form.material,
      base_price: String(parseFloat(form.base_price) || 0),
      price_per_m2: String(parseFloat(form.price_per_m2) || 0),
      discount_percent: Number(form.discount_percent) || 0,
      stock: Number(form.stock) || 0,
      is_new: form.is_new,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/products/${product!.slug}/`, { method: "PATCH", body: payload });
        notify("Mahsulot yangilandi", "success");
      } else {
        await api(`/admin/products/`, { method: "POST", body: payload });
        notify("Mahsulot qo'shildi", "success");
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
        <Field label="Kategoriya">
          <Select
            className="w-full"
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
          >
            <option value="">— Tanlang —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Chevar">
          <Select
            className="w-full"
            value={form.tailor}
            onChange={(e) => set("tailor", e.target.value)}
          >
            <option value="">—</option>
            {tailors.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name_uz}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Slug" hint={isEdit ? "Slug tahrirlab bo'lmaydi" : "Masalan: oq-parda"}>
        <Input
          value={form.slug}
          onChange={(e) => set("slug", e.target.value)}
          readOnly={isEdit}
          className={isEdit ? "bg-navy-50 text-navy-400" : ""}
          placeholder="oq-parda"
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nomi (uz)">
          <Input value={form.name_uz} onChange={(e) => set("name_uz", e.target.value)} />
        </Field>
        <Field label="Nomi (ru)">
          <Input value={form.name_ru} onChange={(e) => set("name_ru", e.target.value)} />
        </Field>
      </div>

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

      <Field label="Material">
        <Input value={form.material} onChange={(e) => set("material", e.target.value)} />
      </Field>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Asosiy narx">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.base_price}
            onChange={(e) => set("base_price", e.target.value)}
          />
        </Field>
        <Field label="Narx/m²">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.price_per_m2}
            onChange={(e) => set("price_per_m2", e.target.value)}
          />
        </Field>
        <Field label="Chegirma %">
          <Input
            type="number"
            min="0"
            max="100"
            value={form.discount_percent}
            onChange={(e) => set("discount_percent", e.target.value)}
          />
        </Field>
        <Field label="Stok">
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
          />
        </Field>
      </div>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={form.is_new}
            onChange={(e) => set("is_new", e.target.checked)}
            className="size-4 accent-gold"
          />
          Yangi
        </label>
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => set("is_active", e.target.checked)}
            className="size-4 accent-gold"
          />
          Faol
        </label>
      </div>

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
