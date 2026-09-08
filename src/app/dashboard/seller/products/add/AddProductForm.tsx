"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@heroui/react";
import { FaCheckCircle } from "react-icons/fa";
import { Panel } from "@/components/dashboard/DashboardUI";

import type { ProductFormState } from "@/types/product-form";
import { CoreIdentitySection } from "@/components/dashboard/seller/products/CoreIdentitySection";
import { PricingInventorySection } from "@/components/dashboard/seller/products/PricingInventorySection";
import { VariantMatrixSection } from "@/components/dashboard/seller/products/VariantMatrixSection";
import { TechSpecsSection } from "@/components/dashboard/seller/products/TechSpecsSection";
import { LivePreviewSidebar } from "@/components/dashboard/seller/products/LivePreviewSidebar";
import { PackageContentsSection } from "@/components/dashboard/seller/products/PackageContentsSection";
import { DescriptionSection } from "@/components/dashboard/seller/products/DescriptionSection";
import { ProductGalleryUploader } from "@/components/dashboard/seller/products/ProductGalleryUploader";
import { ListingHealthRing } from "@/components/dashboard/seller/products/ListingHealthRing";
import { useProductForm } from "./useProductForm";

function AddProductFormInner() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const p = useProductForm(editId);

  const patchForm = (patch: Partial<ProductFormState>) =>
    p.setForm((prev) => ({ ...prev, ...patch }));

  return (
    <div className="mx-auto max-w-6xl pb-24">
      {/* ── Header / breadcrumb / actions ── */}
      <div className="mb-5 flex flex-col gap-4 rounded-2xl border border-border bg-surface p-5 shadow-xs sm:p-6 xl:flex-row xl:items-center xl:justify-between">
        <div className="max-w-2xl">
          <nav className="flex items-center gap-1.5 text-xs font-bold text-muted">
            <Link href="/dashboard/seller" className="transition hover:text-primary">
              Seller Hub
            </Link>
            <span>/</span>
            <Link href="/dashboard/seller/products" className="transition hover:text-primary">
              Products
            </Link>
            <span>/</span>
            <span className="text-text">{editId ? "Edit Product" : "Add New Product"}</span>
          </nav>
          <h1 className="mt-1.5 text-2xl font-black tracking-tight text-text sm:text-3xl">
            {editId ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Build a high-converting, policy-compliant listing with AI-assisted copy, a multi-image
            gallery, and full technical specifications.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center xl:w-auto">
          <ListingHealthRing score={p.listingHealth} />

          <Button
            type="button"
            variant="primary"
            isDisabled={p.isLoading}
            onPress={p.handleSubmit as any}
            className="whitespace-nowrap"
          >
            {p.isLoading ? "Saving..." : editId ? "Update Product" : "Publish Product"}
          </Button>
        </div>
      </div>

      {p.errorMsg && (
        <div className="mb-5 rounded-2xl border border-error/30 bg-error/10 p-4 text-sm font-semibold text-error">
          {p.errorMsg}
        </div>
      )}
      {p.successMsg && (
        <div className="mb-5 flex items-center gap-2 rounded-2xl border border-success/30 bg-success/10 p-4 text-sm font-semibold text-success">
          <FaCheckCircle /> {p.successMsg}
        </div>
      )}

      <form onSubmit={p.handleSubmit} className="grid gap-5 xl:grid-cols-12">
        {/* ═══════════════════ LEFT: FORM SECTIONS ═══════════════════ */}
        <div className="flex flex-col gap-5 xl:col-span-8">
          <CoreIdentitySection
            form={p.form}
            categories={p.categories}
            onChange={patchForm}
            onAutoImproveTitle={p.handleAiImproveTitle}
          />

          <Panel
            title="Product Gallery & Visuals"
            action={
              <span className="text-[11px] font-bold text-muted">{p.images.length}/8 slots used</span>
            }
          >
            <ProductGalleryUploader images={p.images} onImagesChange={p.setImages} maxImages={8} />
          </Panel>

          <PricingInventorySection
            form={p.form}
            onChange={patchForm}
            regular={p.regular}
            selling={p.selling}
            discountPct={p.discountPct}
            netPayout={p.netPayout}
            hasVariants={p.variants.length > 0}
            variantStockTotal={p.variantStockTotal}
          />

          <VariantMatrixSection
            variants={p.variants}
            onAdd={p.addVariant}
            onUpdate={p.updateVariant}
            onRemove={p.removeVariant}
          />

          <TechSpecsSection
            specs={p.specs}
            onAdd={p.addSpecRow}
            onUpdate={p.updateSpecRow}
            onRemove={p.removeSpecRow}
          />

          <PackageContentsSection
            items={p.packageContents}
            newItem={p.newPackageItem}
            onNewItemChange={p.setNewPackageItem}
            onAdd={p.addPackageItem}
            onRemove={p.removePackageItem}
          />

          <DescriptionSection
            description={p.form.description}
            tagsInput={p.form.tagsInput}
            isAiGenerating={p.isAiGenerating}
            onDescriptionChange={(value) => patchForm({ description: value })}
            onTagsChange={(value) => patchForm({ tagsInput: value })}
            onAiGenerate={p.handleAiGenerate}
          />
        </div>

        {/* ═══════════════════ RIGHT: LIVE PREVIEW & TIPS ═══════════════════ */}
        <div className="flex flex-col gap-5 xl:col-span-4">
          <LivePreviewSidebar
            images={p.images}
            title={p.form.title}
            selling={p.selling}
            regular={p.regular}
            discountPct={p.discountPct}
            variants={p.variants}
            escrow={p.form.escrow}
            effectiveStock={p.effectiveStock}
            listingHealth={p.listingHealth}
            titleLength={p.form.title.length}
            imagesCount={p.images.length}
            specCount={p.filledSpecRows.length}
          />
        </div>
      </form>

      {/* ── Fixed bottom action bar ── */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-4 py-3 shadow-lg backdrop-blur-xl lg:left-[17rem]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <div className="hidden items-center gap-2 text-xs font-semibold text-muted sm:flex">
            <span className="h-2 w-2 rounded-full bg-primary" />
            Draft in progress — remember to publish
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard/seller/products"
              className="rounded-xl border border-border px-4 py-2.5 text-center text-sm font-bold text-text transition hover:bg-muted-bg"
            >
              Cancel
            </Link>
            <Button type="button" variant="primary" isDisabled={p.isLoading} onPress={p.handleSubmit as any}>
              {p.isLoading ? "Saving..." : editId ? "Update Product" : "Publish Product"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AddProductForm() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-sm text-muted">Loading product editor...</div>}>
      <AddProductFormInner />
    </Suspense>
  );
}