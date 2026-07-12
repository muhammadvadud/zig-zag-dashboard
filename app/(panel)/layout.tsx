"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { isPathAllowed, homeFor } from "@/lib/nav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loading } from "@/components/ui";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowed = !!user && isPathAllowed(pathname, user.role);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && !allowed) router.replace(homeFor(user.role));
  }, [loading, user, allowed, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Tekshirilmoqda..." />
      </div>
    );
  }

  // Forbidden route for this role: don't mount the page (avoids firing its
  // API calls/erroring) while the redirect above takes effect.
  if (!allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Yo'naltirilmoqda..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar onMenu={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-7xl p-4 pb-24 lg:p-6 lg:pb-6">{children}</main>
      </div>
      <BottomNav onMenu={() => setSidebarOpen(true)} />
    </div>
  );
}
