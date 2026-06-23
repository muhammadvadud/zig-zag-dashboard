"use client";

import useSWR, { SWRConfiguration } from "swr";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ACCESS_KEY = "zz_access";
const REFRESH_KEY = "zz_refresh";
const USER_KEY = "zz_user";

export const tokens = {
  get access() {
    return typeof window === "undefined" ? null : localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return typeof window === "undefined" ? null : localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh?: string, user?: unknown) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  get user() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function refreshAccess(): Promise<string | null> {
  const refresh = tokens.refresh;
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/auth/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.access) {
    tokens.set(data.access);
    return data.access;
  }
  return null;
}

interface ApiOptions {
  method?: string;
  body?: unknown;
  // when true, do not attach the auth header (login endpoints)
  anon?: boolean;
  // FormData passthrough
  formData?: FormData;
}

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const { method = "GET", body, anon = false, formData } = opts;

  const doFetch = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {};
    if (!formData) headers["Content-Type"] = "application/json";
    if (token && !anon) headers["Authorization"] = `Bearer ${token}`;
    return fetch(url, {
      method,
      headers,
      body: formData ? formData : body != null ? JSON.stringify(body) : undefined,
    });
  };

  let res = await doFetch(tokens.access);

  if (res.status === 401 && !anon) {
    const newToken = await refreshAccess();
    if (newToken) {
      res = await doFetch(newToken);
    } else {
      tokens.clear();
      if (typeof window !== "undefined") window.location.href = "/login";
      throw new ApiError(401, "Sessiya tugadi");
    }
  }

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const msg =
      (data as { detail?: string; error?: { message?: string } })?.detail ||
      (data as { error?: { message?: string } })?.error?.message ||
      `Xatolik (${res.status})`;
    throw new ApiError(res.status, msg, data);
  }
  return data as T;
}

// SWR-based GET hook. key=null skips the request.
export function useApi<T = unknown>(
  path: string | null,
  config?: SWRConfiguration
) {
  return useSWR<T>(path, (p: string) => api<T>(p), {
    revalidateOnFocus: false,
    ...config,
  });
}
