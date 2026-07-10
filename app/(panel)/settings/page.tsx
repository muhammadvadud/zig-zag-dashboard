"use client";

import { useState } from "react";
import { MessageCircle, ShieldCheck } from "lucide-react";

import { api, useApi, ApiError } from "@/lib/api";
import type { AuthUser, Role } from "@/lib/types";

import { Card, CardHeader, Badge, Switch, Loading, ErrorState } from "@/components/ui";
import { PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";

const ROLE_LABEL: Record<Role, string> = {
  customer: "Mijoz",
  employee: "Xodim",
  manager: "Menejer",
  admin: "Admin",
};

export default function SettingsPage() {
  const notify = useToast();
  // Independent fetch (not the cached useAuth() user) so toggling telegram
  // below reflects immediately — AuthProvider only snapshots /auth/me at login.
  const { data: me, error, isLoading, mutate } = useApi<AuthUser>("/auth/me/");
  const [toggling, setToggling] = useState(false);
  const [showLinkHelp, setShowLinkHelp] = useState(false);

  async function toggleTelegram(next: boolean) {
    setToggling(true);
    try {
      const res = await api<{ telegram_enabled: boolean }>(
        "/notifications/telegram/toggle/",
        { method: "POST", body: { enabled: next } }
      );
      setShowLinkHelp(false);
      notify(
        res.telegram_enabled
          ? "Telegram bildirishnomalari yoqildi"
          : "Telegram bildirishnomalari o'chirildi",
        "success"
      );
      mutate();
    } catch (err) {
      const e = err as ApiError;
      const code = (e.data as { error?: { code?: string } } | undefined)?.error?.code;
      if (code === "telegram_not_linked") {
        setShowLinkHelp(true);
        notify("Avval Telegram botni ulang", "error");
      } else {
        notify(e.message || "Xatolik yuz berdi", "error");
      }
    } finally {
      setToggling(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Sozlamalar" subtitle="Profil va bildirishnoma sozlamalari" />

      {error ? (
        <ErrorState error={error} />
      ) : isLoading ? (
        <Card>
          <Loading />
        </Card>
      ) : (
        <div className="space-y-5">
          <Card className="max-w-xl">
            <CardHeader title="Profil" icon={<ShieldCheck className="size-5" />} />
            <div className="space-y-2 px-5 pb-5 text-sm">
              <Row label="F.I.Sh" value={me?.full_name || "—"} />
              <Row label="Telefon" value={me?.phone || "—"} />
              <Row
                label="Rol"
                value={<Badge color="gold">{me?.role ? ROLE_LABEL[me.role] : "—"}</Badge>}
              />
            </div>
          </Card>

          <Card className="max-w-xl">
            <CardHeader
              title="Telegram bildirishnomalari"
              subtitle="Yangi buyurtma va holat o'zgarishlari haqida Telegram orqali xabar oling"
              icon={<MessageCircle className="size-5" />}
            />
            <div className="space-y-4 px-5 pb-5">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-navy-100 bg-navy-50/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-navy-800">
                    {me?.telegram_enabled ? "Yoqilgan" : "O'chirilgan"}
                  </p>
                  <p className="text-xs text-navy-400">
                    Har bir yangi buyurtma va holat o&apos;zgarishi haqida bot orqali xabar
                    keladi
                  </p>
                </div>
                <Switch
                  checked={!!me?.telegram_enabled}
                  disabled={toggling}
                  onChange={toggleTelegram}
                />
              </div>

              {showLinkHelp && (
                <div className="rounded-xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm text-navy-700">
                  <p className="font-medium text-navy-800">Botni ulash</p>
                  <ol className="mt-1.5 list-decimal space-y-1 pl-4 text-navy-600">
                    <li>
                      Telegramda <b>@ZigZagAdminBot</b> botini toping (bot username hali
                      sozlanmagan — egasi tokenni o&apos;rnatgach faollashadi)
                    </li>
                    <li>
                      <code className="rounded bg-white px-1 py-0.5 text-xs">/start</code>{" "}
                      buyrug&apos;ini yuboring
                    </li>
                    <li>So&apos;ralganda kontaktingizni ulashing</li>
                    <li>Shu sahifaga qaytib, tumblerni yoqing</li>
                  </ol>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-navy-50 py-2 last:border-0">
      <span className="text-navy-400">{label}</span>
      <span className="font-medium text-navy-800">{value}</span>
    </div>
  );
}
