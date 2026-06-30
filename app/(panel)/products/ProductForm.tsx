"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  AlignLeft,
  Wallet,
  Settings2,
  Tag,
  Tags,
  Scissors,
  Check,
} from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type { AdminProduct, AdminBadge, Category, AdminTailor, Paginated } from "@/lib/types";
import { Button, Field, Input, Textarea, Select, Card } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import { asList } from "../_shared/list";

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
  is_active: boolean;
  badges: number[];
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
    is_active: product?.is_active ?? true,
    badges: product?.badges ?? [],
  };
}

/* ---- modern section wrapper ---- */
function Section({
  icon,
  title,
  desc,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  desc?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="p-5 sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/12 text-gold-dark ring-1 ring-gold/15">
          {icon}
        </span>
        <div>
          <h3 className="font-semibold leading-tight tracking-tight text-navy-800">{title}</h3>
          {desc && <p className="mt-0.5 text-sm text-navy-400">{desc}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

/* ---- modern toggle switch ---- */
function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 text-left transition-colors hover:border-gold/40"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy-800">{label}</span>
        {desc && <span className="block text-xs text-navy-400">{desc}</span>}
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-gold" : "bg-navy-200"
        )}
      >
        <span
          className={cn(
            "absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform",
            checked && "translate-x-5"
          )}
        />
      </span>
    </button>
  );
}

export function ProductForm({ product }: { product?: AdminProduct | null }) {
  const router = useRouter();
  const notify = useToast();
  const isEdit = !!product;

  // Admin categories endpoint returns numeric `id` (the public one only has slug),
  // which we need as the product's category primary key.
  const { data: catData } = useApi<Category[] | Paginated<Category>>("/admin/categories/");
  const { data: tailorData } = useApi<Paginated<AdminTailor>>("/admin/tailors/?page=1");
  const { data: badgeData } = useApi<unknown>("/admin/badges/");
  const categories: Category[] = Array.isArray(catData) ? catData : catData?.results ?? [];
  const tailors: AdminTailor[] = tailorData?.results ?? [];
  const badges: AdminBadge[] = asList<AdminBadge>(badgeData);

  function toggleBadge(id: number) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(id)
        ? f.badges.filter((b) => b !== id)
        : [...f.badges, id],
    }));
  }

  const [form, setForm] = useState<FormState>(() => initial(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // live final-price preview after discount
  const finalPrice = useMemo(() => {
    const base = parseFloat(form.base_price) || 0;
    const disc = Number(form.discount_percent) || 0;
    return Math.max(0, base - (base * disc) / 100);
  }, [form.base_price, form.discount_percent]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.category) return setError("Kategoriyani tanlang");
    if (!isEdit && !form.slug.trim()) return setError("Slug majburiy");
    if (!form.name_uz.trim() || !form.name_ru.trim())
      return setError("Nomi (uz/ru) majburiy");

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
      is_active: form.is_active,
      badges: form.badges,
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
      router.push("/products");
    } catch (err) {
      setError((err as ApiError).message || "Saqlashda xatolik");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---- main column ---- */}
        <div className="space-y-6 lg:col-span-2">
          <Section
            icon={<Package className="size-5" />}
            title="Asosiy ma'lumot"
            desc="Mahsulot nomi va tasnifi"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nomi (uz)">
                  <Input
                    value={form.name_uz}
                    onChange={(e) => set("name_uz", e.target.value)}
                    placeholder="Oq parda"
                  />
                </Field>
                <Field label="Nomi (ru)">
                  <Input
                    value={form.name_ru}
                    onChange={(e) => set("name_ru", e.target.value)}
                    placeholder="Белая штора"
                  />
                </Field>
              </div>

              <Field
                label="Slug"
                hint={isEdit ? "Slug tahrirlab bo'lmaydi" : "URL uchun: masalan oq-parda"}
              >
                <Input
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  readOnly={isEdit}
                  className={isEdit ? "bg-navy-50 text-navy-400" : ""}
                  placeholder="oq-parda"
                />
              </Field>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kategoriya">
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
                    <Select
                      className="w-full pl-9"
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
                  </div>
                </Field>
                <Field label="Chevar">
                  <div className="relative">
                    <Scissors className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
                    <Select
                      className="w-full pl-9"
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
                  </div>
                </Field>
              </div>
            </div>
          </Section>

          <Section
            icon={<AlignLeft className="size-5" />}
            title="Tavsif"
            desc="Mahsulot haqida batafsil"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tavsif (uz)">
                  <Textarea
                    rows={4}
                    value={form.description_uz}
                    onChange={(e) => set("description_uz", e.target.value)}
                    placeholder="Mahsulot tavsifi..."
                  />
                </Field>
                <Field label="Tavsif (ru)">
                  <Textarea
                    rows={4}
                    value={form.description_ru}
                    onChange={(e) => set("description_ru", e.target.value)}
                    placeholder="Описание товара..."
                  />
                </Field>
              </div>
              <Field label="Material">
                <Input
                  value={form.material}
                  onChange={(e) => set("material", e.target.value)}
                  placeholder="Masalan: paxta, baxmal..."
                />
              </Field>
            </div>
          </Section>
        </div>

        {/* ---- sidebar column ---- */}
        <div className="space-y-6">
          <Section
            icon={<Wallet className="size-5" />}
            title="Narx va ombor"
            desc="Narxlash va qoldiq"
          >
            <div className="space-y-4">
              <Field label="Asosiy narx (so'm)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.base_price}
                  onChange={(e) => set("base_price", e.target.value)}
                  placeholder="0"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Narx / m²">
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
              </div>
              <Field label="Stok (dona)">
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </Field>

              {/* final price preview */}
              <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
                <span className="text-sm text-navy-500">Yakuniy narx</span>
                <span className="text-base font-bold tabular-nums text-navy-900">
                  {money(finalPrice)}
                </span>
              </div>
            </div>
          </Section>

          <Section
            icon={<Tags className="size-5" />}
            title="Nishonlar"
            desc="Bir nechta nishon tanlash mumkin"
          >
            {badges.length === 0 ? (
              <p className="text-sm text-navy-400">
                Hali nishon yo&apos;q.{" "}
                <Link href="/badges" className="font-medium text-gold-dark hover:underline">
                  Nishon qo&apos;shish
                </Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => {
                  const active = form.badges.includes(b.id);
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => toggleBadge(b.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        active
                          ? "border-transparent text-white shadow-sm"
                          : "border-navy-200 bg-white text-navy-600 hover:border-navy-300"
                      )}
                      style={active ? { backgroundColor: b.color } : undefined}
                    >
                      {active ? (
                        <Check className="size-3.5" />
                      ) : (
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: b.color }}
                        />
                      )}
                      {b.name_uz}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          <Section
            icon={<Settings2 className="size-5" />}
            title="Holat"
            desc="Ko'rinish sozlamalari"
          >
            <Toggle
              checked={form.is_active}
              onChange={(v) => set("is_active", v)}
              label="Faol"
              desc="Saytda ko'rinadi"
            />
          </Section>
        </div>
      </div>

      {/* ---- action bar ---- */}
      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-3 border-t border-navy-100 bg-cream/85 px-4 py-3 backdrop-blur-md lg:-mx-6 lg:px-6">
        <Button type="button" variant="outline" onClick={() => router.push("/products")}>
          Bekor qilish
        </Button>
        <Button type="submit" variant="gold" loading={saving} className="px-6">
          {isEdit ? "Saqlash" : "Mahsulotni qo'shish"}
        </Button>
      </div>
    </form>
  );
}
