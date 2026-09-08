"use client";

import { useEffect, useState, useCallback } from "react";
import { DashboardShell, StatCard, EmptyState, LoadingCard } from "@/components/dashboard/DashboardUI";
import { adminDashboardLinks } from "@/lib/constants/dashboard-nav";
import {
  searchAdminOrders,
  getAdminOrderStats,
  getOrderById,
  cancelOrder,
  Order,
  OrderStats,
  OrderListResponse,
} from "@/lib/api/orders";
import {
  FaSearch,
  FaFilter,
  FaTimes,
  FaEye,
  FaBan,
  FaShoppingBag,
  FaUser,
  FaStore,
  FaCreditCard,
  FaTruck,
  FaBox,
  FaDollarSign,
  FaCalendar,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaSpinner,
} from "react-icons/fa";

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: "bg-amber-500/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/30" },
  confirmed: { bg: "bg-blue-500/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/30" },
  processing: { bg: "bg-violet-500/10", text: "text-violet-600 dark:text-violet-400", border: "border-violet-500/30" },
  shipped: { bg: "bg-cyan-500/10", text: "text-cyan-600 dark:text-cyan-400", border: "border-cyan-500/30" },
  out_for_delivery: { bg: "bg-indigo-500/10", text: "text-indigo-600 dark:text-indigo-400", border: "border-indigo-500/30" },
  delivered: { bg: "bg-emerald-500/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/30" },
  cancelled: { bg: "bg-red-500/10", text: "text-red-600 dark:text-red-400", border: "border-red-500/30" },
  returned: { bg: "bg-orange-500/10", text: "text-orange-600 dark:text-orange-400", border: "border-orange-500/30" },
  refunded: { bg: "bg-gray-500/10", text: "text-gray-600 dark:text-gray-400", border: "border-gray-500/30" },
};

const PAYMENT_COLORS: Record<string, { className: string }> = {
  paid: { className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
  unpaid: { className: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  refunded: { className: "bg-red-500/10 text-red-600 dark:text-red-400" },
};

export default function AdminOrdersPage() {
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [ordersData, setOrdersData] = useState<OrderListResponse | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState("");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("-1");
  const [page, setPage] = useState(1);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    try {
      const data = await getAdminOrderStats();
      setStats(data);
    } catch {
      setStats(null);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchAdminOrders({
        q: search || undefined,
        status: filterStatus !== "all" ? filterStatus : undefined,
        paymentStatus: filterPaymentStatus || undefined,
        paymentMethod: filterPaymentMethod || undefined,
        sortBy,
        sortDir,
        page,
        limit: 20,
      });
      setOrdersData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load orders");
      setOrdersData(null);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus, filterPaymentStatus, filterPaymentMethod, sortBy, sortDir, page]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleSelectOrder = async (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel || !cancelReason.trim()) return;
    setActionLoading(true);
    try {
      await cancelOrder(orderToCancel);
      setShowCancelModal(false);
      setCancelReason("");
      setOrderToCancel(null);
      await loadOrders();
      await loadStats();
      if (selectedOrder?.id === orderToCancel) {
        setSelectedOrder(null);
      }
    } catch {
      // handled
    } finally {
      setActionLoading(false);
    }
  };

  const openCancelModal = (orderId: string) => {
    setOrderToCancel(orderId);
    setShowCancelModal(true);
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  return (
    <DashboardShell
      role="Administrator"
      title="Platform Orders & Governance"
      subtitle="Monitor marketplace transactions, view order details, and manage order governance"
      links={adminDashboardLinks}
      showContinueShopping={false}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-7">
        <StatCard icon="📋" label="Total Orders" value={stats?.totalOrders || 0} note="All time" />
        <StatCard icon="💰" label="Total GMV" value={`৳${(stats?.totalGmv || 0).toLocaleString()}`} note="Gross merchandise" color="success" />
        <StatCard icon="⏳" label="Pending" value={stats?.pendingOrders || 0} note="Awaiting action" color="warning" />
        <StatCard icon="⚙️" label="Processing" value={stats?.processingOrders || 0} note="In progress" color="accent" />
        <StatCard icon="🚚" label="Shipped" value={stats?.shippedOrders || 0} note="In transit" />
        <StatCard icon="✅" label="Delivered" value={stats?.deliveredOrders || 0} note="Completed" color="success" />
        <StatCard icon="❌" label="Cancelled" value={stats?.cancelledOrders || 0} note="Cancelled" color="error" />
      </div>

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
                placeholder="Search by Order ID, customer, product, or address..."
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
              <option value="totalAmount">Highest Amount</option>
              <option value="-totalAmount">Lowest Amount</option>
              <option value="updatedAt">Recently Updated</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={filterPaymentStatus}
              onChange={(e) => { setFilterPaymentStatus(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Payment Status</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={filterPaymentMethod}
              onChange={(e) => { setFilterPaymentMethod(e.target.value); setPage(1); }}
              className="rounded-xl border border-border bg-muted-bg px-3 py-2 text-sm text-text outline-none focus:border-primary"
            >
              <option value="">All Payment Methods</option>
              <option value="cod">COD</option>
              <option value="stripe">Stripe</option>
              <option value="card">Card</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
          <FaExclamationCircle className="mx-auto text-red-500 text-3xl mb-2" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadOrders}
            className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-600"
          >
            Retry
          </button>
        </div>
      )}

      {/* Orders List */}
      {!error && (
        <div className="grid gap-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-2xl border border-border bg-surface p-12 text-center">
              <EmptyState
                icon="📦"
                title="No Orders Yet"
                description="There are currently no orders to display."
              />
            </div>
          ) : (
            <div className="grid gap-4">
              {orders.map((order) => {
                const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
                const primaryImage = order.items[0]?.image;
                const additionalImages = order.items.slice(1, 4);

                return (
                  <div
                    key={order.id}
                    className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Product Thumbnails */}
                      <div className="flex items-center gap-2 sm:flex-col sm:items-start">
                        {primaryImage ? (
                          <img
                            src={primaryImage}
                            alt={order.items[0]?.title || "Product"}
                            className="h-16 w-16 rounded-xl object-cover border border-border"
                          />
                        ) : (
                          <div className="h-16 w-16 rounded-xl bg-muted-bg border border-border flex items-center justify-center">
                            <FaBox className="text-muted" size={20} />
                          </div>
                        )}
                        {additionalImages.length > 0 && (
                          <div className="flex sm:flex-col gap-1">
                            {additionalImages.map((item, idx) => (
                              <img
                                key={idx}
                                src={item.image}
                                alt={item.title}
                                className="h-10 w-10 rounded-lg object-cover border border-border"
                              />
                            ))}
                            {order.items.length > 4 && (
                              <div className="h-10 w-10 rounded-lg bg-muted-bg border border-border flex items-center justify-center text-[10px] font-bold text-muted">
                                +{order.items.length - 4}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Order Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-sm font-bold text-text">
                                #{order.id.slice(-8).toUpperCase()}
                              </span>
                              <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${statusColor.bg} ${statusColor.text} border ${statusColor.border}`}>
                                {formatStatus(order.status)}
                              </span>
                            </div>
                            <p className="mt-1 text-xs text-muted">
                              {order.items.length} item{order.items.length !== 1 ? "s" : ""} • Placed {new Date(order.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-black text-text">৳{order.totalAmount.toLocaleString()}</p>
                            <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold ${PAYMENT_COLORS[order.paymentStatus]?.className || "bg-gray-500/10 text-gray-600"}`}>
                              {order.paymentStatus.toUpperCase()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
                          <span className="flex items-center gap-1">
                            <FaUser size={10} /> Customer: {order.userId?.slice(-6) || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStore size={10} /> {order.items[0]?.storeId?.slice(-6) || "N/A"}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaCreditCard size={10} /> {order.paymentMethod.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3">
                      <span className="text-[10px] font-semibold text-muted uppercase">
                        Admin Actions
                      </span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleSelectOrder(order)}
                          className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-bold text-text transition hover:bg-muted-bg hover:text-primary"
                        >
                          <FaEye size={12} /> View Details
                        </button>
                        {order.status !== "cancelled" && order.status !== "delivered" && (
                          <button
                            onClick={() => openCancelModal(order.id)}
                            className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-500/20"
                          >
                            <FaBan size={12} /> Cancel Order
                          </button>
                        )}
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
            Page {pagination.page} of {pagination.totalPages} • {pagination.total} orders
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

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSelectedOrder(null)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl overflow-y-auto bg-surface shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-surface/95 p-4 backdrop-blur">
              <div>
                <h3 className="font-black text-text">Order #{selectedOrder.id.slice(-8).toUpperCase()}</h3>
                <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-black uppercase mt-1 ${STATUS_COLORS[selectedOrder.status]?.bg} ${STATUS_COLORS[selectedOrder.status]?.text} border ${STATUS_COLORS[selectedOrder.status]?.border}`}>
                  {formatStatus(selectedOrder.status)}
                </span>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg border border-border bg-background p-2 hover:bg-muted-bg"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Order Summary */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Order Date</h4>
                  <p className="mt-1 font-semibold text-text">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Last Updated</h4>
                  <p className="mt-1 font-semibold text-text">{new Date(selectedOrder.updatedAt).toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Total Amount</h4>
                  <p className="mt-1 font-semibold text-text text-lg">৳{selectedOrder.totalAmount.toLocaleString()}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Payment</h4>
                  <p className="mt-1 font-semibold text-text capitalize">{selectedOrder.paymentMethod}</p>
                  <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold mt-1 ${PAYMENT_COLORS[selectedOrder.paymentStatus]?.className || "bg-gray-500/10 text-gray-600"}`}>
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Products */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted mb-3">Products</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted-bg/30 p-3">
                      {item.image ? (
                        <img src={item.image} alt={item.title} className="h-12 w-12 rounded-lg object-cover border border-border" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-muted-bg border border-border flex items-center justify-center">
                          <FaBox className="text-muted" size={16} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text truncate">{item.title || `Item #${idx + 1}`}</p>
                        <p className="text-xs text-muted">Qty: {item.quantity} × ৳{item.price.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-bold text-text">৳{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer & Delivery */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Customer</h4>
                  <p className="mt-1 font-semibold text-text">User ID: {selectedOrder.userId?.slice(-8) || "N/A"}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted-bg/30 p-4">
                  <h4 className="text-xs font-bold uppercase text-muted">Delivery Address</h4>
                  <p className="mt-1 text-sm text-text">{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-bold uppercase text-muted mb-3">Order Timeline</h4>
                <div className="space-y-2">
                  {selectedOrder.statusHistory?.map((event, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-xl border border-border bg-muted-bg/30 p-3">
                      <div className={`h-2.5 w-2.5 rounded-full ${event.status === "cancelled" ? "bg-red-500" : event.status === "delivered" ? "bg-emerald-500" : "bg-primary"}`} />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text">{formatStatus(event.status)}</p>
                        <p className="text-xs text-muted">{new Date(event.at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cancel Action */}
              {selectedOrder.status !== "cancelled" && selectedOrder.status !== "delivered" && (
                <div className="border-t border-border pt-4">
                  <button
                    onClick={() => openCancelModal(selectedOrder.id)}
                    className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-500/20"
                  >
                    <FaBan size={14} /> Cancel This Order
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-xl">
            <h3 className="text-lg font-black text-text">Cancel Order?</h3>
            <p className="mt-1 text-sm text-muted">
              This will mark order #{orderToCancel?.slice(-8).toUpperCase()} as cancelled.
            </p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason for cancellation..."
              rows={3}
              className="mt-4 w-full rounded-xl border border-border bg-muted-bg px-4 py-3 text-sm text-text outline-none focus:border-primary"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => { setShowCancelModal(false); setCancelReason(""); setOrderToCancel(null); }}
                className="rounded-xl border border-border px-4 py-2 text-sm font-bold text-text hover:bg-muted-bg"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={!cancelReason.trim() || actionLoading}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
              >
                {actionLoading ? <FaSpinner className="animate-spin" size={14} /> : <FaBan size={14} />}
                Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
