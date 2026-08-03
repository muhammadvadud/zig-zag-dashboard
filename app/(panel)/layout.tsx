"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { isPathAllowed, homeFor } from "@/lib/nav";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { BottomNav } from "@/components/layout/BottomNav";
import { Loading, ErrorState } from "@/components/ui";

export default function PanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allowed = !!user && isPathAllowed(pathname, user.role);
  const homePath = user ? homeFor(user.role) : "/login";
  const homeAllowed = user ? isPathAllowed(homePath, user.role) : false;

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (!loading && user && !allowed) {
      if (homeAllowed) {
        router.replace(homePath);
      }
    }
  }, [loading, user, allowed, homeAllowed, homePath, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loading label="Tekshirilmoqda..." />
      </div>
    );
  }

  // If user doesn't even have access to their home path (e.g. a normal customer logging into the admin panel)
  if (!allowed && !homeAllowed) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <ErrorState message="Sizda boshqaruv paneliga kirish huquqi yo'q" />
        <button
          onClick={() => logout()}
          className="mt-4 rounded-md bg-navy-600 px-4 py-2 text-sm font-medium text-white hover:bg-navy-700"
        >
          Tizimdan chiqish
        </button>
      </div>
    );
  }

  // Forbidden route but has a valid home path: wait for redirect
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
