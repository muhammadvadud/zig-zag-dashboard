// Sidebar navigation config. Icons are lucide-react component names.
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const NAV: NavGroup[] = [
  {
    title: "",
    items: [{ label: "Boshqaruv paneli", href: "/dashboard", icon: "LayoutDashboard" }],
  },
  {
    title: "FOYDALANUVCHILAR",
    items: [
      { label: "Foydalanuvchilar", href: "/users", icon: "Users" },
      { label: "Manzillar", href: "/addresses", icon: "MapPin" },
      { label: "OTP kodlar", href: "/otp", icon: "KeyRound" },
    ],
  },
  {
    title: "KATALOG",
    items: [
      { label: "Kategoriyalar", href: "/categories", icon: "FolderTree" },
      { label: "Uslublar", href: "/styles", icon: "Palette" },
      { label: "Xonalar", href: "/rooms", icon: "DoorOpen" },
      { label: "Chevarlar", href: "/tailors", icon: "Scissors" },
      { label: "Mahsulotlar", href: "/products", icon: "Package" },
      { label: "Ranglar", href: "/colors", icon: "Paintbrush" },
      { label: "Nishonlar", href: "/badges", icon: "BadgeCheck" },
      { label: "Sharhlar", href: "/reviews", icon: "Star" },
      { label: "Kolleksiyalar", href: "/collections", icon: "Layers" },
      { label: "Bannerlar", href: "/banners", icon: "Image" },
      { label: "Hero matnlari", href: "/hero", icon: "Type" },
      { label: "FAQ", href: "/faq", icon: "HelpCircle" },
    ],
  },
  {
    title: "SAVDO",
    items: [
      { label: "Tariflar", href: "/tariffs", icon: "Tag" },
      { label: "Savatlar", href: "/carts", icon: "ShoppingCart" },
      { label: "Buyurtmalar", href: "/orders", icon: "ClipboardList" },
      { label: "O'lchov so'rovlari", href: "/measurements", icon: "Ruler" },
      { label: "To'lovlar", href: "/payments", icon: "CreditCard" },
    ],
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
    items: [{ label: "Audit jurnali", href: "/audit", icon: "ScrollText" }],
  },
];
