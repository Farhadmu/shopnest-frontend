"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { DashboardShell, Panel, EmptyState, LoadingCard } from "@/components/dashboard/DashboardUI";
import { sellerDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getSellerComplaints,
  getSellerComplaintById,
  createSellerComplaint,
  type ComplaintListItem,
  type ComplaintDetail,
  type CreateComplaintInput,
} from "@/lib/api/complaints";
import { useSession } from "@/lib/auth-client";
import {
  FiPlus,
  FiSearch,
  FiChevronRight,
  FiClock,
  FiX,
  FiUpload,
  FiImage,
} from "react-icons/fi";

const COMPLAINT_CATEGORIES = [
  { value: "order", label: "Order Issue" },
  { value: "payment", label: "Payment Problem" },
  { value: "product", label: "Product Issue" },
  { value: "seller", label: "Seller Concern" },
  { value: "delivery", label: "Delivery Issue" },
  { value: "refund", label: "Refund Request" },
  { value: "return", label: "Return Issue" },
  { value: "account", label: "Account Problem" },
  { value: "technical", label: "Technical Issue" },
  { value: "other", label: "Other" },
] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
  open: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  acknowledged: "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
  investigating: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  resolved: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  closed: "bg-gray-500/15 text-gray-600 dark:text-gray-400",
};

type ViewMode = "list" | "create" | "detail";

export default function SellerComplaintsPage() {
  const { data: session } = useSession();
  const [view, setView] = useState<ViewMode>("list");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<ComplaintListItem[]>([]);
  const [selected, setSelected] = useState<ComplaintDetail | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState<CreateComplaintInput>({
    title: "",
    description: "",
    category: "other",
    orderId: "",
    productId: "",
    deliveryId: "",
    sellerId: "",
    attachments: [],
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSellerComplaints({ page, limit: 20, status: filterStatus || undefined });
      setItems(res.items);
      setTotalPages(res.pagination.totalPages);
    } catch (error) {
      console.error("Failed to load complaints", error);
    } finally {
      setLoading(false);
    }
  }, [page, filterStatus]);

  useEffect(() => {
    loadComplaints();
  }, [loadComplaints]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createSellerComplaint(form);
      setToast("Complaint submitted successfully");
      setForm({ title: "", description: "", category: "other", orderId: "", productId: "", deliveryId: "", sellerId: "", attachments: [] });
      setView("list");
      loadComplaints();
    } catch (error) {
      console.error("Failed to submit complaint", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setForm((prev) => ({ ...prev, attachments: [...(prev.attachments || []), ...files].slice(0, 5) }));
  };

  const removeAttachment = (index: number) => {
    setForm((prev) => ({
      ...prev,
      attachments: (prev.attachments || []).filter((_, i) => i !== index),
    }));
  };

  const openDetail = async (id: string) => {
    setLoading(true);
    try {
      const detail = await getSellerComplaintById(id);
      setSelected(detail);
      setView("detail");
    } catch (error) {
      console.error("Failed to load complaint detail", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell
      role="Seller"
      title="My Complaints"
      subtitle="Submit and track seller-related complaints."
      links={sellerDashboardLinks}
    >
      {toast && (
        <div className="mb-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
          {toast}
        </div>
      )}

      {view === "list" && (
        <Panel>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search complaints..."
                  className="h-10 rounded-xl border border-gray-200 bg-white pl-9 pr-4 text-xs dark:border-gray-800 dark:bg-gray-900"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
              >
                <option value="">All Statuses</option>
                <option value="new">New</option>
                <option value="open">Open</option>
                <option value="acknowledged">Acknowledged</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <button
              onClick={() => setView("create")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white"
            >
              <FiPlus /> New Complaint
            </button>
          </div>

          {loading ? (
            <LoadingCard />
          ) : items.length === 0 ? (
            <EmptyState title="No complaints yet" description="Submit a complaint to get started." />
          ) : (
            <div className="space-y-3">
              {items.map((item) => {
                const colors = STATUS_COLORS[item.status] || STATUS_COLORS.new;
                return (
                  <button
                    key={item.id}
                    onClick={() => openDetail(item.id)}
                    className="w-full rounded-2xl border border-gray-200 bg-white p-4 text-left transition hover:border-primary/30 dark:border-gray-800 dark:bg-gray-900"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black uppercase tracking-wider text-muted">{item.incidentCode}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${colors}`}>{item.status}</span>
                        </div>
                        <h3 className="text-sm font-black text-foreground">{item.title}</h3>
                        <p className="text-xs text-muted line-clamp-2">{item.description}</p>
                      </div>
                      <FiChevronRight className="mt-1 shrink-0 text-muted" />
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                      <span className="rounded-full bg-gray-500/10 px-2 py-0.5 font-bold uppercase">{item.category}</span>
                      <span className="flex items-center gap-1"><FiClock /> {new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40 dark:border-gray-800"
              >
                Previous
              </button>
              <span className="text-[11px] text-muted">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-gray-200 px-3 py-1.5 text-xs font-bold disabled:opacity-40 dark:border-gray-800"
              >
                Next
              </button>
            </div>
          )}
        </Panel>
      )}

      {view === "create" && (
        <Panel>
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => setView("list")} className="rounded-xl border border-gray-200 p-2 dark:border-gray-800">
              <FiX />
            </button>
            <div>
              <h2 className="text-lg font-black text-foreground">New Complaint</h2>
              <p className="text-xs text-muted">Describe your issue and attach evidence if needed.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as CreateComplaintInput["category"] }))}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
              >
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Subject</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value.slice(0, 200) }))}
                placeholder="Brief summary of your complaint"
                required
                maxLength={200}
                className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Description (max 500 characters)</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value.slice(0, 500) }))}
                placeholder="Describe your issue in detail..."
                required
                maxLength={500}
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-white p-3 text-xs dark:border-gray-800 dark:bg-gray-900"
              />
              <p className="mt-1 text-right text-[10px] text-muted">{form.description.length}/500</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Order ID (optional)</label>
                <input
                  type="text"
                  value={form.orderId}
                  onChange={(e) => setForm((prev) => ({ ...prev, orderId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Product ID (optional)</label>
                <input
                  type="text"
                  value={form.productId}
                  onChange={(e) => setForm((prev) => ({ ...prev, productId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Delivery ID (optional)</label>
                <input
                  type="text"
                  value={form.deliveryId}
                  onChange={(e) => setForm((prev) => ({ ...prev, deliveryId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Seller ID (optional)</label>
                <input
                  type="text"
                  value={form.sellerId}
                  onChange={(e) => setForm((prev) => ({ ...prev, sellerId: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs dark:border-gray-800 dark:bg-gray-900"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-muted">Attachments (up to 5 images)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-2 text-xs font-bold text-muted hover:border-primary/40"
              >
                <FiUpload /> Upload Images
              </button>
              {form.attachments && form.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {form.attachments.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-2 py-1 text-[10px] dark:border-gray-800 dark:bg-gray-900">
                      <FiImage /> {file.name}
                      <button type="button" onClick={() => removeAttachment(index)} className="text-red-500">
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setView("list")} className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-bold dark:border-gray-800">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
                {submitting ? "Submitting..." : "Submit Complaint"}
              </button>
            </div>
          </form>
        </Panel>
      )}

      {view === "detail" && selected && (
        <Panel>
          <div className="mb-6 flex items-center gap-3">
            <button onClick={() => setView("list")} className="rounded-xl border border-gray-200 p-2 dark:border-gray-800">
              <FiX />
            </button>
            <div>
              <h2 className="text-lg font-black text-foreground">{selected.title}</h2>
              <p className="text-xs text-muted">{selected.incidentCode} • {selected.category}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
              <p className="text-xs text-muted">{selected.description}</p>
              {selected.attachments && selected.attachments.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selected.attachments.map((url, index) => (
                    <a key={index} href={url} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-[10px] font-bold uppercase text-muted">Status</p>
                <p className="text-sm font-black text-foreground capitalize">{selected.status}</p>
              </div>
              <div className="rounded-2xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                <p className="text-[10px] font-bold uppercase text-muted">Severity</p>
                <p className="text-sm font-black text-foreground capitalize">{selected.severity}</p>
              </div>
            </div>

            {selected.history && selected.history.length > 0 && (
              <div>
                <h3 className="mb-2 text-xs font-black uppercase text-muted">History</h3>
                <div className="space-y-2">
                  {selected.history.map((entry, index) => (
                    <div key={index} className="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900">
                      <p className="text-xs font-bold text-foreground">{entry.action}</p>
                      <p className="text-[10px] text-muted">{entry.details}</p>
                      <p className="text-[10px] text-muted">{new Date(entry.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Panel>
      )}
    </DashboardShell>
  );
}
