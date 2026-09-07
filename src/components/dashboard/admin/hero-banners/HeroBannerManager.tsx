"use client";

import Image from "next/image";
import { ChangeEvent, DragEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  createHeroBanner,
  deleteHeroBanner,
  getHeroBanners,
  HeroBanner,
  reorderHeroBanners,
  updateHeroBanner,
  uploadHeroBannerImage,
} from "@/lib/api/hero-banners";
import type { CategoryItem } from "@/types/category";

type FormState = {
  categoryId: string;
  placement: "hero" | "side" | "bottom";
  imageUrl: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  description: string;
  price: string;
  buttonText: string;
  targetUrl: string;
  bgClassName: string;
  textTheme: "light" | "dark";
  displayOrder: string;
  isActive: boolean;
};

const emptyForm: FormState = {
  categoryId: "",
  placement: "hero",
  imageUrl: "",
  eyebrow: "",
  title: "",
  highlight: "",
  subtitle: "",
  description: "",
  price: "",
  buttonText: "",
  targetUrl: "",
  bgClassName: "",
  textTheme: "light",
  displayOrder: "1",
  isActive: true,
};

function idOf(category: CategoryItem) {
  return String(category.id ?? category._id ?? "");
}

export function HeroBannerManager({ categories }: { categories: CategoryItem[] }) {
  const [categoryId, setCategoryId] = useState(() => idOf(categories[0]));
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [form, setForm] = useState<FormState>(() => ({ ...emptyForm, categoryId: idOf(categories[0]) }));
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const categoryName = useMemo(() => new Map(categories.map((category) => [idOf(category), category.name])), [categories]);

  const load = async () => {
    if (!categoryId) return setBanners([]);
    setLoading(true);
    setError(null);
    try {
      setBanners(await getHeroBanners(categoryId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load banners.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(load);
    // load is intentionally scoped to the selected category.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId]);

  const resetForm = (nextCategoryId = categoryId) => {
    setEditing(null);
    setForm({ ...emptyForm, categoryId: nextCategoryId });
  };

  const edit = (banner: HeroBanner) => {
    setEditing(banner);
    setForm({
      categoryId: banner.categoryId ?? "",
      placement: banner.placement,
      imageUrl: banner.imageUrl,
      eyebrow: banner.eyebrow ?? "",
      title: banner.title ?? "",
      highlight: banner.highlight ?? "",
      subtitle: banner.subtitle ?? "",
      description: banner.description ?? "",
      price: banner.price ?? "",
      buttonText: banner.buttonText ?? "",
      targetUrl: banner.targetUrl ?? "",
      bgClassName: banner.bgClassName ?? "",
      textTheme: banner.textTheme,
      displayOrder: String(banner.displayOrder),
      isActive: banner.isActive,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chooseImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Choose an image file.");
    setSaving(true);
    setError(null);
    try {
      const imageUrl = await uploadHeroBannerImage(file);
      setForm((current) => ({ ...current, imageUrl }));
      setNotice("Image uploaded. Review the preview before saving.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Image upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.categoryId || !form.imageUrl) return setError("Category and image are required.");
    setSaving(true);
    setError(null);
    try {
      const payload = {
        categoryId: form.categoryId,
        placement: form.placement,
        imageUrl: form.imageUrl,
        eyebrow: form.eyebrow.trim() || null,
        title: form.title.trim() || null,
        highlight: form.highlight.trim() || null,
        subtitle: form.subtitle.trim() || null,
        description: form.description.trim() || null,
        price: form.price.trim() || null,
        buttonText: form.buttonText.trim() || null,
        targetUrl: form.targetUrl.trim() || null,
        bgClassName: form.bgClassName.trim() || null,
        textTheme: form.textTheme,
        displayOrder: Number(form.displayOrder) || 0,
        isActive: form.isActive,
      };
      if (editing) await updateHeroBanner(editing.id, payload);
      else await createHeroBanner(payload);
      setNotice(editing ? "Banner updated." : "Banner created.");
      resetForm();
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save banner.");
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (banner: HeroBanner) => {
    try {
      const updated = await updateHeroBanner(banner.id, { isActive: !banner.isActive });
      setBanners((current) => current.map((item) => item.id === banner.id ? updated : item));
      setNotice(updated.isActive ? "Banner activated." : "Banner deactivated.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update status.");
    }
  };

  const remove = async (banner: HeroBanner) => {
    if (!window.confirm(`Delete ${banner.title || "this banner"}?`)) return;
    try {
      await deleteHeroBanner(banner.id);
      setBanners((current) => current.filter((item) => item.id !== banner.id));
      setNotice("Banner deleted.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not delete banner.");
    }
  };

  const reorder = async (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const next = [...banners];
    const from = next.findIndex((item) => item.id === fromId);
    const to = next.findIndex((item) => item.id === toId);
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setBanners(next);
    try {
      await reorderHeroBanners(next.map((item) => item.id));
      setNotice("Banner order saved.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save banner order.");
      await load();
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    if (draggedId) void reorder(draggedId, targetId);
    setDraggedId(null);
  };

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex flex-1 flex-col gap-2 text-sm font-bold text-text">
            Category
            <select value={categoryId} onChange={(event) => { setCategoryId(event.target.value); resetForm(event.target.value); }} className="rounded-xl border border-border bg-background px-4 py-3 font-normal">
              <option value="">Select a category</option>
              {categories.map((category) => <option key={idOf(category)} value={idOf(category)}>{category.name}</option>)}
            </select>
          </label>
          <button type="button" onClick={() => resetForm()} className="rounded-xl bg-primary px-5 py-3 font-bold text-white">{editing ? "New banner" : "Add hero banner"}</button>
        </div>
      </section>

      {(error || notice) && <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>{error ?? notice}</div>}

      <form onSubmit={save} className="grid gap-6 rounded-2xl border border-border bg-surface p-5 shadow-sm lg:grid-cols-[1fr_360px] sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-bold text-text">Placement<select value={form.placement} onChange={(event) => setForm({ ...form, placement: event.target.value as FormState["placement"] })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal"><option value="hero">Hero</option><option value="side">Right side card</option><option value="bottom">Bottom card</option></select></label>
          <label className="text-sm font-bold text-text">Eyebrow<input value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} maxLength={100} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={200} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Highlight<input value={form.highlight} onChange={(event) => setForm({ ...form, highlight: event.target.value })} maxLength={100} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Subtitle<input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} maxLength={300} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text sm:col-span-2">Description<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} maxLength={500} rows={2} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Price<input value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} maxLength={50} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Button text<input value={form.buttonText} onChange={(event) => setForm({ ...form, buttonText: event.target.value })} maxLength={80} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text sm:col-span-2">Target URL<input value={form.targetUrl} onChange={(event) => setForm({ ...form, targetUrl: event.target.value })} placeholder="/products?category=..." className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Text theme<select value={form.textTheme} onChange={(event) => setForm({ ...form, textTheme: event.target.value as FormState["textTheme"] })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal"><option value="light">Light</option><option value="dark">Dark</option></select></label>
          <label className="text-sm font-bold text-text">Background class<input value={form.bgClassName} onChange={(event) => setForm({ ...form, bgClassName: event.target.value })} placeholder="bg-gray-900" className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="text-sm font-bold text-text">Display order<input type="number" min="0" value={form.displayOrder} onChange={(event) => setForm({ ...form, displayOrder: event.target.value })} className="mt-2 w-full rounded-xl border border-border bg-background px-4 py-3 font-normal" /></label>
          <label className="flex items-center gap-3 pt-7 text-sm font-bold text-text"><input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} className="h-4 w-4" />Active banner</label>
          <label className="sm:col-span-2 text-sm font-bold text-text">Image<input type="file" accept="image/*" onChange={chooseImage} className="mt-2 block w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-normal" /></label>
          <div className="flex gap-3 sm:col-span-2"><button disabled={saving || !categoryId} className="rounded-xl bg-primary px-5 py-3 font-bold text-white disabled:opacity-50">{saving ? "Saving..." : editing ? "Save changes" : "Create banner"}</button>{editing && <button type="button" onClick={() => resetForm()} className="rounded-xl border border-border px-5 py-3 font-bold text-text">Cancel</button>}</div>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl bg-muted-bg">
          {form.imageUrl ? <><Image src={form.imageUrl} alt="Hero banner preview" fill className={`object-cover ${form.bgClassName}`} sizes="360px" /><div className={`absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/75 to-transparent p-5 ${form.textTheme === "dark" ? "text-text" : "text-white"}`}><span className="text-xs font-bold uppercase">{form.eyebrow}</span><strong>{form.title || "Banner title"} {form.highlight && <span>{form.highlight}</span>}</strong><span className="text-sm">{form.subtitle || "Banner subtitle"}</span><span className="text-xs">{form.description}</span></div></> : <div className="grid h-full place-items-center text-sm text-muted">Select an image to preview</div>}
        </div>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-black text-text">{categoryName.get(categoryId) || "Selected category"} banners</h2>
        {loading ? <div className="rounded-xl border border-border bg-surface p-8 text-center text-muted">Loading banners...</div> : banners.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-muted">No banners assigned to this category.</div> : banners.map((banner, index) => <div key={banner.id} draggable onDragStart={() => setDraggedId(banner.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => onDrop(event, banner.id)} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4 shadow-sm sm:flex-row sm:items-center"><div className="relative h-28 w-full shrink-0 overflow-hidden rounded-lg bg-muted-bg sm:w-48"><Image src={banner.imageUrl} alt={banner.title || "Hero banner"} fill className="object-cover" sizes="192px" /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="rounded-md bg-muted-bg px-2 py-1 text-xs font-bold">{banner.placement}</span><span className="rounded-md bg-muted-bg px-2 py-1 text-xs font-bold">#{index + 1}</span><span className={`rounded-md px-2 py-1 text-xs font-bold ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>{banner.isActive ? "Active" : "Inactive"}</span></div><h3 className="mt-2 truncate font-black text-text">{banner.title || "Untitled banner"}</h3><p className="truncate text-sm text-muted">{banner.subtitle || "No subtitle"} {banner.targetUrl && `· ${banner.targetUrl}`}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => toggle(banner)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">{banner.isActive ? "Deactivate" : "Activate"}</button><button type="button" onClick={() => edit(banner)} className="rounded-lg border border-border px-3 py-2 text-xs font-bold">Edit</button><button type="button" onClick={() => remove(banner)} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-700">Delete</button></div></div>)}
      </section>
    </div>
  );
}