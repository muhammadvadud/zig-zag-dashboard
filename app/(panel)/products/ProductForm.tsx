"use client";

import { useMemo, useState, useRef, useEffect } from "react";
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
  X,
  ImagePlus,
  Star,
  Ruler,
  Palette,
  Sofa,
  Sparkles,
} from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type {
  AdminProduct,
  AdminBadge,
  Category,
  AdminTailor,
  Paginated,
  ProductVariant,
  ProductImage,
  ProductAttribute,
  ProductType,
  Color,
  Style,
  Room,
  Material,
} from "@/lib/types";
import { Button, Field, Input, Textarea, Select, Card } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { money } from "@/lib/format";
import { cn } from "@/lib/cn";
import { asList } from "../_shared/list";

/* ---- API error parser ---- */
function parseApiErrors(err: unknown): string {
  if (!(err instanceof ApiError)) return (err as Error)?.message || "Xatolik";
  const data = err.data as Record<string, string[] | string> | null;
  if (!data || typeof data !== "object") return (err as ApiError).message;
  const msgs: string[] = [];
  for (const [key, val] of Object.entries(data)) {
    const arr = Array.isArray(val) ? val : [val];
    for (const msg of arr) {
      msgs.push(key === "non_field_errors" || key === "detail" ? String(msg) : `${key}: ${msg}`);
    }
  }
  return msgs.length ? msgs.join("\n") : (err as ApiError).message;
}

/* ---- form state ---- */
type FormState = {
  category: string;
  tailor: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  price_per_m2: string;
  discount_percent: string;
  is_active: boolean;
  badges: number[];
  styles: number[];
  rooms: number[];
  materials: number[];
  colors: number[];
  size_mode: ProductType;
  attributes: ProductAttribute[];
};

/* local (staged) variant before saving */
interface LocalVariant {
  _id: string;
  name: string;
  width_cm: string;
  height_cm: string;
  price: string;
  is_active: boolean;
}

/* local image before saving */
interface LocalImage {
  _id: string;
  file: File;
  is_main: boolean;
  colorId: string; // empty = not linked to a color
}

function mkVariant(): LocalVariant {
  return {
    _id: Math.random().toString(36).slice(2),
    name: "",
    width_cm: "",
    height_cm: "",
    price: "0",
    is_active: true,
  };
}

function initial(product?: AdminProduct | null): FormState {
  return {
    category: product?.category != null ? String(product.category) : "",
    tailor: product?.tailor != null ? String(product.tailor) : "",
    name_uz: product?.name_uz ?? "",
    name_ru: product?.name_ru ?? "",
    description_uz: product?.description_uz ?? "",
    description_ru: product?.description_ru ?? "",
    price_per_m2: product ? String(parseFloat(product.price_per_m2 ?? "0") || 0) : "",
    discount_percent: product ? String(product.discount_percent ?? 0) : "0",
    is_active: product?.is_active ?? true,
    badges: product?.badges ?? [],
    styles: product?.styles ?? [],
    rooms: product?.rooms ?? [],
    materials: product?.materials ?? [],
    colors: product?.colors ?? [],
    size_mode: product?.size_mode ?? "variant",
    attributes: product?.attributes ?? [],
  };
}

/* ---- section wrapper ---- */
function Section({
  icon, title, desc, children,
}: {
  icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode;
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
  checked, onChange, label, desc,
}: { checked: boolean; onChange: (v: boolean) => void; label: string; desc?: string }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-navy-100 bg-white px-4 py-3 text-left transition-colors hover:border-gold/40"
    >
      <span className="min-w-0">
        <span className="block text-sm font-medium text-navy-800">{label}</span>
        {desc && <span className="block text-xs text-navy-400">{desc}</span>}
      </span>
      <span className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", checked ? "bg-gold" : "bg-navy-200")}>
        <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-5")} />
      </span>
    </button>
  );
}

/* ---- product type radios ---- */
const PRODUCT_TYPES: { value: ProductType; label: string; desc: string }[] = [
  { value: "variant", label: "Faqat variantlar", desc: "Tayyor o'lchamlar (eni × bo'yi) bilan" },
  { value: "custom", label: "O'lchov bo'yicha", desc: "Mijoz eni va bo'yini o'zi kiritadi" },
  { value: "both", label: "Ikkalasi", desc: "Ham variantlar, ham erkin o'lchov" },
];

/* ---- image card: photo + inline color link, no separate list below ---- */
function ImageCard({
  src, isMain, onToggleMain, onRemove, colorId, onColorChange, colorOptions,
}: {
  src: string;
  isMain: boolean;
  onToggleMain?: () => void;
  onRemove: () => void;
  colorId: string;
  onColorChange?: (colorId: string) => void;
  colorOptions: Color[];
}) {
  return (
    <div className="w-28 shrink-0 overflow-hidden rounded-xl border border-navy-100 bg-white">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className={cn("aspect-square w-full object-cover", isMain && "ring-2 ring-inset ring-gold")} />
        {isMain && (
          <span className="absolute left-1.5 top-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[9px] font-bold text-navy-900">
            Asosiy
          </span>
        )}
        <div className="absolute right-1.5 top-1.5 flex gap-1">
          {onToggleMain && (
            <button type="button" onClick={onToggleMain}
              className={cn("flex size-5 items-center justify-center rounded-full text-[9px] font-bold shadow",
                isMain ? "bg-gold text-navy-900" : "bg-white/90 border border-navy-200 text-navy-500 hover:bg-gold/10")}
              title="Asosiy rasm"
            >
              <Star className="size-2.5" />
            </button>
          )}
          <button type="button" onClick={onRemove}
            className="flex size-5 items-center justify-center rounded-full bg-red-500 text-white shadow">
            <X className="size-2.5" />
          </button>
        </div>
      </div>
      {colorOptions.length > 0 && (
        <Select
          value={colorId}
          onChange={(e) => onColorChange?.(e.target.value)}
          className="w-full rounded-none border-0 border-t border-navy-100 px-2 py-1.5 text-xs"
        >
          <option value="">— Rangsiz —</option>
          {colorOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </Select>
      )}
    </div>
  );
}

/* ---- modern color picker (swatch trigger + preset palette popover) ---- */
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
  const { data: badgeData } = useApi<unknown>("/admin/badges/", { dedupingInterval: 0, revalidateOnFocus: true });
  const { data: colorData, mutate: mutateColors } = useApi<unknown>("/admin/colors/", { dedupingInterval: 0 });
  const { data: styleData } = useApi<unknown>("/admin/styles/");
  const { data: roomData } = useApi<unknown>("/admin/rooms/");
  const { data: materialData } = useApi<unknown>("/admin/materials/");
  const categories: Category[] = Array.isArray(catData) ? catData : catData?.results ?? [];
  const tailors: AdminTailor[] = tailorData?.results ?? [];
  const badges: AdminBadge[] = asList<AdminBadge>(badgeData);
  const colors: Color[] = asList<Color>(colorData);
  const styles: Style[] = asList<Style>(styleData);
  const rooms: Room[] = asList<Room>(roomData);
  const materials: Material[] = asList<Material>(materialData);

  /* --- edit mode: server variants & images --- */
  const { data: serverVariantsRaw, mutate: mutateVariants } = useApi<ProductVariant[] | Paginated<ProductVariant>>(
    isEdit ? `/admin/products/${product!.slug}/variants/` : null
  );
  const { data: serverImagesRaw, mutate: mutateImages } = useApi<ProductImage[] | Paginated<ProductImage>>(
    isEdit ? `/admin/products/${product!.slug}/images/` : null
  );
  const serverVariants: ProductVariant[] = asList<ProductVariant>(serverVariantsRaw);
  const serverImages: ProductImage[] = asList<ProductImage>(serverImagesRaw);

  /* --- form state --- */
  const [form, setForm] = useState<FormState>(() => initial(product));
  const [saving, setSaving] = useState(false);

  /* --- local (staged) variants & images --- */
  const [localVariants, setLocalVariants] = useState<LocalVariant[]>([]);
  const [localImages, setLocalImages] = useState<LocalImage[]>([]);

  /* --- inline new-color state --- */
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#c9a769");
  const [creatingColor, setCreatingColor] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* --- attribute defaults --- */
  const DEFAULT_ATTR_KEYS = [
    "Kenglik (sm)", "Balandlik (sm)", "Material", "Gramaj",
    "O'ram uzunligi", "Tozalash usuli", "Ishlab chiqaruvchi", "Kafolat",
  ];

  /* --- helpers --- */
  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function toggleBadge(id: number) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(id) ? f.badges.filter((b) => b !== id) : [...f.badges, id],
    }));
  }

  function toggleIn(key: "styles" | "rooms" | "colors" | "materials", id: number) {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(id) ? f[key].filter((x) => x !== id) : [...f[key], id],
    }));
  }

  async function createColor() {
    const name = newColorName.trim();
    if (!name) return;
    setCreatingColor(true);
    try {
      const created = await api<Color>("/admin/colors/", {
        method: "POST",
        body: { name, hex: newColorHex },
      });
      await mutateColors();
      setForm((f) => ({ ...f, colors: [...f.colors, created.id] }));
      setNewColorName("");
      setNewColorHex("#c9a769");
      notify("Rang qo'shildi", "success");
    } catch (err) {
      notify(parseApiErrors(err), "error");
    } finally {
      setCreatingColor(false);
    }
  }

  function addAttr(key = "", val = "") {
    setForm((f) => ({ ...f, attributes: [...f.attributes, { key, value: val }] }));
  }
  function removeAttr(i: number) {
    setForm((f) => ({ ...f, attributes: f.attributes.filter((_, j) => j !== i) }));
  }
  function setAttr(i: number, field: "key" | "value", val: string) {
    setForm((f) => { const a = [...f.attributes]; a[i] = { ...a[i], [field]: val }; return { ...f, attributes: a }; });
  }

  /* variant helpers */
  function addLocalVariant() { setLocalVariants((v) => [...v, mkVariant()]); }
  function updateLV(id: string, p: Partial<LocalVariant>) {
    setLocalVariants((v) => v.map((lv) => (lv._id === id ? { ...lv, ...p } : lv)));
  }
  function removeLV(id: string) { setLocalVariants((v) => v.filter((lv) => lv._id !== id)); }

  async function deleteServerVariant(id: number) {
    try {
      await api(`/admin/products/${product!.slug}/variants/${id}/`, { method: "DELETE" });
      notify("Variant o'chirildi", "success");
      mutateVariants();
    } catch (err) { notify(parseApiErrors(err), "error"); }
  }

  /* image helpers */
  function addLocalImages(files: File[]) {
    const hasMain = localImages.some((i) => i.is_main) || serverImages.some((i) => i.is_main);
    setLocalImages((prev) => [
      ...prev,
      ...files.map((file, idx) => ({
        _id: Math.random().toString(36).slice(2),
        file,
        is_main: !hasMain && idx === 0 && prev.length === 0,
        colorId: "",
      })),
    ]);
  }
  function removeLocalImage(id: string) { setLocalImages((v) => v.filter((i) => i._id !== id)); }
  function toggleLocalMain(id: string) {
    setLocalImages((v) => v.map((i) => ({ ...i, is_main: i._id === id })));
  }
  function toggleServerMain(imgId: number) {
    // unset all local mains
    setLocalImages((v) => v.map((i) => ({ ...i, is_main: false })));
    // PATCH server image
    api(`/admin/products/${product!.slug}/images/${imgId}/`, {
      method: "PATCH", body: { is_main: true },
    }).then(() => mutateImages()).catch(() => {});
  }
  async function deleteServerImage(imgId: number) {
    try {
      await api(`/admin/products/${product!.slug}/images/${imgId}/`, { method: "DELETE" });
      mutateImages();
    } catch (err) { notify(parseApiErrors(err), "error"); }
  }
  function setLocalImageColor(id: string, colorId: string) {
    setLocalImages((v) => v.map((i) => (i._id === id ? { ...i, colorId } : i)));
  }
  async function setServerImageColor(imgId: number, colorId: string) {
    try {
      await api(`/admin/products/${product!.slug}/images/${imgId}/`, {
        method: "PATCH", body: { color: colorId ? Number(colorId) : null },
      });
      mutateImages();
    } catch (err) { notify(parseApiErrors(err), "error"); }
  }

  /* --- save helpers --- */
  async function saveVariants(slug: string) {
    for (const lv of localVariants) {
      if (!lv.width_cm && !lv.height_cm && !lv.name) continue;
      try {
        await api(`/admin/products/${slug}/variants/`, {
          method: "POST",
          body: {
            name: lv.name,
            width_cm: lv.width_cm ? Number(lv.width_cm) : null,
            height_cm: lv.height_cm ? Number(lv.height_cm) : null,
            price: lv.price || "0",
            is_active: lv.is_active,
          },
        });
      } catch { /* silent */ }
    }
  }

  async function saveImages(slug: string) {
    for (const li of localImages) {
      const fd = new FormData();
      fd.append("image", li.file);
      fd.append("is_main", String(li.is_main));
      if (li.colorId) fd.append("color", li.colorId);
      try {
        await api(`/admin/products/${slug}/images/`, { method: "POST", formData: fd });
      } catch { /* silent */ }
    }
  }

  const showVariants = form.size_mode === "variant" || form.size_mode === "both";
  const showPricePerM2 = form.size_mode !== "variant";
  const linkedColors = useMemo(
    () => colors.filter((c) => form.colors.includes(c.id)),
    [colors, form.colors]
  );

  /* ---- live "dan" narx: eng arzon variant narxi (yoki per-m²), chegirma bilan ---- */
  const finalPrice = useMemo(() => {
    const disc = Number(form.discount_percent) || 0;
    const prices = [
      ...serverVariants.map((v) => parseFloat(v.price) || 0),
      ...localVariants.map((v) => parseFloat(v.price) || 0),
    ].filter((x) => x > 0);
    let base = prices.length ? Math.min(...prices) : 0;
    if (!base && showPricePerM2) base = parseFloat(form.price_per_m2) || 0; // per-m² (indikativ)
    return Math.max(0, base - (base * disc) / 100);
  }, [serverVariants, localVariants, form.price_per_m2, form.discount_percent, showPricePerM2]);

  /* ---- submit ---- */
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.category) return notify("Kategoriyani tanlang", "error");
    if (!form.name_uz.trim() || !form.name_ru.trim()) return notify("Nomi (uz/ru) majburiy", "error");

    const payload = {
      category: Number(form.category),
      tailor: form.tailor ? Number(form.tailor) : null,
      name_uz: form.name_uz.trim(),
      name_ru: form.name_ru.trim(),
      description_uz: form.description_uz,
      description_ru: form.description_ru,
      price_per_m2: showPricePerM2 ? String(parseFloat(form.price_per_m2) || 0) : null,
      discount_percent: Number(form.discount_percent) || 0,
      is_active: form.is_active,
      badges: form.badges,
      styles: form.styles,
      rooms: form.rooms,
      materials: form.materials,
      colors: form.colors,
      size_mode: form.size_mode,
      attributes: form.attributes.filter((a) => a.key.trim()),
    };

    setSaving(true);
    try {
      let savedSlug = product?.slug ?? "";
      if (isEdit) {
        await api(`/admin/products/${product!.slug}/`, { method: "PATCH", body: payload });
        notify("Mahsulot yangilandi", "success");
      } else {
        const created = await api<{ slug: string }>(`/admin/products/`, { method: "POST", body: payload });
        savedSlug = created.slug ?? savedSlug;
        notify("Mahsulot qo'shildi", "success");
      }
      await Promise.all([saveVariants(savedSlug), saveImages(savedSlug)]);
      router.push("/products");
    } catch (err) {
      notify(parseApiErrors(err), "error");
      setSaving(false);
    }
  }

  /* ============================================================ */
  return (
    <form onSubmit={onSubmit} className="space-y-6">

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ---- main column ---- */}
        <div className="space-y-6 lg:col-span-2">

          {/* === Asosiy ma'lumot === */}
          <Section icon={<Package className="size-5" />} title="Asosiy ma'lumot" desc="Mahsulot nomi va tasnifi">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Nomi (uz)">
                  <Input value={form.name_uz} onChange={(e) => set("name_uz", e.target.value)} placeholder="Oq parda" />
                </Field>
                <Field label="Nomi (ru)">
                  <Input value={form.name_ru} onChange={(e) => set("name_ru", e.target.value)} placeholder="Белая штора" />
                </Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Kategoriya">
                  <div className="relative">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
                    <Select className="w-full pl-9" value={form.category} onChange={(e) => set("category", e.target.value)}>
                      <option value="">— Tanlang —</option>
                      {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </Select>
                  </div>
                </Field>
                <Field label="Chevar">
                  <div className="relative">
                    <Scissors className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-navy-300" />
                    <Select className="w-full pl-9" value={form.tailor} onChange={(e) => set("tailor", e.target.value)}>
                      <option value="">—</option>
                      {tailors.map((t) => <option key={t.id} value={t.id}>{t.name_uz}</option>)}
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
                <label key={pt.value}
                  className={cn("flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                    form.size_mode === pt.value ? "border-gold bg-gold/8 ring-1 ring-gold/40" : "border-navy-100 bg-white hover:border-navy-200")}
                >
                  <input type="radio" name="size_mode" value={pt.value}
                    checked={form.size_mode === pt.value} onChange={() => set("size_mode", pt.value)}
                    className="accent-gold" />
                  <span>
                    <span className="block text-sm font-medium text-navy-800">{pt.label}</span>
                    <span className="text-xs text-navy-400">{pt.desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </Section>

          {/* === Tayyor o'lcham variantlari === */}
          {showVariants && (
            <Section icon={<Ruler className="size-5" />} title="Tayyor o'lchamlar" desc="Belgilangan eni × bo'yi variantlari">
              <div className="space-y-3">
                {/* Server variants (edit mode) */}
                {serverVariants.map((sv) => (
                  <div key={sv.id} className="flex items-center justify-between gap-3 rounded-xl border border-navy-100 bg-navy-50/30 px-4 py-3">
                    <div>
                      <span className="font-medium text-navy-800">
                        {sv.label || sv.name || (sv.width_cm && sv.height_cm ? `${sv.width_cm}×${sv.height_cm} sm` : `Variant #${sv.id}`)}
                      </span>
                      {Number(sv.price) > 0 && (
                        <span className="ml-2 text-xs text-navy-500">{money(sv.price)}</span>
                      )}
                    </div>
                    <button type="button" onClick={() => deleteServerVariant(sv.id)}
                      className="rounded-lg p-1.5 text-red-400 hover:bg-red-50">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                ))}

                {/* Local staged variants */}
                {localVariants.map((lv) => (
                  <div key={lv._id} className="rounded-xl border border-navy-100 bg-white p-4">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <Field label="Nomi (ixtiyoriy)">
                        <Input value={lv.name} onChange={(e) => updateLV(lv._id, { name: e.target.value })}
                          placeholder="150×250 sm" />
                      </Field>
                      <Field label="Eni (sm)">
                        <Input type="number" min="0" step="0.1" value={lv.width_cm}
                          onChange={(e) => updateLV(lv._id, { width_cm: e.target.value })} placeholder="150" />
                      </Field>
                      <Field label="Bo'yi (sm)">
                        <Input type="number" min="0" step="0.1" value={lv.height_cm}
                          onChange={(e) => updateLV(lv._id, { height_cm: e.target.value })} placeholder="250" />
                      </Field>
                      <Field label="Narx (so'm)">
                        <Input type="number" min="0" step="0.01" value={lv.price}
                          onChange={(e) => updateLV(lv._id, { price: e.target.value })} placeholder="0" />
                      </Field>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm text-navy-600">
                        <input type="checkbox" checked={lv.is_active}
                          onChange={(e) => updateLV(lv._id, { is_active: e.target.checked })}
                          className="size-4 accent-gold" />
                        Faol
                      </label>
                      <button type="button" onClick={() => removeLV(lv._id)}
                        className="rounded-lg p-1.5 text-red-400 hover:bg-red-50">
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button type="button" variant="outline" onClick={addLocalVariant}>
                  <Plus className="size-4" /> O&apos;lcham qo&apos;shish
                </Button>
              </div>
            </Section>
          )}

          {/* === Ranglar === */}
          <Section icon={<Palette className="size-5" />} title="Ranglar" desc="Mahsulot ranglari — rasmlar shu ranglarga ulanadi">
            <div className="space-y-4">
              {colors.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => {
                    const active = form.colors.includes(c.id);
                    return (
                      <button key={c.id} type="button" onClick={() => toggleIn("colors", c.id)}
                        className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                          active ? "border-gold bg-gold/10 text-navy-900 ring-1 ring-gold/40" : "border-navy-200 bg-white text-navy-600 hover:border-navy-300")}>
                        <span className="size-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                        {c.name}
                        {active && <Check className="size-3.5 text-gold-dark" />}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-navy-400">Hali rang yo&apos;q. Quyida yangi rang qo&apos;shing.</p>
              )}

              {/* inline new color */}
              <div className="flex flex-wrap items-end gap-2 rounded-xl border border-dashed border-navy-200 p-3">
                <Field label="Yangi rang nomi" className="flex-1 min-w-[8rem]">
                  <Input value={newColorName} onChange={(e) => setNewColorName(e.target.value)} placeholder="Masalan: Bej" />
                </Field>
                <Field label="Rang">
                  <div className="flex h-10 items-center gap-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="size-10 cursor-pointer rounded-xl border border-navy-200 bg-white p-0.5 shadow-sm"
                    />
                    <Input
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      placeholder="#aabbcc"
                      className="w-24 text-sm uppercase"
                      maxLength={7}
                    />
                  </div>
                </Field>
                <Button type="button" variant="outline" loading={creatingColor}
                  onClick={createColor} disabled={!newColorName.trim()}>
                  <Plus className="size-4" /> Rang qo&apos;shish
                </Button>
              </div>
            </div>
          </Section>

          {/* === Rasmlar === */}
          <Section icon={<ImagePlus className="size-5" />} title="Rasmlar" desc="Mahsulot rasmlari; ★ belgili — asosiy rasm, har birini rangga ulash mumkin">
            <div className="space-y-4">
              {(serverImages.length > 0 || localImages.length > 0) && (
                <div className="flex flex-wrap gap-3">
                  {serverImages.map((img) => (
                    <ImageCard
                      key={img.id}
                      src={img.image_url}
                      isMain={img.is_main}
                      onRemove={() => deleteServerImage(img.id)}
                      onToggleMain={isEdit ? () => toggleServerMain(img.id) : undefined}
                      colorId={img.color != null ? String(img.color) : ""}
                      onColorChange={(colorId) => setServerImageColor(img.id, colorId)}
                      colorOptions={linkedColors}
                    />
                  ))}
                  {localImages.map((li) => (
                    <ImageCard
                      key={li._id}
                      src={URL.createObjectURL(li.file)}
                      isMain={li.is_main}
                      onRemove={() => removeLocalImage(li._id)}
                      onToggleMain={() => toggleLocalMain(li._id)}
                      colorId={li.colorId}
                      onColorChange={(colorId) => setLocalImageColor(li._id, colorId)}
                      colorOptions={linkedColors}
                    />
                  ))}
                </div>
              )}

              <div>
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2 rounded-xl border-2 border-dashed border-navy-200 px-4 py-3 text-sm text-navy-400 transition-colors hover:border-gold/50 hover:text-gold-dark">
                  <ImagePlus className="size-5" /> Rasm qo&apos;shish
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => { const f = Array.from(e.target.files ?? []); if (f.length) addLocalImages(f); e.target.value = ""; }} />
              </div>
            </div>
          </Section>

          {/* === Tavsif === */}
          <Section icon={<AlignLeft className="size-5" />} title="Tavsif" desc="Mahsulot haqida batafsil">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Tavsif (uz)">
                  <Textarea rows={4} value={form.description_uz}
                    onChange={(e) => set("description_uz", e.target.value)} placeholder="Mahsulot tavsifi..." />
                </Field>
                <Field label="Tavsif (ru)">
                  <Textarea rows={4} value={form.description_ru}
                    onChange={(e) => set("description_ru", e.target.value)} placeholder="Описание товара..." />
                </Field>
              </div>
            </div>
          </Section>

          {/* === Xususiyatlar === */}
          <Section icon={<ListChecks className="size-5" />} title="Xususiyatlar" desc="Texnik xususiyatlar (ixtiyoriy)">
            <div className="space-y-3">
              {form.attributes.map((attr, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={attr.key} onChange={(e) => setAttr(i, "key", e.target.value)}
                    placeholder="Xususiyat" className="flex-1" />
                  <Input value={attr.value} onChange={(e) => setAttr(i, "value", e.target.value)}
                    placeholder="Qiymat" className="flex-1" />
                  <button type="button" onClick={() => removeAttr(i)}
                    className="rounded-lg p-2 text-red-400 hover:bg-red-50">
                    <Trash2 className="size-4" />
                  </button>
                </div>
              ))}
              <div className="flex flex-wrap gap-2 pt-1">
                <Button type="button" variant="outline" onClick={() => addAttr()}>
                  <Plus className="size-4" /> Qo&apos;shish
                </Button>
                {DEFAULT_ATTR_KEYS.filter((k) => !form.attributes.some((a) => a.key === k)).map((k) => (
                  <button key={k} type="button" onClick={() => addAttr(k, "")}
                    className="rounded-full border border-navy-200 bg-white px-3 py-1 text-xs text-navy-600 transition-colors hover:border-gold/50 hover:bg-gold/5 hover:text-gold-dark">
                    + {k}
                  </button>
                ))}
              </div>
            </div>
          </Section>

          {/* === Uslublar (Styles) === */}
          <Section icon={<Sparkles className="size-5" />} title="Uslublar" desc="Mahsulot qaysi uslublarga mos">
            {styles.length === 0 ? (
              <p className="text-sm text-navy-400">Hali uslub yo&apos;q.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {styles.map((s) => {
                  const active = form.styles.includes(s.id);
                  return (
                    <button key={s.id} type="button" onClick={() => toggleIn("styles", s.id)}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        active ? "border-gold bg-gold/10 text-navy-900 ring-1 ring-gold/40" : "border-navy-200 bg-white text-navy-600 hover:border-navy-300")}>
                      {active && <Check className="size-3.5 text-gold-dark" />}
                      {s.name}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* === Xonalar (Rooms) === */}
          <Section icon={<Sofa className="size-5" />} title="Xonalar" desc="Mahsulot qaysi xonalarga mos">
            {rooms.length === 0 ? (
              <p className="text-sm text-navy-400">Hali xona yo&apos;q.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {rooms.map((r) => {
                  const active = form.rooms.includes(r.id);
                  return (
                    <button key={r.id} type="button" onClick={() => toggleIn("rooms", r.id)}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        active ? "border-gold bg-gold/10 text-navy-900 ring-1 ring-gold/40" : "border-navy-200 bg-white text-navy-600 hover:border-navy-300")}>
                      {active && <Check className="size-3.5 text-gold-dark" />}
                      {r.name}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* === Matolar (Materials) === */}
          <Section icon={<Layers className="size-5" />} title="Matolar" desc="Mahsulot qaysi matolardan tayyorlangan (bir nechta tanlash mumkin)">
            {materials.length === 0 ? (
              <p className="text-sm text-navy-400">
                Hali mato yo&apos;q. <span className="font-medium text-navy-500">Matolar</span> bo&apos;limidan qo&apos;shing.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {materials.map((m) => {
                  const active = form.materials.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => toggleIn("materials", m.id)}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
                        active
                          ? "border-gold bg-gradient-to-br from-gold/15 to-gold/5 shadow-sm ring-1 ring-gold/40"
                          : "border-navy-100 bg-white hover:border-gold/40 hover:bg-gold/5"
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                          active
                            ? "bg-gold/25 text-gold-dark"
                            : "bg-navy-50 text-navy-400 group-hover:text-gold-dark"
                        )}
                      >
                        <Layers className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-navy-800">{m.name}</span>
                        <span className="block truncate text-xs text-navy-400">{m.description || m.slug}</span>
                      </span>
                      {active && (
                        <span className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-gold text-navy-900">
                          <Check className="size-3.5" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>
        </div>

        {/* ---- sidebar column ---- */}
        <div className="space-y-6">
          <Section icon={<Wallet className="size-5" />} title="Narx va ombor" desc="Narxlash va qoldiq">
            <div className="space-y-4">
              <p className="rounded-xl bg-navy-50 px-4 py-2.5 text-xs text-navy-500">
                Narx tayyor o'lchamlarda (har variantning o'z narxi){showPricePerM2 ? " yoki 1 m² narxida (custom o'lcham)" : ""} belgilanadi.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {showPricePerM2 && (
                  <Field label="Narx / m²">
                    <Input type="number" min="0" step="0.01" value={form.price_per_m2}
                      onChange={(e) => set("price_per_m2", e.target.value)} />
                  </Field>
                )}
                <Field label="Chegirma %">
                  <Input type="number" min="0" max="100" value={form.discount_percent}
                    onChange={(e) => set("discount_percent", e.target.value)} />
                </Field>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-navy-50 px-4 py-3">
                <span className="text-sm text-navy-500">Boshlang'ich narx (dan)</span>
                <span className="text-base font-bold tabular-nums text-navy-900">{money(finalPrice)}</span>
              </div>
            </div>
          </Section>

          <Section icon={<Tags className="size-5" />} title="Nishonlar" desc="Bir nechta tanlash mumkin">
            {badges.length === 0 ? (
              <p className="text-sm text-navy-400">
                Hali nishon yo&apos;q.{" "}
                <Link href="/badges" className="font-medium text-gold-dark hover:underline">Nishon qo&apos;shish</Link>
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {badges.map((b) => {
                  const active = form.badges.includes(b.id);
                  return (
                    <button key={b.id} type="button" onClick={() => toggleBadge(b.id)}
                      className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-all",
                        active ? "border-transparent text-white shadow-sm" : "border-navy-200 bg-white text-navy-600 hover:border-navy-300")}
                      style={active ? { backgroundColor: b.color } : undefined}>
                      {active ? <Check className="size-3.5" /> : <span className="size-2.5 rounded-full" style={{ backgroundColor: b.color }} />}
                      {b.name_uz}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          <Section icon={<Settings2 className="size-5" />} title="Holat" desc="Ko'rinish sozlamalari">
            <Toggle checked={form.is_active} onChange={(v) => set("is_active", v)} label="Faol" desc="Saytda ko'rinadi" />
          </Section>

          {/* Star note */}
          {isEdit && product && Number((product as AdminProduct & { rating_avg?: number }).rating_avg ?? 0) > 0 && (
            <Card className="px-4 py-3">
              <div className="flex items-center gap-2">
                <Star className="size-4 fill-gold text-gold" />
                <span className="text-sm font-medium text-navy-800">
                  {Number((product as AdminProduct & { rating_avg?: number }).rating_avg ?? 0).toFixed(1)} / 5
                </span>
                <span className="text-xs text-navy-400">o'rtacha baho</span>
              </div>
            </Card>
          )}
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
