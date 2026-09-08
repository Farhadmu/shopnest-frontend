"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, StatCard, EmptyState, LoadingCard } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  getReviewStats,
  searchAdminReviews,
  dismissReport,
  hideReview,
  removeReviewAdmin,
  Review,
  ReviewStats,
  ReviewListResponse,
} from "@/lib/api/reviews";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaEye,
  FaCheckCircle,
  FaBan,
  FaStar,
  FaFlag,
  FaExclamationTriangle,
  FaCheck,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

const STAR_COLORS: Record<number, { className: string }> = {
  5: { className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  4: { className: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  3: { className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  2: { className: "bg-orange-500/10 text-orange-600 dark:text-orange-400" },
  1: { className: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

export default function AdminReviewsPage() {
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [reviewsData, setReviewsData] = useState<ReviewListResponse | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterReported, setFilterReported] = useState("");
  const [filterVerified, setFilterVerified] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("-1");
  const [page, setPage] = useState(1);

  const [showDismissModal, setShowDismissModal] = useState(false);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [reviewToAction, setReviewToAction] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await getReviewStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchAdminReviews({
        q: search || undefined,
        reported: filterReported || undefined,
        verified: filterVerified || undefined,
        rating: filterRating || undefined,
        sortBy,
        sortDir,
        page,
        limit: 20,
      });
      setReviewsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reviews");
      setReviewsData(null);
    } finally {
      setLoading(false);
    }
  }, [search, filterReported, filterVerified, filterRating, sortBy, sortDir, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleDismiss = async () => {
    if (!reviewToAction) return;
    setActionLoading(true);
    try {
      await dismissReport(reviewToAction);
      setShowDismissModal(false);
      setReviewToAction(null);
      await loadReviews();
      await loadStats();
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const handleHide = async () => {
    if (!reviewToAction) return;
    setActionLoading(true);
    try {
      await hideReview(reviewToAction);
      setShowHideModal(false);
      setReviewToAction(null);
      await loadReviews();
      await loadStats();
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!reviewToAction) return;
    setActionLoading(true);
    try {
      await removeReviewAdmin(reviewToAction);
      setShowRemoveModal(false);
      setReviewToAction(null);
      await loadReviews();
      await loadStats();
      if (selectedReview?.id === reviewToAction) {
        setSelectedReview(null);
      }
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const openDismiss = (id: string) => {
    setReviewToAction(id);
    setShowDismissModal(true);
  };

  const openHide = (id: string) => {
    setReviewToAction(id);
    setShowHideModal(true);
  };

  const openRemove = (id: string) => {
    setReviewToAction(id);
    setShowRemoveModal(true);
  };

  const reviews = reviewsData?.reviews || [];
  const pagination = reviewsData?.pagination;

  const ratingPercent = (count: number) => {
    if (!stats || stats.totalReviews === 0) return 0;
    return Math.round((count / stats.totalReviews) * 1000) / 10;
  };

  return (
    <DashboardShell
      role="Administrator"
      title="Review Moderation & Marketplace Trust"
      subtitle="Monitor reviews, handle reports, and maintain marketplace trust"
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard icon="⭐" label="Total Reviews" value={stats?.totalReviews || 0} note="All reviews" />
        <StatCard icon="📊" label="Avg Rating" value={stats?.avgRating?.toFixed(1) || "0.0"} note="Average rating" color="accent" />
        <StatCard icon="✓" label="Verified" value={stats?.verifiedReviews || 0} note="Verified purchases" color="success" />
        <StatCard icon="🚩" label="Reported" value={stats?.reportedReviews || 0} note="Require attention" color="warning" />
        <StatCard icon="⏳" label="Pending" value={reviews.filter(r => r.reported).length || 0} note="In moderation" />
      </div>

      {/* Rating Distribution */}
      {stats && stats.totalReviews > 0 && (
        <div className="rounded-2xl border border-border bg-surface p-4 sm:p-6">
          <h3 className="text-sm font-black text-text mb-4">Rating Distribution</h3>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = stats.distribution[star] || 0;
              const percent = ratingPercent(count);
              return (
                <div key={star} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-text w-8">{star} ★</span>
                  <div className="flex-1 h-2 rounded-full bg-muted-bg overflow-hidden">
                    <div
                      className={`h-full rounded-full ${STAR_COLORS[star].className}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted w-16 text-right">{count.toLocaleString()}</span>
                  <span className="text-xs text-muted w-12 text-right">{percent}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={14} />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by review text, customer, product..."
                className="w-full rounded-xl border border-border bg-muted-bg pl-9 pr-4 py-2.5 text-sm text-text outline-none focus:border-primary"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2.5 text-sm text-text outline-none focus:border-primary"
            >
              <option value="createdAt">Newest First</option>
              <option value="-createdAt">Oldest First</option>
              <option value="rating">Highest Rating</option>
              <option value="-rating">Lowest Rating</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterReported}
              onChange={(e) => { setFilterReported(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Reports</option>
              <option value="true">Reported</option>
              <option value="false">Unreported</option>
            </select>
            <select
              value={filterVerified}
              onChange={(e) => { setFilterVerified(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Verification</option>
              <option value="true">Verified Purchase</option>
              <option value="false">Unverified</option>
            </select>
            <select
              value={filterRating}
              onChange={(e) => { setFilterRating(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <FaExclamationTriangle className="mx-auto text-red-500 text-3xl mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadReviews}
            className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Reviews List */}
      {!error && (
        <div className="grid gap-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <EmptyState
                icon="⭐"
                title={stats?.totalReviews === 0 ? "No Reviews Yet" : "No Reviews Match Your Filters"}
                description={
                  stats?.totalReviews === 0
                    ? "Your marketplace currently has no reviews."
                    : "Try adjusting your search or filter criteria."
                }
              />
            </div>
          ) : (
            <div className="grid gap-4">
              {reviews.map((review) => {
                const starColor = STAR_COLORS[review.rating] || STAR_COLORS[3];
                return (
                  <div
                    key={review.id}
                    className={`rounded-2xl border bg-surface p-4 sm:p-5 shadow-sm transition ${
                      review.reported
                        ? "border-red-500/30 bg-red-500/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`rounded-md px-2 py-1 text-xs font-black ${starColor.className}`}>
                            {review.rating} / 5
                          </span>
                          {review.reported && (
                            <span className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                              Reported
                            </span>
                          )}
                          {review.verifiedPurchase && (
                            <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm text-text line-clamp-2">{review.comment}</p>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted">
                          <span>Customer: {review.userName || review.userId?.slice(-6)}</span>
                          <span>Product: {review.productId?.slice(-6)}</span>
                          <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                      <span className="text-[10px] font-semibold text-muted uppercase">
                        Moderation
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedReview(review)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-text transition hover:bg-muted-bg hover:text-primary"
                        >
                          <FaEye size={12} /> View
                        </button>
                        {review.reported && (
                          <button
                            onClick={() => openDismiss(review.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 transition hover:bg-emerald-500/20"
                          >
                            <FaCheck size={12} /> Dismiss Report
                          </button>
                        )}
                        <button
                          onClick={() => openHide(review.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-bold text-amber-600 transition hover:bg-amber-500/20"
                        >
                          <FaBan size={12} /> Hide
                        </button>
                        <button
                          onClick={() => openRemove(review.id)}
                          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/20"
                        >
                          <FaTrash size={12} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4">
          <span className="text-xs text-muted">
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} reviews
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-lg border border-border bg-background px-4 py-1.5 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= pagination.totalPages}
              className="rounded-lg border border-border bg-background px-4 py-1.5 text-xs font-bold text-text disabled:opacity-50 hover:bg-muted-bg"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Review Detail Drawer */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedReview(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-surface shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 p-4 backdrop-blur">
              <div>
                <h3 className="font-black text-text">Review #{selectedReview.id.slice(-8).toUpperCase()}</h3>
                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black mt-1 ${STAR_COLORS[selectedReview.rating]?.className}`}>
                  {selectedReview.rating} / 5
                </span>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="rounded-lg border border-border bg-background p-2 hover:bg-muted-bg"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Review Content */}
              <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                <p className="text-sm text-text whitespace-pre-wrap">{selectedReview.comment}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedReview.verifiedPurchase && (
                    <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                      Verified Purchase
                    </span>
                  )}
                  {selectedReview.reported && (
                    <span className="rounded-md bg-red-500/10 px-2 py-1 text-[10px] font-black uppercase text-red-600 dark:text-red-400">
                      Reported
                    </span>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Customer</h4>
                  <p className="mt-1 font-semibold text-text">{selectedReview.userName || "Unknown"}</p>
                  <p className="text-xs text-muted">ID: {selectedReview.userId?.slice(-8)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Product</h4>
                  <p className="mt-1 font-semibold text-text">ID: {selectedReview.productId?.slice(-8)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Review Date</h4>
                  <p className="mt-1 font-semibold text-text">{new Date(selectedReview.createdAt).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Helpful Count</h4>
                  <p className="mt-1 font-semibold text-text">{selectedReview.helpfulCount || 0}</p>
                </div>
              </div>

              {/* Moderation Actions */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-bold text-text mb-3">Moderation Actions</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedReview.reported ? (
                    <button
                      onClick={() => openDismiss(selectedReview.id)}
                      className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm font-bold text-emerald-600 transition hover:bg-emerald-500/20"
                    >
                      <FaCheck size={14} /> Dismiss Report
                    </button>
                  ) : (
                    <button
                      onClick={() => openHide(selectedReview.id)}
                      className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-sm font-bold text-amber-600 transition hover:bg-amber-500/20"
                    >
                      <FaBan size={14} /> Hide Review
                    </button>
                  )}
                  <button
                    onClick={() => openRemove(selectedReview.id)}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-500/20"
                  >
                    <FaTrash size={14} /> Remove Review
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dismiss Modal */}
      {showDismissModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Dismiss Report?</h3>
            <p className="mt-1 text-sm text-muted">This review will no longer be marked as reported.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowDismissModal(false); setReviewToAction(null); }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleDismiss}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {actionLoading ? <FaSpinner className="animate-spin" size={14} /> : <FaCheck size={14} />}
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hide Modal */}
      {showHideModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Hide Review?</h3>
            <p className="mt-1 text-sm text-muted">This review will be hidden from public view.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowHideModal(false); setReviewToAction(null); }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleHide}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-50"
              >
                {actionLoading ? <FaSpinner className="animate-spin" size={14} /> : <FaBan size={14} />}
                Hide Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Modal */}
      {showRemoveModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Remove Review?</h3>
            <p className="mt-1 text-sm text-muted">This review will be permanently removed. This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowRemoveModal(false); setReviewToAction(null); }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={actionLoading}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? <FaSpinner className="animate-spin" size={14} /> : <FaTrash size={14} />}
                Remove Review
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
