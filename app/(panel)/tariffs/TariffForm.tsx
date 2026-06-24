"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface Tariff {
  id: number;
  code: string;
  name: string;
  price?: string | number;
  price_per_m2?: string | number | null;
  is_popular?: boolean;
  features?: string[];
  sort_order?: number;
  is_active?: boolean;
}

type FormState = {
  code: string;
  name: string;
  price: string;
  price_per_m2: string;
  is_popular: boolean;
  features: string;
  sort_order: string;
  is_active: boolean;
};

function initial(tariff?: Tariff | null): FormState {
  return {
    code: tariff?.code ?? "",
    name: tariff?.name ?? "",
    price: tariff?.price != null ? String(parseFloat(String(tariff.price)) || 0) : "",
    price_per_m2:
      tariff?.price_per_m2 != null ? String(parseFloat(String(tariff.price_per_m2)) || 0) : "",
    is_popular: tariff?.is_popular ?? false,
    features: tariff?.features ? tariff.features.join("\n") : "",
    sort_order: tariff ? String(tariff.sort_order ?? 0) : "0",
    is_active: tariff?.is_active ?? true,
  };
}

export function TariffForm({
  tariff,
  onClose,
  onSaved,
}: {
  tariff?: Tariff | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!tariff;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(tariff));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.code.trim()) {
      setError("Kod majburiy");
      return;
    }
    if (!form.name.trim()) {
      setError("Nomi majburiy");
      return;
    }

    const features = form.features
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      code: form.code.trim(),
      name: form.name.trim(),
      price: String(parseFloat(form.price) || 0),
      price_per_m2: form.price_per_m2.trim()
        ? String(parseFloat(form.price_per_m2) || 0)
        : null,
      is_popular: form.is_popular,
      features,
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/tariffs/${tariff!.id}/`, { method: "PATCH", body: payload });
        notify("Tarif saqlandi", "success");
      } else {
        await api(`/admin/tariffs/`, { method: "POST", body: payload });
        notify("Tarif saqlandi", "success");
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
        <Field label="Kod">
          <Input
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
            placeholder="masalan: standart"
          />
        </Field>
        <Field label="Nomi">
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Narx">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
          />
        </Field>
        <Field label="Narx/m²" hint="Ixtiyoriy">
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.price_per_m2}
            onChange={(e) => set("price_per_m2", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Xususiyatlar" hint="Har bir qatorga bitta xususiyat">
        <Textarea
          rows={5}
          value={form.features}
          onChange={(e) => set("features", e.target.value)}
          placeholder={"Bepul yetkazib berish\nKafolat 2 yil\nO'lchov xizmati"}
        />
      </Field>

      <Field label="Tartib">
        <Input
          type="number"
          value={form.sort_order}
          onChange={(e) => set("sort_order", e.target.value)}
        />
      </Field>

      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-navy-700">
          <input
            type="checkbox"
            checked={form.is_popular}
            onChange={(e) => set("is_popular", e.target.checked)}
            className="size-4 accent-gold"
          />
          Mashhur
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
          Saqlash
        </Button>
      </div>
    </form>
  );
}
