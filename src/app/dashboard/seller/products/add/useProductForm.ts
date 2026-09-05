"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct, getProductById, updateProduct } from "@/lib/api/products";
import { clientFetch, clientMutation } from "@/lib/core/client";
import { getErrorMessage } from "@/lib/core/errors";
import {
  DEFAULT_CATEGORIES,
  ESCROW_OPTIONS,
  RESERVED_SPEC_KEYS,
  SWATCH_PALETTE,
  WARRANTY_OPTIONS,
  uid,
} from "@/lib/constants/product-form";
import type { ProductFormState, SpecRow, VariantRow } from "@/types/product-form";

const INITIAL_FORM: ProductFormState = {
  title: "",
  category: "Electronics",
  brand: "",
  model: "",
  masterSku: "",
  price: "",
  discountPrice: "",
  stock: "20",
  lowStockAlert: "10",
  barcode: "",
  warranty: WARRANTY_OPTIONS[0],
  escrow: ESCROW_OPTIONS[0],
  codEnabled: true,
  expressDispatch: true,
  description: "",
  tagsInput: "",
};

/**
 * All state + business logic for the Add/Edit Product page, extracted out of
 * the presentational tree so every section component below can stay a small,
 * dumb, reusable piece of UI.
 */
export function useProductForm(editId: string | null) {
  const router = useRouter();

  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [form, setForm] = useState<ProductFormState>(INITIAL_FORM);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [specs, setSpecs] = useState<SpecRow[]>([{ id: uid(), key: "", value: "" }]);
  const [packageContents, setPackageContents] = useState<string[]>([]);
  const [newPackageItem, setNewPackageItem] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Load categories, and existing product data when in edit mode
  useEffect(() => {
    clientFetch<any>("/categories")
      .then((res) => {
        const list = Array.isArray(res) ? res : res?.data ?? [];
        if (list.length > 0) {
          setCategories(list.map((c: any) => c.name || c.title));
        }
      })
      .catch(() => undefined);

    if (!editId) return;

    setIsLoading(true);
    getProductById(editId)
      .then((p) => {
        const specifications = p.specifications || {};
        const restSpecRows: SpecRow[] = Object.entries(specifications)
          .filter(([key]) => !RESERVED_SPEC_KEYS.includes(key))
          .map(([key, value]) => ({ id: uid(), key, value: String(value) }));

        setForm({
          title: p.title || "",
          category: p.category || "Electronics",
          brand: specifications["Brand"] || "",
          model: specifications["Model"] || "",
          masterSku: specifications["Master SKU"] || "",
          price: String(p.price || ""),
          discountPrice: p.discountPrice ? String(p.discountPrice) : "",
          stock: String(p.stock ?? 20),
          lowStockAlert: "10",
          barcode: specifications["Barcode"] || "",
          warranty: specifications["Warranty"] || WARRANTY_OPTIONS[0],
          escrow: specifications["Escrow Guarantee"] || ESCROW_OPTIONS[0],
          codEnabled: specifications["Cash on Delivery"] !== "Disabled",
          expressDispatch: specifications["Express Dispatch"] !== "Disabled",
          description: p.description || "",
          tagsInput: (p.tags || []).join(", "),
        });

        setImages(p.images && p.images.length > 0 ? p.images : []);

        if (specifications["Variants"]) {
          try {
            const parsed = JSON.parse(specifications["Variants"]);
            if (Array.isArray(parsed)) {
              setVariants(
                parsed.map((v: any) => ({
                  id: uid(),
                  name: v.name || "",
                  swatch: v.swatch || SWATCH_PALETTE[0],
                  stock: String(v.stock ?? 0),
                  priceDelta: String(v.priceDelta ?? 0),
                }))
              );
            }
          } catch {
            /* ignore malformed variant payloads */
          }
        }

        if (specifications["Package Contents"]) {
          setPackageContents(
            specifications["Package Contents"]
              .split("|")
              .map((s: string) => s.trim())
              .filter(Boolean)
          );
        }

        setSpecs(restSpecRows.length > 0 ? restSpecRows : [{ id: uid(), key: "", value: "" }]);
      })
      .catch((err) => setErrorMsg(getErrorMessage(err)))
      .finally(() => setIsLoading(false));
  }, [editId]);

  // ── Derived / computed values ──────────────────────────────────────────
  const regular = parseFloat(form.price) || 0;
  const selling = parseFloat(form.discountPrice) || regular;
  const discountPct =
    regular > 0 && selling < regular ? Math.round(((regular - selling) / regular) * 100) : 0;
  const netPayout = selling > 0 ? selling * 0.94 : 0;

  const variantStockTotal = variants.reduce((sum, v) => sum + (parseInt(v.stock, 10) || 0), 0);
  const effectiveStock = variants.length > 0 ? variantStockTotal : parseInt(form.stock, 10) || 0;

  const filledSpecRows = specs.filter((s) => s.key.trim() && s.value.trim());

  const listingHealth = useMemo(() => {
    let score = 0;
    if (form.title.trim().length >= 20) score += 20;
    else if (form.title.trim().length > 0) score += 10;
    if (images.length >= 3) score += 25;
    else if (images.length > 0) score += 12;
    if (form.description.trim().length >= 150) score += 20;
    else if (form.description.trim().length > 0) score += 10;
    if (filledSpecRows.length >= 3) score += 20;
    else if (filledSpecRows.length > 0) score += 10;
    if (regular > 0 && selling > 0) score += 15;
    return Math.min(100, score);
  }, [form.title, images.length, form.description, filledSpecRows.length, regular, selling]);

  // ── Variant handlers ────────────────────────────────────────────────────
  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      {
        id: uid(),
        name: "",
        swatch: SWATCH_PALETTE[prev.length % SWATCH_PALETTE.length],
        stock: "0",
        priceDelta: "0",
      },
    ]);
  const updateVariant = (id: string, patch: Partial<VariantRow>) =>
    setVariants((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  const removeVariant = (id: string) => setVariants((prev) => prev.filter((v) => v.id !== id));

  // ── Tech spec handlers ─────────────────────────────────────────────────
  const addSpecRow = () => setSpecs((prev) => [...prev, { id: uid(), key: "", value: "" }]);
  const updateSpecRow = (id: string, patch: Partial<SpecRow>) =>
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const removeSpecRow = (id: string) => setSpecs((prev) => prev.filter((s) => s.id !== id));

  // ── Package contents handlers ──────────────────────────────────────────
  const addPackageItem = () => {
    const item = newPackageItem.trim();
    if (!item) return;
    setPackageContents((prev) => [...prev, item]);
    setNewPackageItem("");
  };
  const removePackageItem = (idx: number) =>
    setPackageContents((prev) => prev.filter((_, i) => i !== idx));

  // ── AI helpers ──────────────────────────────────────────────────────────
  const handleAiImproveTitle = () => {
    if (!form.title.trim()) {
      setErrorMsg("Enter a draft title first, then Auto-Improve will tighten it up.");
      return;
    }
    const brandPart = form.brand.trim() ? `${form.brand.trim()} ` : "";
    const modelPart = form.model.trim() ? `${form.model.trim()} ` : "";
    let improved = `${brandPart}${modelPart}${form.title.trim()}`.replace(/\s+/g, " ").trim();
    const words = improved.split(" ");
    improved = Array.from(new Set(words)).join(" ").slice(0, 120);
    setForm((prev) => ({ ...prev, title: improved }));
  };

  const handleAiGenerate = async () => {
    if (!form.title.trim()) {
      setErrorMsg("Please enter a Product Title first before generating AI content.");
      return;
    }

    setIsAiGenerating(true);
    setErrorMsg("");
    try {
      const res = await clientMutation<any>("/ai/product-description", "POST", {
        productName: form.title.trim(),
        category: form.category,
        features: form.tagsInput
          ? form.tagsInput.split(",").map((t) => t.trim())
          : ["High quality", "Durable", "Fast delivery"],
      });

      const data = res?.data ?? res;
      if (data?.description) {
        setForm((prev) => ({
          ...prev,
          description: data.description,
          tagsInput: data.tags && Array.isArray(data.tags) ? data.tags.join(", ") : prev.tagsInput,
        }));
        setSuccessMsg("✨ AI generated rich description and tags successfully!");
        setTimeout(() => setSuccessMsg(""), 4000);
      }
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsAiGenerating(false);
    }
  };

  // ── Submit ──────────────────────────────────────────────────────────────
  const buildSpecifications = (): Record<string, string> => {
    const specifications: Record<string, string> = {};
    if (form.brand.trim()) specifications["Brand"] = form.brand.trim();
    if (form.model.trim()) specifications["Model"] = form.model.trim();
    if (form.masterSku.trim()) specifications["Master SKU"] = form.masterSku.trim();
    if (form.barcode.trim()) specifications["Barcode"] = form.barcode.trim();
    if (form.warranty.trim()) specifications["Warranty"] = form.warranty.trim();
    if (form.escrow.trim()) specifications["Escrow Guarantee"] = form.escrow.trim();
    specifications["Cash on Delivery"] = form.codEnabled ? "Enabled" : "Disabled";
    specifications["Express Dispatch"] = form.expressDispatch ? "Enabled" : "Disabled";

    filledSpecRows.forEach((row) => {
      specifications[row.key.trim()] = row.value.trim();
    });

    if (variants.length > 0) {
      specifications["Variants"] = JSON.stringify(
        variants
          .filter((v) => v.name.trim())
          .map((v) => ({
            name: v.name.trim(),
            swatch: v.swatch,
            stock: parseInt(v.stock, 10) || 0,
            priceDelta: parseFloat(v.priceDelta) || 0,
          }))
      );
    }

    if (packageContents.length > 0) {
      specifications["Package Contents"] = packageContents.join(" | ");
    }

    return specifications;
  };

  const handleSubmit = async (e?: { preventDefault?: () => void }) => {
    e?.preventDefault?.();
    if (!form.title.trim()) {
      setErrorMsg("Product title is required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setErrorMsg("Please enter a valid price (৳)");
      return;
    }
    if (!form.description.trim()) {
      setErrorMsg("Product description is required");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    const tags = form.tagsInput
      ? form.tagsInput.split(",").map((t) => t.trim()).filter(Boolean)
      : [form.category.toLowerCase()];

    const payload = {
      title: form.title.trim(),
      category: form.category,
      price: Number(form.price),
      discountPrice: form.discountPrice ? Number(form.discountPrice) : undefined,
      stock: effectiveStock,
      description: form.description.trim(),
      images: images.length > 0 ? images : undefined,
      tags,
      specifications: buildSpecifications(),
    };

    try {
      if (editId) {
        await updateProduct(editId, payload);
      } else {
        await createProduct(payload);
      }
      setSuccessMsg(editId ? "Product updated successfully!" : "Product published to catalog successfully!");
      setTimeout(() => {
        router.push("/dashboard/seller/products");
      }, 1200);
    } catch (err) {
      setErrorMsg(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    categories,
    form,
    setForm,
    images,
    setImages,
    variants,
    specs,
    packageContents,
    newPackageItem,
    setNewPackageItem,
    isLoading,
    isAiGenerating,
    errorMsg,
    successMsg,
    regular,
    selling,
    discountPct,
    netPayout,
    variantStockTotal,
    effectiveStock,
    filledSpecRows,
    listingHealth,
    addVariant,
    updateVariant,
    removeVariant,
    addSpecRow,
    updateSpecRow,
    removeSpecRow,
    addPackageItem,
    removePackageItem,
    handleAiImproveTitle,
    handleAiGenerate,
    handleSubmit,
  };
}