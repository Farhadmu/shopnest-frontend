"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { FiCheck, FiHome, FiMapPin, FiPlus, FiTrash2, FiX } from "react-icons/fi";
import {
  createAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  type Address,
} from "@/lib/api/addresses";
import { getErrorMessage } from "@/lib/core/errors";

const DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

const emptyForm = {
  title: "Home",
  fullName: "",
  phone: "",
  division: "Dhaka",
  city: "",
  streetAddress: "",
  isDefault: false,
};

export function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAddresses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setAddresses(await getAddresses());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    try {
      const address = await createAddress(form);
      setAddresses((previous) => {
        const next = form.isDefault
          ? previous.map((item) => ({ ...item, isDefault: false }))
          : previous;
        return [address, ...next].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      });
      setForm(emptyForm);
      setShowForm(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  const handleSetDefault = async (id: string) => {
    setError(null);
    try {
      const updated = await setDefaultAddress(id);
      setAddresses((previous) =>
        previous.map((item) => ({ ...item, isDefault: item.id === updated.id }))
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Remove this saved delivery address?")) return;
    setError(null);
    try {
      await deleteAddress(id);
      await loadAddresses();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <section className="mt-6 rounded-2xl border border-border bg-surface p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">Delivery</p>
          <h2 className="mt-1 text-xl font-black">Saved Address Book</h2>
          <p className="mt-1 text-sm text-muted">Save home, office, and other delivery addresses for one-click checkout.</p>
        </div>
        <button
          type="button"
          onClick={() => setShowForm((value) => !value)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm"
        >
          {showForm ? <FiX /> : <FiPlus />} {showForm ? "Close" : "Add address"}
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl border border-error/20 bg-error/10 p-3 text-xs font-semibold text-error">{error}</p>}

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 grid gap-3 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2">
          <label className="text-xs font-semibold">
            Label
            <select
              value={form.title}
              onChange={(event) => setForm((value) => ({ ...value, title: event.target.value }))}
              className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5"
            >
              <option>Home</option>
              <option>Office</option>
              <option>Other</option>
            </select>
          </label>
          <label className="text-xs font-semibold">
            Recipient name
            <input required value={form.fullName} onChange={(event) => setForm((value) => ({ ...value, fullName: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold">
            Phone number
            <input required type="tel" value={form.phone} onChange={(event) => setForm((value) => ({ ...value, phone: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold">
            Division
            <select value={form.division} onChange={(event) => setForm((value) => ({ ...value, division: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5">
              {DIVISIONS.map((division) => <option key={division}>{division}</option>)}
            </select>
          </label>
          <label className="text-xs font-semibold">
            City / area
            <input value={form.city} onChange={(event) => setForm((value) => ({ ...value, city: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5" />
          </label>
          <label className="text-xs font-semibold sm:col-span-2">
            Detailed address
            <textarea required rows={2} value={form.streetAddress} onChange={(event) => setForm((value) => ({ ...value, streetAddress: event.target.value }))} className="mt-1.5 w-full resize-none rounded-xl border border-border bg-surface px-3 py-2.5" />
          </label>
          <label className="flex items-center gap-2 text-xs font-semibold sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={(event) => setForm((value) => ({ ...value, isDefault: event.target.checked }))} />
            Use as my default delivery address
          </label>
          <button disabled={isSaving} className="rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white disabled:opacity-50 sm:col-span-2">
            {isSaving ? "Saving address..." : "Save address"}
          </button>
        </form>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {isLoading ? (
          <p className="rounded-xl bg-muted-bg p-4 text-sm text-muted sm:col-span-2">Loading saved addresses...</p>
        ) : addresses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-5 text-sm text-muted sm:col-span-2">No saved address yet. Add one now to use it at checkout.</p>
        ) : (
          addresses.map((address) => (
            <article key={address.id} className={`rounded-2xl border p-4 ${address.isDefault ? "border-primary/40 bg-primary/5" : "border-border bg-background"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><FiHome /></span>
                  <div>
                    <p className="text-sm font-black">{address.title}</p>
                    {address.isDefault && <p className="text-[10px] font-bold uppercase text-primary">Default address</p>}
                  </div>
                </div>
                <button type="button" onClick={() => handleDelete(address.id)} className="rounded-lg p-2 text-muted hover:bg-error/10 hover:text-error" aria-label={`Remove ${address.title} address`}><FiTrash2 /></button>
              </div>
              <p className="mt-4 text-sm font-bold">{address.fullName} · {address.phone}</p>
              <p className="mt-1 flex gap-1.5 text-xs leading-5 text-muted"><FiMapPin className="mt-0.5 shrink-0" />{address.streetAddress}, {address.city || address.division}, {address.division}</p>
              {!address.isDefault && (
                <button type="button" onClick={() => handleSetDefault(address.id)} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"><FiCheck /> Set as default</button>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}
