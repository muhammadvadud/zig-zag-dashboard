"use client";

import { useMemo, useState, useRef } from "react";
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
  Plus,
  Trash2,
  Layers,
  ListChecks,
  Paintbrush,
  X,
  ImagePlus,
} from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type {
  AdminProduct,
  AdminBadge,
  Category,
  AdminTailor,
  Paginated,
  ProductVariant,
  ProductAttribute,
  ProductType,
} from "@/lib/types";
import { Button, Field, Input, Textarea, Select, Card } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import { asList } from "../_shared/list";
import type { Color } from "../colors/ColorForm";

/* ---- slug generator ---- */
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

/* ---- API error parser ---- */
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

/* ---- form state ---- */
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
  product_type: ProductType;
  attributes: ProductAttribute[];
};

/* local variant (before saving) */
interface LocalVariant {
  _id: string; // temp local id
  serverId?: number;
  colorId: string;
  stock: string;
  existingImages: { id: number; image: string }[];
  newImageFiles: File[];
  removed: boolean;
}

function initialVariant(): LocalVariant {
  return {
    _id: Math.random().toString(36).slice(2),
    colorId: "",
    stock: "0",
    existingImages: [],
    newImageFiles: [],
    removed: false,
  };
}

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
    product_type: product?.product_type ?? "variant",
    attributes: product?.attributes ?? [],
  };
}

/* ---- section wrapper ---- */
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

/* ---- toggle switch ---- */
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

/* ---- product type radio ---- */
const PRODUCT_TYPES: { value: ProductType; label: string; desc: string }[] = [
  { value: "variant", label: "Faqat variantlar", desc: "Ranglar va belgilangan o'lchamlar" },
  { value: "custom", label: "O'lchov bo'yicha", desc: "Mijoz eni va bo'yini o'zi kiritadi" },
  { value: "both", label: "Ikkalasi", desc: "Ham variantlar, ham erkin o'lchov" },
];

/* ---- image preview for a local variant ---- */
function VariantImageRow({
  files,
  existingImages,
  onAddFiles,
  onRemoveExisting,
  onRemoveNew,
}: {
  files: File[];
  existingImages: { id: number; image: string }[];
  onAddFiles: (f: File[]) => void;
  onRemoveExisting: (id: number) => void;
  onRemoveNew: (idx: number) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {existingImages.map((img) => (
          <div key={img.id} className="relative size-16 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.image}
              alt=""
              className="size-full rounded-lg border border-navy-100 object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveExisting(img.id)}
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ))}
        {files.map((f, i) => (
          <div key={i} className="relative size-16 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={URL.createObjectURL(f)}
              alt=""
              className="size-full rounded-lg border border-navy-100 object-cover"
            />
            <button
              type="button"
              onClick={() => onRemoveNew(i)}
              className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"
            >
              <X className="size-2.5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex size-16 shrink-0 items-center justify-center rounded-lg border-2 border-dashed border-navy-200 text-navy-300 hover:border-gold/50 hover:text-gold-dark"
        >
          <ImagePlus className="size-5" />
        </button>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const arr = Array.from(e.target.files ?? []);
          if (arr.length) onAddFiles(arr);
          e.target.value = "";
        }}
      />
    </div>
  );
}

/* ============================================================
   Main ProductForm
   ============================================================ */
export function ProductForm({ product }: { product?: AdminProduct | null }) {
  const router = useRouter();
  const notify = useToast();
  const isEdit = !!product;

  /* --- data fetches --- */
  const { data: catData } = useApi<Category[] | Paginated<Category>>("/admin/categories/");
  const { data: tailorData } = useApi<Paginated<AdminTailor>>("/admin/tailors/?page=1");
  const { data: badgeData } = useApi<unknown>("/admin/badges/");
  const { data: colorData } = useApi<unknown>("/admin/colors/");
  const categories: Category[] = Array.isArray(catData) ? catData : catData?.results ?? [];
  const tailors: AdminTailor[] = tailorData?.results ?? [];
  const badges: AdminBadge[] = asList<AdminBadge>(badgeData);
  const colors: Color[] = asList<Color>(colorData);

  /* --- existing server variants (edit mode) --- */
  const { data: serverVariantsRaw, mutate: mutateVariants } = useApi<ProductVariant[] | Paginated<ProductVariant>>(
    isEdit ? `/admin/products/${product!.slug}/variants/` : null
  );
  const serverVariants: ProductVariant[] = asList<ProductVariant>(serverVariantsRaw);

  /* --- form state --- */
  const [form, setForm] = useState<FormState>(() => initial(product));
  const [slugEdited, setSlugEdited] = useState(isEdit && !!product?.slug);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* --- local variants (for new product, pre-save staging) --- */
  const [localVariants, setLocalVariants] = useState<LocalVariant[]>([]);

  /* --- attribute template drawer --- */
  const DEFAULT_ATTR_KEYS = [
    "Kenglik (sm)", "Balandlik (sm)", "Material", "Gramaj", "O'ram uzunligi",
    "Tozalash usuli", "Ishlab chiqaruvchi", "Kafolat",
  ];

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleNameUz(value: string) {
    setForm((f) => ({
      ...f,
      name_uz: value,
      slug: !isEdit && !slugEdited ? slugify(value) : f.slug,
    }));
  }

  function toggleBadge(id: number) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(id) ? f.badges.filter((b) => b !== id) : [...f.badges, id],
    }));
  }

  /* --- attributes helpers --- */
  function addAttr(key = "", value = "") {
    setForm((f) => ({ ...f, attributes: [...f.attributes, { key, value }] }));
  }
  function removeAttr(i: number) {
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, j) => j !== i) }));
  }
  function setAttr(i: number, field: "key" | "value", val: string) {
    setForm((f) => {
      const attrs = [...f.attributes];
      attrs[i] = { ...attrs[i], [field]: val };
      return { ...f, attributes: attrs };
    });
  }

  /* --- local variant helpers --- */
  function addLocalVariant() {
    setLocalVariants((v) => [...v, initialVariant()]);
  }
  function updateLocalVariant(id: string, patch: Partial<LocalVariant>) {
    setLocalVariants((v) => v.map((lv) => (lv._id === id ? { ...lv, ...patch } : lv)));
  }
  function removeLocalVariant(id: string) {
    setLocalVariants((v) => v.filter((lv) => lv._id !== id));
  }

  /* --- server variant delete --- */
  async function deleteServerVariant(variantId: number) {
    try {
      await api(`/admin/products/${product!.slug}/variants/${variantId}/`, { method: "DELETE" });
      notify("Variant o'chirildi", "success");
      mutateVariants();
    } catch (err) {
      notify(parseApiErrors(err), "error");
    }
  }

  /* --- delete a server variant image --- */
  async function deleteServerVariantImage(variantId: number, imageId: number) {
    try {
      await api(`/admin/products/${product!.slug}/variants/${variantId}/images/${imageId}/`, {
        method: "DELETE",
      });
      mutateVariants();
    } catch (err) {
      notify(parseApiErrors(err), "error");
    }
  }

  /* --- save variants after product exists --- */
  async function saveVariants(slug: string, variants: LocalVariant[]) {
    for (const lv of variants) {
      if (!lv.colorId) continue;
      let variantId = lv.serverId;
      if (!variantId) {
        try {
          const created = await api<{ id: number }>(`/admin/products/${slug}/variants/`, {
            method: "POST",
            body: { color: Number(lv.colorId), stock: Number(lv.stock) || 0 },
          });
          variantId = created.id;
        } catch {
          continue;
        }
      }
      for (const file of lv.newImageFiles) {
        const fd = new FormData();
        fd.append("image", file);
        try {
          await api(`/admin/products/${slug}/variants/${variantId}/images/`, {
            method: "POST",
            formData: fd,
          });
        } catch {
          /* silent — image upload is best-effort */
        }
      }
    }
  }

  // live final-price preview
  const finalPrice = useMemo(() => {
    const base = parseFloat(form.base_price) || 0;
    const disc = Number(form.discount_percent) || 0;
    return Math.max(0, base - (base * disc) / 100);
  }, [form.base_price, form.discount_percent]);

  const showVariants = form.product_type === "variant" || form.product_type === "both";

  /* ---- submit ---- */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.category) return setError("Kategoriyani tanlang");
    if (!isEdit && !form.slug.trim()) return setError("Slug majburiy");
    if (!form.name_uz.trim() || !form.name_ru.trim()) return setError("Nomi (uz/ru) majburiy");

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
      product_type: form.product_type,
      attributes: form.attributes.filter((a) => a.key.trim()),
    };

    setSaving(true);
    try {
      let savedSlug = form.slug.trim();
      if (isEdit) {
        await api(`/admin/products/${product!.slug}/`, { method: "PATCH", body: payload });
        notify("Mahsulot yangilandi", "success");
      } else {
        const created = await api<{ slug: string }>(`/admin/products/`, {
          method: "POST",
          body: payload,
        });
        savedSlug = created.slug ?? savedSlug;
        notify("Mahsulot qo'shildi", "success");
      }

      /* save staged local variants */
      const activeLocal = localVariants.filter((lv) => lv.colorId);
      if (activeLocal.length) await saveVariants(savedSlug, activeLocal);

      router.push("/products");
    } catch (err) {
      setError(parseApiErrors(err));
      setSaving(false);
    }
  }

  /* ============================================================ */
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 whitespace-pre-line">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---- main column ---- */}
        <div className="space-y-6 lg:col-span-2">

          {/* === Asosiy ma'lumot === */}
          <Section icon={<Package className="size-5" />} title="Asosiy ma'lumot" desc="Mahsulot nomi va tasnifi">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nomi (uz)">
                  <Input
                    value={form.name_uz}
                    onChange={(e) => handleNameUz(e.target.value)}
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
                hint={isEdit ? "Slug tahrirlab bo'lmaydi" : "Nom (uz) yozilganda avtomatik to'ldiriladi"}
              >
                <Input
                  value={form.slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    set("slug", e.target.value);
                  }}
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
                        <option key={c.id} value={c.id}>{c.name}</option>
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
                        <option key={t.id} value={t.id}>{t.name_uz}</option>
                      ))}
                    </Select>
                  </div>
                </Field>
              </div>
            </div>
          </Section>

          {/* === Mahsulot turi === */}
          <Section icon={<Layers className="size-5" />} title="Mahsulot turi" desc="Narxlash va buyurtma usulini tanlang">
            <div className="space-y-2">
              {PRODUCT_TYPES.map((pt) => (
                <label
                  key={pt.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                    form.product_type === pt.value
                      ? "border-gold bg-gold/8 ring-1 ring-gold/40"
                      : "border-navy-100 bg-white hover:border-navy-200"
                  )}
                >
                  <input
                    type="radio"
                    name="product_type"
                    value={pt.value}
                    checked={form.product_type === pt.value}
                    onChange={() => set("product_type", pt.value)}
                    className="accent-gold"
                  />
                  <span>
                    <span className="block text-sm font-medium text-navy-800">{pt.label}</span>
                    <span className="text-xs text-navy-400">{pt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* === Variantlar (ranglar) === */}
          {showVariants && (
            <Section
              icon={<Paintbrush className="size-5" />}
              title="Rang variantlari"
              desc="Har bir rang uchun stok va rasmlar"
            >
              <div className="space-y-4">
                {/* Edit mode: server variants */}
                {isEdit && serverVariants.length > 0 && (
                  <div className="space-y-3">
                    {serverVariants.map((sv) => {
                      const col = colors.find((c) => c.id === sv.color);
                      return (
                        <div
                          key={sv.id}
                          className="rounded-xl border border-navy-100 bg-navy-50/30 p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              {sv.color_hex && (
                                <span
                                  className="size-5 rounded-full border border-navy-200"
                                  style={{ backgroundColor: sv.color_hex }}
                                />
                              )}
                              <span className="text-sm font-medium text-navy-800">
                                {sv.color_name ?? col?.name ?? "Rang #" + sv.id}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-navy-400">Stok: {sv.stock}</span>
                              <button
                                type="button"
                                onClick={() => deleteServerVariant(sv.id)}
                                className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                          {sv.images.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {sv.images.map((img) => (
                                <div key={img.id} className="relative size-16">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={img.image}
                                    alt=""
                                    className="size-full rounded-lg border border-navy-100 object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => deleteServerVariantImage(sv.id, img.id)}
                                    className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-red-500 text-white"
                                  >
                                    <X className="size-2.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Local (staged) variants */}
                {localVariants.map((lv) => (
                  <div
                    key={lv._id}
                    className="rounded-xl border border-navy-100 bg-white p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <Field label="Rang">
                          <Select
                            className="w-full"
                            value={lv.colorId}
                            onChange={(e) =>
                              updateLocalVariant(lv._id, { colorId: e.target.value })
                            }
                          >
                            <option value="">— Tanlang —</option>
                            {colors.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} {c.hex ? `(${c.hex})` : ""}
                              </option>
                            ))}
                          </Select>
                          {lv.colorId && (() => {
                            const c = colors.find((x) => x.id === Number(lv.colorId));
                            return c?.hex ? (
                              <span
                                className="mt-1 inline-block size-4 rounded-full border border-navy-200"
                                style={{ backgroundColor: c.hex }}
                              />
                            ) : null;
                          })()}
                        </Field>
                        <Field label="Stok">
                          <Input
                            type="number"
                            min="0"
                            value={lv.stock}
                            onChange={(e) =>
                              updateLocalVariant(lv._id, { stock: e.target.value })
                            }
                          />
                        </Field>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLocalVariant(lv._id)}
                        className="mt-6 rounded-lg p-2 text-red-400 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    <div>
                      <span className="block mb-1.5 text-xs font-medium text-navy-500">
                        Rasmlar
                      </span>
                      <VariantImageRow
                        files={lv.newImageFiles}
                        existingImages={lv.existingImages}
                        onAddFiles={(files) =>
                          updateLocalVariant(lv._id, {
                            newImageFiles: [...lv.newImageFiles, ...files],
                          })
                        }
                        onRemoveExisting={(id) =>
                          updateLocalVariant(lv._id, {
                            existingImages: lv.existingImages.filter((img) => img.id !== id),
                          })
                        }
                        onRemoveNew={(idx) =>
                          updateLocalVariant(lv._id, {
                            newImageFiles: lv.newImageFiles.filter((_, i) => i !== idx),
                          })
                        }
                      />
                    </div>
                  </div>
                ))}

                {colors.length === 0 ? (
                  <p className="text-sm text-navy-400">
                    Hali rang yo&apos;q.{" "}
                    <Link href="/colors" className="font-medium text-gold-dark hover:underline">
                      Rang qo&apos;shish
                    </Link>
                  </p>
                ) : (
                  <Button type="button" variant="outline" onClick={addLocalVariant}>
                    <Plus className="size-4" /> Variant qo&apos;shish
                  </Button>
                )}
              </div>
            </Section>
          )}

          {/* === Tavsif === */}
          <Section icon={<AlignLeft className="size-5" />} title="Tavsif" desc="Mahsulot haqida batafsil">
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

          {/* === Xususiyatlar (Attributes) === */}
          <Section
            icon={<ListChecks className="size-5" />}
            title="Xususiyatlar"
            desc="Mahsulotning texnik xususiyatlari (ixtiyoriy)"
          >
            <div className="space-y-3">
              {form.attributes.map((attr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={attr.key}
                    onChange={(e) => setAttr(i, "key", e.target.value)}
                    placeholder="Xususiyat (masalan: Kenglik)"
                    className="flex-1"
                  />
                  <Input
                    value={attr.value}
                    onChange={(e) => setAttr(i, "value", e.target.value)}
                    placeholder="Qiymat (masalan: 150 sm)"
                    className="flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => removeAttr(i)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => addAttr()}>
                  <Plus className="size-4" /> Xususiyat qo&apos;shish
                </Button>
                {/* Template suggestions */}
                {DEFAULT_ATTR_KEYS.filter(
                  (k) => !form.attributes.some((a) => a.key === k)
                ).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addAttr(k, "")}
                    className="rounded-full border border-navy-200 bg-white px-3 py-1 text-xs text-navy-600 transition-colors hover:border-gold/50 hover:bg-gold/5 hover:text-gold-dark"
                  >
                    + {k}
                  </button>
                ))}
              </div>
            </div>
          </Section>
        </div>

        {/* ---- sidebar column ---- */}
        <div className="space-y-6">
          <Section icon={<Wallet className="size-5" />} title="Narx va ombor" desc="Narxlash va qoldiq">
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
              <Field label="Umumiy stok (dona)">
                <Input
                  type="number"
                  min="0"
                  value={form.stock}
                  onChange={(e) => set("stock", e.target.value)}
                />
              </Field>
              <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
                <span className="text-sm text-navy-500">Yakuniy narx</span>
                <span className="text-base font-bold tabular-nums text-navy-900">
                  {money(finalPrice)}
                </span>
              </div>
            </div>
          </Section>

          <Section icon={<Tags className="size-5" />} title="Nishonlar" desc="Bir nechta nishon tanlash mumkin">
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
                      {active ? <Check className="size-3.5" /> : (
                        <span className="size-2.5 rounded-full" style={{ backgroundColor: b.color }} />
                      )}
                      {b.name_uz}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          <Section icon={<Settings2 className="size-5" />} title="Holat" desc="Ko'rinish sozlamalari">
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
