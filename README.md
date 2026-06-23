# ZigZag — Boshqaruv paneli

ZigZag premium pardalar do'koni uchun admin boshqaruv paneli. Django backend (`zig-zag-backend`) bilan ishlaydi.

## Texnologiyalar

- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **Recharts** — grafiklar
- **SWR** — ma'lumotlarni yuklash
- **lucide-react** — ikonkalar

## Imkoniyatlar

- Telefon + OTP orqali kirish (JWT)
- Dashboard: savdo ko'rsatkichlari, savdo dinamikasi, buyurtmalar holati, to'lovlar, top mahsulot/kategoriya
- Buyurtmalar, foydalanuvchilar, mahsulotlar, chevarlar, sharhlar boshqaruvi (CRUD)
- Katalog: kategoriyalar, uslublar, xonalar, kolleksiyalar, bannerlar, hero matnlari, FAQ, tariflar

## Ishga tushirish

```bash
npm install
npm run dev
```

`http://localhost:3000` da ochiladi.

### Sozlash

`.env.local` faylida backend manzilini ko'rsating:

```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Buyruqlar

| Buyruq | Vazifasi |
| --- | --- |
| `npm run dev` | Ishlab chiqish serveri |
| `npm run build` | Production build |
| `npm run start` | Production serveri |
| `npm run lint` | Lint tekshiruvi |
