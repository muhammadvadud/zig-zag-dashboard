// Shared API types — mirror the Django serializers in ../zig-zag. See CONTRACT.md.

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Role = "customer" | "employee" | "manager" | "admin";
export type Lang = "uz" | "ru";

export type OrderStatus =
  | "pending"
  | "paid"
  | "processing"
  | "measuring"
  | "sewing"
  | "shipped"
  | "completed"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "unpaid" | "paid" | "failed" | "refunded";

export interface AuthUser {
  id: number;
  phone: string;
  full_name: string;
  email?: string;
  role: Role;
  language: Lang;
  is_phone_verified?: boolean;
  telegram_enabled?: boolean;
  date_joined?: string;
}

export interface AdminUser {
  id: number;
  phone: string;
  full_name: string;
  email: string;
  role: Role;
  is_active: boolean;
  is_phone_verified: boolean;
  language: Lang;
  date_joined: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_slug: string;
  variant_id: number;
  product_name_snapshot: string;
  color: string | null;
  color_hex: string | null;
  image: string | null;
  unit_price: string;
  quantity: number;
  width_cm: number | null;
  height_cm: number | null;
  service_tariff: string | null;
  line_total: string;
}

export interface AdminOrderRow {
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_provider: string;
  total: string;
  subtotal: string;
  discount: string;
  delivery_fee: string;
  customer: string;
  created_at: string;
  items_count: number;
}

export interface OrderDetail extends AdminOrderRow {
  comment: string;
  items: OrderItem[];
}

/** Mahsulotga biriktiriladigan nishon (Yangi, Chegirma, Top, ...). */
export interface Badge {
  id: number;
  name: string;
  color: string;
}

/** Admin (yozish/o'qish) nishon — bilingual nom + rang. */
export interface AdminBadge {
  id: number;
  name_uz: string;
  name_ru: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export type ProductType = "variant" | "custom" | "both";

export interface ProductAttribute {
  key: string;
  value: string;
}

/** Rang (global ro'yxat). */
export interface Color {
  id: number;
  name: string;
  hex: string;
}

/** Uslub (Style) — mahsulotga biriktiriladi. */
export interface Style {
  id: number;
  slug: string;
  name: string;
  is_active?: boolean;
  sort_order?: number;
}

/** Xona (Room) — mahsulotga biriktiriladi. */
export interface Room {
  id: number;
  slug: string;
  name: string;
  is_active?: boolean;
  sort_order?: number;
}

/** Mato/material — mahsulotga bir nechta biriktiriladi. */
export interface Material {
  id: number;
  slug: string;
  name: string;
  description?: string;
  is_active?: boolean;
  sort_order?: number;
  products_count?: number;
}

export interface ProductVariant {
  id: number;
  name: string;
  width_cm: number | null;
  height_cm: number | null;
  price: string;
  unit_price: string;
  is_active: boolean;
  label?: string;
}

export interface ProductImage {
  id: number;
  image_url: string;
  is_main: boolean;
  sort_order: number;
  color: number | null;
}

export interface AdminProduct {
  id: number;
  category: number | null;
  slug: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  starting_price: string;
  price_per_m2: string;
  discount_percent: number;
  is_active: boolean;
  tailor: number | null;
  badges: number[];
  badges_detail: Badge[];
  styles?: number[];
  rooms?: number[];
  materials?: number[];
  materials_detail?: Material[];
  colors?: number[];
  colors_detail?: Color[];
  size_mode?: ProductType;
  attributes?: ProductAttribute[];
  main_image?: string | null;
}

export interface Tailor {
  id: number;
  name: string;
  initials: string;
  specialty: string;
  photo: string | null;
  rating: string | number;
  orders_count: number;
}

export interface AdminTailor {
  id: number;
  name_uz: string;
  name_ru: string;
  initials: string;
  specialty_uz: string;
  specialty_ru: string;
  rating: string | number;
  orders_count: number;
  sort_order: number;
  is_active: boolean;
  photo: string | null;
}

export interface AdminReview {
  id: number;
  product: string;
  product_slug: string;
  user_name: string;
  rating: number;
  comment: string;
  is_published: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  slug: string;
  name: string;
  is_active: boolean;
  sort_order: number;
}

// ---- Stats ----
export interface Overview {
  today_sales: number;
  month_sales: number;
  orders_today: number;
  orders_month: number;
  avg_check: number;
  new_customers_month: number;
  pending_orders: number;
  measurement_requests: number;
  conversion: number;
  deltas: Record<string, number>;
  // Katalog bo'yicha umumiy KPIlar (Mahsulot statistikasi sahifasi uchun) —
  // shu endpoint javobida doim bor, faqat boshqaruv paneli ulardan foydalanmaydi.
  products?: number;
  total_views?: number;
  total_orders?: number;
  total_revenue?: number;
  total_customers?: number;
}

/** Bitta mahsulot bo'yicha analitika qatori — GET /admin/stats/products/. */
export interface ProductStatRow {
  id: number;
  slug: string;
  name: string;
  main_image: string | null;
  category: string | null;
  views_count: number;
  views_7d: number;
  views_30d: number;
  favorites_count: number;
  orders_count: number;
  sold_qty: number;
  revenue: number;
  reviews_count: number;
  rating_avg: string | number;
  /** 0..1 nisbat — foizga o'zi ko'paytiriladi (1.0dan oshishi mumkin). */
  conversion: number;
  top_variant: { name: string; sold_qty: number } | null;
}

export interface SalesPoint {
  date: string;
  revenue: number;
  orders: number;
}
export interface StatusSlice {
  status: OrderStatus;
  label: string;
  count: number;
}
export interface TopProduct {
  product_id: number;
  name: string;
  qty: number;
  revenue: number;
}
export interface TopCategory {
  category: string;
  name: string;
  revenue: number;
  qty: number;
}
export interface PaymentSlice {
  provider: string;
  amount: number;
  count: number;
}
export interface RecentOrder {
  order_number: string;
  customer: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: string | number;
  created_at: string;
}
