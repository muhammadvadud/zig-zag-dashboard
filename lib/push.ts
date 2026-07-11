// Shared helpers for the browser push-notification opt-in used by
// NotificationBell (fires `new Notification(...)`) and the Settings page
// (lets the user grant/soft-disable it). Browser permission, once granted,
// can't be revoked from JS — so we gate actual firing on both the native
// `Notification.permission` AND this app-level localStorage flag, which the
// Settings toggle controls independently.
export const PUSH_ENABLED_KEY = "zz_dash_push_enabled";

export function isPushSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function isPushEnabled(): boolean {
  if (!isPushSupported()) return false;
  return (
    Notification.permission === "granted" &&
    window.localStorage.getItem(PUSH_ENABLED_KEY) === "1"
  );
}
