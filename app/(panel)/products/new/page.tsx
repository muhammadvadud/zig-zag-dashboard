"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/ui/page";
import { ProductForm } from "../ProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-5">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-sm text-navy-500 transition-colors hover:text-navy-800"
      >
        <ArrowLeft className="size-4" />
        Mahsulotlarga qaytish
      </Link>

      <PageHeader title="Yangi mahsulot" subtitle="Katalogga yangi mahsulot qo'shish" />

      <ProductForm />
    </div>
  );
}
