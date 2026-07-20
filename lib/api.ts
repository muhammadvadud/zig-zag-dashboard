"use client";

import useSWR, { SWRConfiguration } from "swr";

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const ACCESS_KEY = "zz_access";
const REFRESH_KEY = "zz_refresh";
const USER_KEY = "zz_user";

function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined" || typeof window === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export const tokens = {
  get access() {
    return getCookie(ACCESS_KEY);
  },
  get refresh() {
    return getCookie(REFRESH_KEY);
  },
  set(access: string, refresh?: string, user?: unknown) {
    setCookie(ACCESS_KEY, access);
    if (refresh) setCookie(REFRESH_KEY, refresh);
    if (user) setCookie(USER_KEY, JSON.stringify(user));
  },
  get user() {
    const raw = getCookie(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error("Failed to parse user cookie:", e);
      return null;
    }
  },
  clear() {
    deleteCookie(ACCESS_KEY);
    deleteCookie(REFRESH_KEY);
    deleteCookie(USER_KEY);
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
    tokens.set(data.access, data.refresh);
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
  // custom headers
  headers?: Record<string, string>;
}

export async function api<T = unknown>(
  path: string,
  opts: ApiOptions = {}
): Promise<T> {
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;
  const { method = "GET", body, anon = false, formData } = opts;

  const doFetch = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = { ...opts.headers };
    if (!formData && !headers["Content-Type"]) headers["Content-Type"] = "application/json";
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
    let msg = "";

    if (data && typeof data === "object") {
      const obj = data as Record<string, any>;

      // 1. Try to extract nested validation messages from error.details
      if (obj.error && typeof obj.error === "object") {
        const errObj = obj.error;
        if (errObj.details && typeof errObj.details === "object") {
          const details = errObj.details;
          const detailMsgs: string[] = [];
          for (const key in details) {
            const val = details[key];
            const cleanVal = Array.isArray(val) ? val.join(", ") : typeof val === "string" ? val : "";
            if (cleanVal) {
              detailMsgs.push(cleanVal);
            }
          }
          if (detailMsgs.length > 0) {
            msg = detailMsgs.join("; ");
          }
        }

        // 2. If no details, try error.message
        if (!msg && typeof errObj.message === "string") {
          msg = errObj.message;
        }
      }

      // 3. Fallback to top-level detail or message
      if (!msg && typeof obj.detail === "string") {
        msg = obj.detail;
      }
      if (!msg && typeof obj.message === "string") {
        msg = obj.message;
      }

      // 4. Try to parse direct validation errors (Django REST Framework style: { "field_name": ["error"] })
      if (!msg) {
        const detailMsgs: string[] = [];
        for (const key in obj) {
          if (key === "detail" || key === "message" || key === "error" || key === "code") continue;
          const val = obj[key];
          const cleanVal = Array.isArray(val) ? val.join(", ") : typeof val === "string" ? val : "";
          if (cleanVal) {
            detailMsgs.push(cleanVal);
          }
        }
        if (detailMsgs.length > 0) {
          msg = detailMsgs.join("; ");
        }
      }
    }

    if (!msg) {
      msg = `Xatolik (${res.status})`;
    }

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
