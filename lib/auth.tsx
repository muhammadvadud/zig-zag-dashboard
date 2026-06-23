"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, tokens } from "./api";
import type { AuthUser } from "./types";

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  requestOtp: (phone: string) => Promise<{ debug_code?: string }>;
  verifyOtp: (phone: string, code: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const stored = tokens.user;
    if (stored && tokens.access) setUser(stored);
    setLoading(false);
  }, []);

  async function requestOtp(phone: string) {
    return api<{ debug_code?: string }>("/auth/otp/request/", {
      method: "POST",
      anon: true,
      body: { phone, purpose: "login" },
    });
  }

  async function verifyOtp(phone: string, code: string) {
    const data = await api<{ access: string; refresh: string; user: AuthUser }>(
      "/auth/otp/verify/",
      { method: "POST", anon: true, body: { phone, code, purpose: "login" } }
    );
    tokens.set(data.access, data.refresh, data.user);
    setUser(data.user);
  }

  function logout() {
    tokens.clear();
    setUser(null);
    router.push("/login");
  }

  return (
    <Ctx.Provider value={{ user, loading, requestOtp, verifyOtp, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
