"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface Color {
  id: number;
  name: string;
  hex?: string;
}

type FormState = {
  name: string;
  hex: string;
};

function normalizeHex(hex?: string): string {
  if (!hex) return "#000000";
  return hex.startsWith("#") ? hex : `#${hex}`;
}

function initial(color?: Color | null): FormState {
  return {
    name: color?.name ?? "",
    hex: normalizeHex(color?.hex),
  };
}

export function ColorForm({
  color,
  onClose,
  onSaved,
}: {
  color?: Color | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!color;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(color));
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

    const payload = {
      name: form.name.trim(),
      hex: form.hex.trim(),
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/colors/${color!.id}/`, { method: "PATCH", body: payload });
        notify("Rang saqlandi", "success");
      } else {
        await api(`/admin/colors/`, { method: "POST", body: payload });
        notify("Rang saqlandi", "success");
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

      <Field label="Nomi">
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
      </Field>

      <Field label="Rang (HEX)">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={normalizeHex(form.hex)}
            onChange={(e) => set("hex", e.target.value)}
            className="size-10 cursor-pointer rounded-lg border border-navy-200 bg-white p-0.5"
          />
          <Input
            value={form.hex}
            onChange={(e) => set("hex", e.target.value)}
            placeholder="#aabbcc"
            className="flex-1"
          />
        </div>
      </Field>

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
