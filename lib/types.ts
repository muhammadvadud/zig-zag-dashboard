// Shared API types — mirror the Django serializers in ../zig-zag. See CONTRACT.md.

export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export type Role = "customer" | "manager" | "admin";
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
  role: Role;
  language: Lang;
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
  ai_quota_plan: string;
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

export interface AdminProduct {
  id: number;
  category: number | null;
  slug: string;
  name_uz: string;
  name_ru: string;
  description_uz: string;
  description_ru: string;
  material: string;
  base_price: string;
  price_per_m2: string;
  discount_percent: number;
  is_new: boolean;
  is_active: boolean;
  stock: number;
  tailor: number | null;
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
export interface LowStockItem {
  id: number;
  name: string;
  slug: string;
  stock: number;
}
export interface RecentOrder {
  order_number: string;
  customer: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  total: string | number;
  created_at: string;
}
