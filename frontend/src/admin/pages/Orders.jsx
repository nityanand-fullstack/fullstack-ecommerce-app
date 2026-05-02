import { Fragment, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  listAllOrdersApi,
  updateOrderStatusApi,
} from "../../api/adminApi.js";
import Loader from "../../components/Loader.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-brand-50 text-brand-700 ring-brand-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const statusDotColor = {
  pending: "bg-amber-500",
  processing: "bg-brand-500",
  shipped: "bg-indigo-500",
  delivered: "bg-emerald-500",
  cancelled: "bg-rose-500",
};

const filters = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];
const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

const PaymentIcon = ({ method }) => {
  if (method === "Razorpay") {
    return (
      <span className="h-7 w-7 grid place-items-center rounded-lg bg-blue-50 text-blue-600 ring-1 ring-blue-100">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      </span>
    );
  }
  if (method === "COD") {
    return (
      <span className="h-7 w-7 grid place-items-center rounded-lg bg-amber-50 text-amber-600 ring-1 ring-amber-100">
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a4 4 0 00-8 0v2M5 9h14l-1 11H6L5 9z" />
        </svg>
      </span>
    );
  }
  return (
    <span className="h-7 w-7 grid place-items-center rounded-lg bg-slate-50 text-slate-600 ring-1 ring-slate-200">
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
      </svg>
    </span>
  );
};

const Avatar = ({ name }) => {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="h-9 w-9 grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-500 text-white text-sm font-semibold shrink-0 ring-2 ring-white shadow-sm">
      {initial}
    </div>
  );
};

const SummaryTile = ({ label, value, tone = "slate", icon }) => {
  const tones = {
    slate: "bg-slate-50 text-slate-600 ring-slate-200",
    emerald: "bg-emerald-50 text-emerald-600 ring-emerald-200",
    brand: "bg-brand-50 text-brand-600 ring-brand-200",
    indigo: "bg-indigo-50 text-indigo-600 ring-indigo-200",
  };
  return (
    <div className="card p-4 flex items-center gap-3">
      <div className={`h-10 w-10 grid place-items-center rounded-xl ring-1 ${tones[tone]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="text-lg font-bold text-slate-900 truncate">{value}</p>
      </div>
    </div>
  );
};

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);
  const [allCounts, setAllCounts] = useState(null); // counts across all statuses

  const statusFilter = searchParams.get("status") || "all";

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await listAllOrdersApi(params);
      setOrders(res.data?.orders || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Separate fetch (no filter) so we can show counts on every filter chip
  const loadCounts = async () => {
    try {
      const res = await listAllOrdersApi({});
      const all = res.data?.orders || [];
      const counts = { all: all.length };
      for (const s of allowedStatuses) counts[s] = 0;
      for (const o of all) counts[o.status] = (counts[o.status] || 0) + 1;
      setAllCounts(counts);
    } catch {
      // silent — chips will fall back to no count
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  useEffect(() => {
    loadCounts();
  }, []);

  const setStatusFilter = (s) => {
    const next = new URLSearchParams(searchParams);
    if (s === "all") next.delete("status");
    else next.set("status", s);
    setSearchParams(next);
  };

  const handleStatusChange = async (order, newStatus) => {
    if (order.status === newStatus) return;
    setUpdating(order._id);
    try {
      await updateOrderStatusApi(order._id, newStatus);
      toast.success(`Status set to ${newStatus}`);
      load();
      loadCounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = useMemo(
    () =>
      orders.filter((o) => {
        if (!search) return true;
        const s = search.toLowerCase();
        return (
          o._id.toLowerCase().includes(s) ||
          o.user?.name?.toLowerCase().includes(s) ||
          o.user?.email?.toLowerCase().includes(s)
        );
      }),
    [orders, search]
  );

  const summary = useMemo(() => {
    const paid = orders.filter((o) => o.isPaid).length;
    const revenue = orders.reduce(
      (s, o) => (o.isPaid ? s + (o.totalPrice || 0) : s),
      0
    );
    return { paid, revenue };
  }, [orders]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage incoming orders, update status and review details.
          </p>
        </div>
        <button
          onClick={() => {
            load();
            loadCounts();
          }}
          disabled={loading}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <svg
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-3M20 14a8 8 0 01-14 3" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile
          label="Showing"
          value={`${filtered.length} ${filtered.length === 1 ? "order" : "orders"}`}
          tone="slate"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          }
        />
        <SummaryTile
          label="Paid"
          value={summary.paid}
          tone="emerald"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          }
        />
        <SummaryTile
          label="To fulfill"
          value={allCounts?.processing ?? 0}
          tone="brand"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7m16 0v10l-8 4m8-14l-8 4m0 0L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          }
        />
        <SummaryTile
          label="Revenue (paid)"
          value={formatPrice(summary.revenue)}
          tone="indigo"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />
            </svg>
          }
        />
      </div>

      {/* Search + filter */}
      <div className="card p-4 space-y-4">
        <div className="relative">
          <svg
            className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID, customer name or email"
            className="input pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((s) => {
            const active = statusFilter === s;
            const count = allCounts ? allCounts[s] ?? 0 : null;
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`group inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ring-1 ${
                  active
                    ? "bg-slate-900 text-white ring-slate-900 shadow-sm"
                    : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {s !== "all" && (
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${statusDotColor[s]} ${
                      active ? "" : "opacity-80"
                    }`}
                  />
                )}
                <span>{s === "all" ? "All" : s}</span>
                {count !== null && (
                  <span
                    className={`min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full text-[10px] font-bold ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders table */}
      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading orders..." />
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="h-14 w-14 mx-auto rounded-2xl bg-slate-100 grid place-items-center text-slate-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="mt-4 font-semibold text-slate-900">
              {orders.length === 0 ? "No orders yet" : "No matches"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              {orders.length === 0
                ? "Orders will appear here as customers check out."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50/80 backdrop-blur text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="text-left font-semibold px-6 py-3.5">Order</th>
                  <th className="text-left font-semibold px-6 py-3.5">Customer</th>
                  <th className="text-left font-semibold px-6 py-3.5">Items</th>
                  <th className="text-left font-semibold px-6 py-3.5">Total</th>
                  <th className="text-left font-semibold px-6 py-3.5">Payment</th>
                  <th className="text-left font-semibold px-6 py-3.5">Status</th>
                  <th className="text-left font-semibold px-6 py-3.5">Date</th>
                  <th className="text-right font-semibold px-6 py-3.5 pr-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((o) => {
                  const isOpen = expanded === o._id;
                  return (
                    <Fragment key={o._id}>
                      <tr
                        className={`transition ${
                          isOpen ? "bg-brand-50/30" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="px-6 py-4">
                          <p className="font-mono text-xs font-semibold text-slate-900">
                            #{o._id.slice(-8).toUpperCase()}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {new Date(o.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={o.user?.name} />
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {o.user?.name || "—"}
                              </p>
                              <p className="text-xs text-slate-500 truncate">
                                {o.user?.email || ""}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                            {o.items.length}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          {formatPrice(o.totalPrice)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <PaymentIcon method={o.paymentMethod} />
                            <div>
                              <p className="text-xs font-medium text-slate-700">
                                {o.paymentMethod}
                              </p>
                              <span
                                className={`inline-flex items-center gap-1 mt-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ring-1 ${
                                  o.isPaid
                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                    : "bg-slate-50 text-slate-600 ring-slate-200"
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${
                                    o.isPaid ? "bg-emerald-500" : "bg-slate-400"
                                  }`}
                                />
                                {o.isPaid ? "Paid" : "Unpaid"}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={o.status}
                            onChange={(e) => handleStatusChange(o, e.target.value)}
                            disabled={updating === o._id}
                            className={`text-xs font-semibold rounded-full px-3 py-1.5 ring-1 transition cursor-pointer disabled:opacity-60 capitalize ${
                              statusStyles[o.status] || statusStyles.pending
                            }`}
                          >
                            {allowedStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 text-slate-500 whitespace-nowrap text-xs">
                          {new Date(o.createdAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="px-6 py-4 text-right pr-6">
                          <button
                            onClick={() =>
                              setExpanded((id) => (id === o._id ? null : o._id))
                            }
                            className={`inline-flex items-center gap-1 text-xs font-semibold rounded-lg px-3 py-1.5 ring-1 transition ${
                              isOpen
                                ? "bg-brand-500 text-white ring-brand-500"
                                : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {isOpen ? "Hide" : "View"}
                            <svg
                              className={`h-3.5 w-3.5 transition-transform ${
                                isOpen ? "rotate-180" : ""
                              }`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={8} className="px-6 py-6">
                            <div className="grid lg:grid-cols-3 gap-5">
                              {/* Items */}
                              <div className="lg:col-span-2">
                                <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2.5">
                                  Items
                                </p>
                                <ul className="divide-y divide-slate-100 bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
                                  {o.items.map((it, i) => (
                                    <li
                                      key={i}
                                      className="p-3 flex gap-3 items-center"
                                    >
                                      {it.image ? (
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                                          <img
                                            src={it.image} alt=""
                                            className="h-full w-full object-cover"
                                          />
                                        </div>
                                      ) : (
                                        <div className="h-12 w-12 rounded-lg bg-slate-100 ring-1 ring-slate-200 shrink-0 grid place-items-center text-slate-400">
                                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                          </svg>
                                        </div>
                                      )}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 line-clamp-1">
                                          {it.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                          {formatPrice(it.price)} × {it.qty}
                                        </p>
                                      </div>
                                      <p className="text-sm font-semibold text-slate-900">
                                        {formatPrice(it.price * it.qty)}
                                      </p>
                                    </li>
                                  ))}
                                </ul>

                                <dl className="mt-4 bg-white rounded-xl ring-1 ring-slate-200 p-4 text-sm space-y-2">
                                  <div className="flex justify-between">
                                    <dt className="text-slate-600">Subtotal</dt>
                                    <dd className="font-medium text-slate-900">
                                      {formatPrice(o.itemsPrice)}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-slate-600">Shipping</dt>
                                    <dd className="font-medium text-slate-900">
                                      {o.shippingPrice === 0
                                        ? "Free"
                                        : formatPrice(o.shippingPrice)}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between">
                                    <dt className="text-slate-600">Tax</dt>
                                    <dd className="font-medium text-slate-900">
                                      {formatPrice(o.taxPrice)}
                                    </dd>
                                  </div>
                                  <div className="flex justify-between border-t border-slate-200 pt-2 mt-2">
                                    <dt className="font-semibold text-slate-900">
                                      Total
                                    </dt>
                                    <dd className="text-base font-bold text-slate-900">
                                      {formatPrice(o.totalPrice)}
                                    </dd>
                                  </div>
                                </dl>
                              </div>

                              {/* Shipping + payment */}
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2.5">
                                    Ship to
                                  </p>
                                  <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4 text-sm text-slate-700 space-y-0.5">
                                    <p className="font-semibold text-slate-900">
                                      {o.shippingAddress.fullName}
                                    </p>
                                    <p className="text-slate-500 text-xs">
                                      📞 {o.shippingAddress.phone}
                                    </p>
                                    <p className="pt-1">{o.shippingAddress.street}</p>
                                    <p>
                                      {o.shippingAddress.city},{" "}
                                      {o.shippingAddress.state}{" "}
                                      {o.shippingAddress.postalCode}
                                    </p>
                                    <p>{o.shippingAddress.country}</p>
                                  </div>
                                </div>

                                <div>
                                  <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-2.5">
                                    Payment
                                  </p>
                                  <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4 space-y-2 text-sm">
                                    <div className="flex items-center gap-3">
                                      <PaymentIcon method={o.paymentMethod} />
                                      <div>
                                        <p className="font-semibold text-slate-900">
                                          {o.paymentMethod}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                          {o.isPaid
                                            ? `Paid · ${new Date(o.paidAt).toLocaleString()}`
                                            : "Awaiting payment"}
                                        </p>
                                      </div>
                                    </div>
                                    {o.paymentResult?.razorpayPaymentId && (
                                      <div className="border-t border-slate-100 pt-2 text-xs space-y-1">
                                        <p>
                                          <span className="text-slate-500">Payment ID: </span>
                                          <span className="font-mono text-slate-700">
                                            {o.paymentResult.razorpayPaymentId}
                                          </span>
                                        </p>
                                        <p>
                                          <span className="text-slate-500">Order ID: </span>
                                          <span className="font-mono text-slate-700">
                                            {o.paymentResult.razorpayOrderId}
                                          </span>
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
