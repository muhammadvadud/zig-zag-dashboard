"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Package,
  Tag,
  Palette,
  Maximize2,
  Scaling,
  Scissors,
  CheckCircle,
  Info,
  Layers,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

import { useApi } from "@/lib/api";
import type { OrderDetail, ProductImage, AdminProduct } from "@/lib/types";
import { money } from "@/lib/format";
import {
  Card,
  Loading,
  ErrorState,
} from "@/components/ui";

export default function OrderItemDetailPage() {
  const params = useParams<{ order_number: string; slug: string }>();
  const orderNumber = params?.order_number;
  const slug = params?.slug;

  // 1. Fetch Order Details to find the specific order item snapshot
  const { data: orderData, error: orderError, isLoading: orderLoading } = useApi<OrderDetail>(
    orderNumber ? `/admin/orders/${orderNumber}/` : null
  );

  // 2. Fetch the Actual Product Details
  const { data: productData, error: productError, isLoading: productLoading } = useApi<AdminProduct>(
    slug ? `/admin/products/${slug}/` : null
  );

  // 3. Fetch Product Images
  const { data: imagesRaw, isLoading: imagesLoading } = useApi<ProductImage[] | { results: ProductImage[] }>(
    slug ? `/admin/products/${slug}/images/` : null
  );

  // Normalize images list (might be paginated or raw array)
  const images: ProductImage[] = Array.isArray(imagesRaw)
    ? imagesRaw
    : (imagesRaw && typeof imagesRaw === "object" && "results" in imagesRaw && Array.isArray(imagesRaw.results))
    ? imagesRaw.results
    : [];

  const [activeImage, setActiveImage] = useState<string>("");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Find the matching order item snapshot
  const orderItem = orderData?.items?.find((item) => item.product_slug === slug);

  // Combine images from product image endpoint and fallback to order item snapshot image
  const allImageUrls = [
    ...(orderItem?.image ? [orderItem.image] : []),
    ...images.map((img) => img.image_url),
  ].filter((url, index, self) => self.indexOf(url) === index); // unique

  useEffect(() => {
    if (allImageUrls.length > 0 && !activeImage) {
      setActiveImage(allImageUrls[0]);
    }
  }, [allImageUrls, activeImage]);

  const isLoading = orderLoading || productLoading || imagesLoading;
  const error = orderError || productError;

  if (isLoading) return <Loading />;
  if (error) return <ErrorState error={error} />;
  if (!orderData) return <ErrorState error={new Error("Buyurtma topilmadi")} />;
  if (!orderItem) return <ErrorState error={new Error("Ushbu mahsulot buyurtma tarkibida topilmadi")} />;

  const handleOpenLightbox = (url: string) => {
    const index = allImageUrls.indexOf(url);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  const handlePrevLightbox = () => {
    setLightboxIndex((prev) => (prev === 0 ? allImageUrls.length - 1 : prev - 1));
  };

  const handleNextLightbox = () => {
    setLightboxIndex((prev) => (prev === allImageUrls.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-6 animate-rise pb-10">
      {/* Navigation and breadcrumbs */}
      <div className="flex items-center justify-between">
        <Link
          href={`/orders/${orderNumber}`}
          className="inline-flex items-center gap-1.5 text-sm text-navy-400 hover:text-navy-700 transition-colors group"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          Buyurtma #{orderNumber} ga qaytish
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Gallery & Images (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="overflow-hidden bg-white border border-navy-100/80 shadow-soft">
            <div className="p-4">
              {/* Main Image Viewport */}
              <div className="relative aspect-[4/3] rounded-2xl bg-navy-50 overflow-hidden border border-navy-100 group shadow-inner">
                {activeImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activeImage}
                    alt={orderItem.product_name_snapshot}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-navy-300 gap-2">
                    <Package className="size-12 stroke-[1.25]" />
                    <span className="text-sm">Rasm yuklanmadi</span>
                  </div>
                )}

                {activeImage && (
                  <button
                    onClick={() => handleOpenLightbox(activeImage)}
                    className="absolute right-4 bottom-4 p-3 rounded-xl bg-navy-900/80 text-white hover:bg-navy-900 backdrop-blur-sm transition-all shadow-lg hover:scale-105 active:scale-95 border border-white/10"
                    title="Kattalashtirish"
                  >
                    <Maximize2 className="size-5" />
                  </button>
                )}
              </div>

              {/* Thumbnails Carousel */}
              {allImageUrls.length > 1 && (
                <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-thin">
                  {allImageUrls.map((url, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(url)}
                      className={`relative size-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                        activeImage === url
                          ? "border-gold scale-[0.98] shadow-md"
                          : "border-navy-100/60 hover:border-navy-300 opacity-80 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt="Kichik rasm"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Product Snapshot Details inside Order */}
          <Card className="p-5 border border-navy-100/80 bg-white/95 shadow-soft">
            <h3 className="text-lg font-bold text-navy-900 mb-4 flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gold/10 text-gold-dark ring-1 ring-gold/20">
                <CheckCircle className="size-4" />
              </span>
              Sotib olingan parametrlar (Buyurtma bo&apos;yicha ma&apos;lumot)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SnapshotItem
                icon={<Tag className="size-4" />}
                label="Buyurtmadagi nomi"
                value={orderItem.product_name_snapshot}
                className="sm:col-span-2"
              />
              <SnapshotItem
                icon={<Palette className="size-4" />}
                label="Tanlangan rang"
                value={
                  orderItem.color ? (
                    <span className="inline-flex items-center gap-2">
                      {orderItem.color_hex && (
                        <span
                          className="size-4 rounded-full border border-navy-200 shadow-sm"
                          style={{ backgroundColor: orderItem.color_hex }}
                        />
                      )}
                      <span>{orderItem.color}</span>
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
              <SnapshotItem
                icon={<Scaling className="size-4" />}
                label="O&apos;lcham"
                value={
                  orderItem.width_cm && orderItem.height_cm
                    ? `${orderItem.width_cm} × ${orderItem.height_cm} sm`
                    : "—"
                }
              />
              <SnapshotItem
                icon={<Info className="size-4" />}
                label="Dona narxi"
                value={money(orderItem.unit_price)}
              />
              <SnapshotItem
                icon={<Info className="size-4" />}
                label="Soni"
                value={`${orderItem.quantity} dona`}
              />
              <div className="sm:col-span-2 border-t border-navy-100/60 pt-4 mt-2 flex items-center justify-between">
                <span className="text-navy-400 text-sm font-medium">Jami oraliq qiymat</span>
                <span className="text-xl font-extrabold text-navy-900 bg-gold/5 border border-gold/10 px-4 py-1.5 rounded-xl">
                  {money(orderItem.line_total)}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN: Product Specifications & Descriptions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* General specs */}
          <Card className="p-5 border border-navy-100/80 bg-white shadow-soft space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gold-dark bg-gold/10 px-2.5 py-0.5 rounded-full ring-1 ring-gold/20">
                Mahsulot pasporti
              </span>
              <h2 className="text-xl font-extrabold text-navy-900 mt-2.5 leading-snug">
                {productData?.name_uz || orderItem.product_name_snapshot}
              </h2>
              {productData?.name_ru && (
                <p className="text-xs text-navy-400 mt-1 italic font-medium">
                  ru: {productData.name_ru}
                </p>
              )}
            </div>

            <div className="border-t border-navy-100/60 pt-4 space-y-3">
              {productData?.price_per_m2 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-navy-400 font-medium">1 kv. metr narxi</span>
                  <span className="font-semibold text-navy-800">{money(productData.price_per_m2)}</span>
                </div>
              )}
              {productData?.starting_price && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-navy-400 font-medium">Boshlang&apos;ich narxi</span>
                  <span className="font-semibold text-navy-800">{money(productData.starting_price)}</span>
                </div>
              )}
              {productData?.discount_percent ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-navy-400 font-medium">Chegirma</span>
                  <span className="font-semibold text-sale bg-sale/5 border border-sale/10 px-2 py-0.5 rounded-lg text-xs">
                    {productData.discount_percent}%
                  </span>
                </div>
              ) : null}
            </div>

            {/* Badges / Labels */}
            {productData?.badges_detail && productData.badges_detail.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {productData.badges_detail.map((badge) => (
                  <span
                    key={badge.id}
                    className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border shadow-sm"
                    style={{
                      backgroundColor: badge.bg_color || "var(--navy-50)",
                      color: badge.text_color || "var(--navy-800)",
                      borderColor: badge.border_color || "transparent",
                    }}
                  >
                    {badge.name_uz}
                  </span>
                ))}
              </div>
            )}
          </Card>

          {/* Tailor / Tikuvchi */}
          {productData?.tailor && (
            <Card className="p-4 border border-navy-100/80 bg-white/95 shadow-soft flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold-dark ring-1 ring-gold/20">
                <Scissors className="size-5" />
              </span>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-navy-400 uppercase tracking-wider block">Mas&apos;ul Tikuvchi (ID)</span>
                <span className="text-sm font-semibold text-navy-800 block truncate">
                  Tikuvchi #{productData.tailor}
                </span>
              </div>
            </Card>
          )}

          {/* Materials / Materiallar */}
          {productData?.materials_detail && productData.materials_detail.length > 0 && (
            <Card className="p-5 border border-navy-100/80 bg-white shadow-soft">
              <h4 className="text-sm font-bold text-navy-900 mb-3 flex items-center gap-2">
                <Layers className="size-4 text-navy-400" />
                Material tarkibi
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {productData.materials_detail.map((mat) => (
                  <span
                    key={mat.id}
                    className="text-xs bg-navy-50 border border-navy-100 text-navy-700 px-3 py-1 rounded-xl font-medium shadow-sm"
                  >
                    {mat.name_uz}
                  </span>
                ))}
              </div>
            </Card>
          )}

          {/* Description */}
          {(productData?.description_uz || productData?.description_ru) && (
            <Card className="p-5 border border-navy-100/80 bg-white shadow-soft space-y-3">
              <h4 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                <Info className="size-4 text-navy-400" />
                Mahsulot haqida tavsif
              </h4>
              <div className="text-sm text-navy-600 leading-relaxed space-y-2 whitespace-pre-line font-medium">
                {productData.description_uz && (
                  <div>
                    <span className="text-[10px] font-bold text-navy-400 uppercase block mb-1">O&apos;zbekcha</span>
                    <p>{productData.description_uz}</p>
                  </div>
                )}
                {productData.description_ru && (
                  <div className="border-t border-navy-100/40 pt-2.5 mt-2.5">
                    <span className="text-[10px] font-bold text-navy-400 uppercase block mb-1">Ruscha</span>
                    <p>{productData.description_ru}</p>
                  </div>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* LIGHTBOX MODAL */}
      {lightboxOpen && (
        <div 
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-[200] bg-navy-950/98 backdrop-blur-md flex flex-col items-center justify-center select-none animate-fade-in cursor-pointer"
        >
          {/* Close button - Fixed to top-right of the screen */}
          <button
            onClick={() => setLightboxOpen(false)}
            className="fixed top-6 right-6 p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all z-50 border border-white/10 hover:scale-105 active:scale-95 cursor-pointer pointer-events-auto"
          >
            <X className="size-6" />
          </button>

          {/* Left Nav Arrow - Fixed to middle-left of the screen */}
          {allImageUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handlePrevLightbox(); }}
              className="fixed left-6 lg:left-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/5 text-white hover:bg-white/15 transition-all border border-white/5 hover:scale-105 active:scale-95 cursor-pointer z-50 pointer-events-auto"
            >
              <ChevronLeft className="size-6" />
            </button>
          )}

          {/* Main Zoomed Image Container */}
          <div className="relative w-full max-w-4xl h-[75vh] px-4 flex items-center justify-center pointer-events-none">
            {/* Lightbox Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={allImageUrls[lightboxIndex]}
              alt="Zoomed Product"
              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/5 pointer-events-auto cursor-default animate-scale-up"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Right Nav Arrow - Fixed to middle-right of the screen */}
          {allImageUrls.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); handleNextLightbox(); }}
              className="fixed right-6 lg:right-8 top-1/2 -translate-y-1/2 p-4 rounded-2xl bg-white/5 text-white hover:bg-white/15 transition-all border border-white/5 hover:scale-105 active:scale-95 cursor-pointer z-50 pointer-events-auto"
            >
              <ChevronRight className="size-6" />
            </button>
          )}

          {/* Lightbox Index Indicator - Fixed to bottom center of the screen */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-semibold tracking-wider bg-white/5 border border-white/5 px-4 py-1.5 rounded-full pointer-events-none">
            {lightboxIndex + 1} / {allImageUrls.length}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Inline Helper components ── */

function SnapshotItem({
  icon,
  label,
  value,
  className,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-3.5 rounded-xl border border-navy-100/50 bg-navy-50/40 space-y-1 ${className ?? ""}`}>
      <div className="flex items-center gap-1.5 text-navy-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-sm font-semibold text-navy-800">{value}</div>
    </div>
  );
}
