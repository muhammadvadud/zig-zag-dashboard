// Sidebar navigation config. Icons are lucide-react component names.
import type { Role } from "./types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  /** Roles allowed to see/open this item. Omit = staff default (manager & admin). */
  roles?: Role[];
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

// Items without an explicit `roles` list fall back to this (the common case:
// operational/catalog/stats pages meant for manager & admin only).
const STAFF_DEFAULT: Role[] = ["manager", "admin"];

// Roles that may see every panel item regardless of `roles` — full access.
const FULL_ACCESS_ROLES: Role[] = ["manager", "admin"];

export const NAV: NavGroup[] = [
  {
    title: "",
    items: [
      {
        label: "Boshqaruv paneli",
        href: "/dashboard",
        icon: "LayoutDashboard",
      },
    ],
  },
  {
    title: "FOYDALANUVCHILAR",
    items: [{ label: "Foydalanuvchilar", href: "/users", icon: "Users" }],
  },
  {
    title: "SAVDO",
    items: [
      {
        label: "Buyurtmalar",
        href: "/orders",
        icon: "ClipboardList",
        roles: ["employee", "manager", "admin"],
      },
      { label: "O'lchov so'rovlari", href: "/measurements", icon: "Ruler" },
      { label: "To'lovlar", href: "/payments", icon: "CreditCard" },
    ],
  },
  {
    title: "KATALOG",
    items: [
      { label: "Kategoriyalar", href: "/categories", icon: "FolderTree" },
      { label: "Uslublar", href: "/styles", icon: "Palette" },
      { label: "Xonalar", href: "/rooms", icon: "DoorOpen" },
      { label: "Matolar", href: "/materials", icon: "Shirt" },
      { label: "Chevarlar", href: "/tailors", icon: "Scissors" },
      { label: "Mahsulotlar", href: "/products", icon: "Package" },
      { label: "Ranglar", href: "/colors", icon: "Paintbrush" },
      { label: "Nishonlar", href: "/badges", icon: "BadgeCheck" },
      { label: "Sharhlar", href: "/reviews", icon: "Star" },
      { label: "FAQ", href: "/faq", icon: "HelpCircle" },
    ],
  },

  {
    title: "UI",
    items: [
      { label: "Tariflar", href: "/tariffs", icon: "Tag" },
      { label: "Kolleksiyalar", href: "/collections", icon: "Layers" },
      { label: "Bannerlar", href: "/banners", icon: "Image" },
      { label: "Hero matnlari", href: "/hero", icon: "Type" },
    ],
  },
  {
    title: "STATISTIKA",
    items: [{ label: "Statistika", href: "/statistics", icon: "BarChart3" }],
  },
  {
    title: "AI",
    items: [
      { label: "Suhbatlar", href: "/ai/conversations", icon: "MessagesSquare" },
      { label: "Rasm generatsiya", href: "/ai/images", icon: "Sparkles" },
      { label: "Kvota", href: "/ai/quota", icon: "Gauge" },
    ],
  },
  {
    title: "TIZIM",
    items: [
      { label: "Audit jurnali", href: "/audit", icon: "ScrollText" },
      {
        label: "Sozlamalar",
        href: "/settings",
        icon: "Settings",
        roles: ["employee", "manager", "admin"],
      },
    ],
  },
];

/** Sidebar/bottom-nav items visible to this role (data-driven, no hardcoded UI branching). */
export function filterNav(role?: Role | null): NavGroup[] {
  if (!role) return [];
  if (FULL_ACCESS_ROLES.includes(role)) return NAV;
  return NAV.map((g) => ({
    ...g,
    items: g.items.filter((i) => (i.roles ?? STAFF_DEFAULT).includes(role)),
  })).filter((g) => g.items.length > 0);
}

/** Does `pathname` belong to a nav item this role is allowed to open?
 * Routes that aren't in NAV at all (orphan pages) are denied for restricted
 * roles — only manager/admin get the implicit "everything" pass. */
export function isPathAllowed(pathname: string, role?: Role | null): boolean {
  if (!role) return false;
  if (FULL_ACCESS_ROLES.includes(role)) return true;
  for (const group of NAV) {
    for (const item of group.items) {
      if (pathname === item.href || pathname.startsWith(item.href + "/")) {
        return (item.roles ?? STAFF_DEFAULT).includes(role);
      }
    }
  }
  return false;
}

/** Landing page for this role after login / when redirected away from a forbidden page. */
export function homeFor(role?: Role | null): string {
  return role === "employee" ? "/orders" : "/dashboard";
}
