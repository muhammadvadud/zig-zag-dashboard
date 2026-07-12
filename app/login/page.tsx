"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { homeFor } from "@/lib/nav";
import { Button, Field, Input } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api";

export default function LoginPage() {
  const { user, requestOtp, verifyOtp } = useAuth();
  const router = useRouter();
  const notify = useToast();

  const [phone, setPhone] = useState("+998900000000");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.replace(homeFor(user.role));
  }, [user, router]);

  async function onRequest(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestOtp(phone.trim());
      setStep("code");
      if (res.debug_code) {
        setCode(res.debug_code);
        notify(`Test kodi: ${res.debug_code}`, "success");
      } else {
        notify("Kod yuborildi", "success");
      }
    } catch (err) {
      notify((err as ApiError).message || "Xatolik", "error");
    } finally {
      setLoading(false);
    }
  }

  async function onVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const loggedInUser = await verifyOtp(phone.trim(), code.trim());
      router.replace(homeFor(loggedInUser.role));
    } catch (err) {
      notify((err as ApiError).message || "Kod noto'g'ri", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-800 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-cream p-8 shadow-xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-gold text-xl font-bold text-navy-900">
            Z
          </div>
          <h1 className="text-xl font-semibold text-navy-900">ZigZag Admin</h1>
          <p className="text-sm text-navy-400">Boshqaruv paneliga kirish</p>
        </div>

        {step === "phone" ? (
          <form onSubmit={onRequest} className="space-y-4">
            <Field label="Telefon raqam">
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998..."
                autoFocus
              />
            </Field>
            <Button type="submit" variant="gold" className="w-full" loading={loading}>
              Kod olish
            </Button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="space-y-4">
            <Field label="Tasdiqlash kodi" hint={`Yuborildi: ${phone}`}>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="0000"
                inputMode="numeric"
                autoFocus
              />
            </Field>
            <Button type="submit" variant="gold" className="w-full" loading={loading}>
              Kirish
            </Button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-sm text-navy-400 hover:text-navy-600"
            >
              ← Raqamni o'zgartirish
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
