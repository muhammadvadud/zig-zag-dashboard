# ZigZag Dashboard — Build Contract (single source of truth)

All subagents read THIS file. Do not invent field names — they come from the Django
backend in `../zig-zag`. Frontend is **Next.js 16 (App Router) + TypeScript + Tailwind v4**.

## Run / ports
- Backend Django runs on **:8000** with sqlite: `POSTGRES_DB="" ./venv/bin/python manage.py runserver`
- Dashboard runs on **:3001** (`next dev -p 3001`) — backend CORS already allows `http://localhost:3001`.
- API base: `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1` (see `.env.local`).

## Auth (OTP → JWT)
- Admin user already exists: phone `+998900000000`, role `admin`.
- `POST /auth/otp/request/` body `{phone, purpose:"login"}` → `{message, expires_in, debug_code}` (debug_code present because `OTP_DEBUG_RETURN_CODE=True`).
- `POST /auth/otp/verify/` body `{phone, code, purpose:"login"}` → `{access, refresh, user:{...}}`.
- `POST /auth/token/refresh/` body `{refresh}` → `{access}`.
- Send `Authorization: Bearer <access>` on every admin call.
- Admin endpoints require `role == "admin"`. Use `lib/api.ts` `api()` helper — it injects the token and auto-refreshes on 401.

## Conventions
- Data fetching: **SWR** via the `useApi` hook in `lib/api.ts` (GET) and `api()` for mutations.
- All list endpoints are paginated: response = `{ count, next, previous, results: [...] }`. `page` + `page_size` query params. `search` and filter params as noted.
- Money is a decimal string ("123456.00"). Format with `lib/format.ts` `money()` → "123 456 so'm".
- Dates are ISO strings; format with `fmtDate()` / `fmtDateTime()`.
- Use shared UI from `components/ui/*` and types from `lib/types.ts`. DO NOT redefine them.
- Each page is a client component (`"use client"`) under `app/(panel)/<segment>/`.

## Design tokens (Tailwind theme — defined in globals.css)
- `navy` #1a2a4a (ink/primary), `gold` #c9a769 (accent), `cream` #f6f1e7 (page bg).
- Use classes: `bg-navy text-cream`, `text-navy`, `bg-gold`, `bg-cream`, plus `navy-50..900` tints.
- Status colors: paid/completed = green, pending/processing = amber, cancelled/refunded/failed = red, shipped = blue. Use `<StatusBadge>`.

---

## API ENDPOINTS

### Stats (NEW — built by backend agent) — all `GET`, admin only
| Path | Returns |
|------|---------|
| `/admin/stats/overview/` | `{ today_sales, month_sales, orders_today, orders_month, avg_check, new_customers_month, pending_orders, measurement_requests, conversion, deltas:{today_sales_pct, month_sales_pct, orders_pct, ...} }` (numbers; deltas vs previous period in %) |
| `/admin/stats/sales/?days=30` | `{ points: [{date:"2026-06-01", revenue: 1200000, orders: 5}, ...] }` |
| `/admin/stats/orders-by-status/` | `{ items: [{status:"pending", label:"Kutilmoqda", count: 12}, ...] }` |
| `/admin/stats/top-products/?limit=10` | `{ items: [{product_id, name, qty, revenue}, ...] }` |
| `/admin/stats/top-categories/` | `{ items: [{category, name, revenue, qty}, ...] }` |
| `/admin/stats/payments/` | `{ items: [{provider:"payme", amount: 5000000, count: 20}, ...] }` |
| `/admin/stats/ai-usage/?period=2026-06` | `{ tokens_used, images_used, messages_used, conversations, top_users:[...] }` |
| `/admin/stats/low-stock/?threshold=10` | `{ items: [{id, name, slug, stock}, ...] }` |
| `/admin/stats/recent-orders/?limit=10` | `{ items: [{order_number, customer, status, payment_status, total, created_at}, ...] }` |
| `/admin/stats/pending-reviews/?limit=10` | `{ items: [{id, product, user_name, rating, comment, created_at}, ...] }` |
| `/admin/stats/recent-measurements/?limit=10` | `{ items: [{id, customer, preferred_date, time_slot, status}, ...] }` |

### Orders (existing) — admin
- `GET /admin/orders/?status=&payment_status=&search=&page=` → paginated `AdminOrderRow`:
  `{ order_number, status, payment_status, payment_provider, total, subtotal, discount, delivery_fee, customer, created_at, items_count }`
  (backend agent: ensure AdminOrderList serializer includes `customer` (user full_name/phone), `items_count`, `created_at`).
- `GET /admin/orders/<order_number>/` → full `Order` (see OrderSerializer): `{order_number,status,subtotal,discount,delivery_fee,total,payment_status,payment_provider,comment,items:[OrderItem],created_at}` + `customer`.
- `PATCH /admin/orders/<order_number>/` body `{status}` (one of STATUS_CHOICES) → updates status.
- STATUS_CHOICES: pending, paid, processing, measuring, sewing, shipped, completed, cancelled, refunded.
- PAYMENT_STATUS_CHOICES: unpaid, paid, failed, refunded.
- OrderItem: `{id, product_id, product_slug, variant_id, product_name_snapshot, color, color_hex, image, unit_price, quantity, width_cm, height_cm, service_tariff, line_total}`.

### Users (existing) — admin
- `GET /admin/users/?role=&is_active=&search=&page=` → paginated `AdminUser`:
  `{id, phone, full_name, email, role, is_active, is_phone_verified, language, ai_quota_plan, date_joined}`
- `GET /admin/users/<id>/` and `PATCH /admin/users/<id>/` (editable: full_name, email, role, is_active, language, ai_quota_plan).
- role choices: customer, manager, admin. language: uz, ru.

### Products (existing) — admin
- `GET /admin/products/?search=&page=` → paginated `AdminProduct`:
  `{id, category, slug, name_uz, name_ru, description_uz, description_ru, material, base_price, price_per_m2, discount_percent, is_new, is_active, stock, tailor}` (backend agent: ADD `tailor` (id) to AdminProductSerializer).
- `POST /admin/products/` create, `GET/PATCH/DELETE /admin/products/<slug>/`.
- For the form you need category list (`GET /categories/`) and tailors (`GET /tailors/`).

### Tailors (NEW admin CRUD — built by backend agent)
- `GET /admin/tailors/?page=` paginated, `POST /admin/tailors/`, `GET/PATCH/DELETE /admin/tailors/<id>/`.
- Fields: `{id, name_uz, name_ru, initials, specialty_uz, specialty_ru, rating, orders_count, sort_order, is_active}` (+ read `photo` url).
- Public `GET /tailors/` returns `{id, name, initials, specialty, photo, rating, orders_count}`.

### Reviews (NEW admin moderation — built by backend agent)
- `GET /admin/reviews/?is_published=&search=&page=` paginated:
  `{id, product, product_slug, user_name, rating, comment, is_published, created_at}`.
- `PATCH /admin/reviews/<id>/` body `{is_published}` to publish/unpublish.
- Optional bulk: `POST /admin/reviews/publish/` body `{ids:[...]}`.

### Read-only / list endpoints for the "remaining" sidebar pages (mostly existing public)
- `GET /categories/` `GET /styles/` `GET /rooms/` `GET /banners/` `GET /collections/` `GET /faq/` `GET /tariffs/` `GET /hero/`.
- `GET /admin/measurements/` (if added) or show measurement requests via stats; `GET /admin/ai/usage/` (existing AdminAIUsageList).
- Audit log: `GET /admin/audit/` (backend agent: add a simple list if quick; else page shows "—").

---

## Sidebar navigation (groups → items). label (uz) | route | icon (lucide name)
DASHBOARD
- Boshqaruv paneli | /dashboard | LayoutDashboard

FOYDALANUVCHILAR
- Foydalanuvchilar | /users | Users
- Manzillar | /addresses | MapPin
- OTP kodlar | /otp | KeyRound

KATALOG
- Kategoriyalar | /categories | FolderTree
- Uslublar | /styles | Palette
- Xonalar | /rooms | DoorOpen
- Chevarlar | /tailors | Scissors
- Mahsulotlar | /products | Package
- Ranglar | /colors | Paintbrush
- Sharhlar | /reviews | Star
- Kolleksiyalar | /collections | Layers
- Bannerlar | /banners | Image
- Hero matnlari | /hero | Type
- FAQ | /faq | HelpCircle

SAVDO
- Tariflar | /tariffs | Tag
- Savatlar | /carts | ShoppingCart
- Buyurtmalar | /orders | ClipboardList
- O'lchov so'rovlari | /measurements | Ruler
- To'lovlar | /payments | CreditCard

AI
- Suhbatlar | /ai/conversations | MessagesSquare
- Rasm generatsiya | /ai/images | Sparkles
- Kvota | /ai/quota | Gauge

TIZIM
- Audit jurnali | /audit | ScrollText

Pages without a dedicated CRUD owner this round render a clean list/placeholder using
`<PageHeader>` + `<DataTable>` (or an "API ulanmoqda" empty state if no endpoint yet).
Priority CRUD this round: Dashboard, Orders, Users, Products, Tailors, Reviews.
