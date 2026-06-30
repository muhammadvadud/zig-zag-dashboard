"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { useApi } from "@/lib/api";
import type { AdminProduct } from "@/lib/types";
import { PageHeader } from "@/components/ui/page";
import { Loading, ErrorState } from "@/components/ui";
import { ProductForm } from "../../ProductForm";

export default function EditProductPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const { data, error, isLoading } = useApi<AdminProduct>(
    slug ? `/admin/products/${slug}/` : null
  );

  return (
    <div className="space-y-5">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft className="size-4" />
        Mahsulotlarga qaytish
      </Link>

      <PageHeader
        title="Mahsulotni tahrirlash"
        subtitle={data?.name_uz}
      />

      {isLoading ? (
        <Loading />
      ) : error ? (
        <ErrorState error={error} />
      ) : data ? (
        <ProductForm product={data} />
      ) : (
        <ErrorState error={new Error("Mahsulot topilmadi")} />
      )}
    </div>
  );
}
