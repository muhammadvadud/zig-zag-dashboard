"use client";

import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export interface AdminFaq {
  id: number;
  question: string;
  answer: string;
  sort_order: number;
  is_active: boolean;
}

type FormState = {
  question: string;
  answer: string;
  sort_order: string;
  is_active: boolean;
};

function initial(f?: AdminFaq | null): FormState {
  return {
    question: f?.question ?? "",
    answer: f?.answer ?? "",
    sort_order: f ? String(f.sort_order ?? 0) : "0",
    is_active: f?.is_active ?? true,
  };
}

export function FaqForm({
  faq,
  onClose,
  onSaved,
}: {
  faq?: AdminFaq | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!faq;
  const notify = useToast();
  const [form, setForm] = useState<FormState>(() => initial(faq));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.question.trim()) {
      setError("Savol majburiy");
      return;
    }
    if (!form.answer.trim()) {
      setError("Javob majburiy");
      return;
    }

    const payload = {
      question: form.question.trim(),
      answer: form.answer.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await api(`/admin/faq/${faq!.id}/`, { method: "PATCH", body: payload });
      } else {
        await api(`/admin/faq/`, { method: "POST", body: payload });
      }
      notify("Savol saqlandi", "success");
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

      <Field label="Savol">
        <Input value={form.question} onChange={(e) => set("question", e.target.value)} />
      </Field>

      <Field label="Javob">
        <Textarea rows={4} value={form.answer} onChange={(e) => set("answer", e.target.value)} />
      </Field>

      <Field label="Tartib">
        <Input
          type="number"
          min="0"
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
