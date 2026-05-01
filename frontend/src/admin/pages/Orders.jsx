import { Fragment, useEffect, useState } from "react";
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

const filters = ["all", "pending", "processing", "shipped", "delivered", "cancelled"];
const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(null);

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

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

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
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update failed");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = orders.filter((o) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      o._id.toLowerCase().includes(s) ||
      o.user?.name?.toLowerCase().includes(s) ||
      o.user?.email?.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            {orders.length} {orders.length === 1 ? "order" : "orders"}
            {statusFilter !== "all" && ` · filtered by ${statusFilter}`}
          </p>
        </div>
      </div>

      <div className="card p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by order ID, customer name or email"
          className="input"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition ring-1 ${
              statusFilter === s
                ? "bg-brand-500 text-white ring-brand-500"
                : "bg-white text-slate-600 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading orders..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {orders.length === 0
              ? "No orders yet."
              : "No orders match your filters."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Order</th>
                  <th className="text-left font-semibold px-6 py-3">Customer</th>
                  <th className="text-left font-semibold px-6 py-3">Items</th>
                  <th className="text-left font-semibold px-6 py-3">Total</th>
                  <th className="text-left font-semibold px-6 py-3">Payment</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-left font-semibold px-6 py-3">Date</th>
                  <th className="text-right font-semibold px-6 py-3 pr-6">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((o) => (
                  <Fragment key={o._id}>
                    <tr className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-mono text-xs text-slate-700">
                        #{o._id.slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {o.user?.name || "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {o.user?.email || ""}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {o.items.length}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatPrice(o.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-slate-700">{o.paymentMethod}</p>
                        <span
                          className={`mt-0.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ${
                            o.isPaid
                              ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                              : "bg-slate-50 text-slate-600 ring-slate-200"
                          }`}
                        >
                          {o.isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={o.status}
                          onChange={(e) => handleStatusChange(o, e.target.value)}
                          disabled={updating === o._id}
                          className={`text-xs font-medium rounded-full px-3 py-1 ring-1 transition cursor-pointer disabled:opacity-60 capitalize ${
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
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right pr-6">
                        <button
                          onClick={() =>
                            setExpanded((id) => (id === o._id ? null : o._id))
                          }
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                        >
                          {expanded === o._id ? "Hide" : "Details"}
                        </button>
                      </td>
                    </tr>
                    {expanded === o._id && (
                      <tr className="bg-slate-50">
                        <td colSpan={8} className="px-6 py-5">
                          <div className="grid lg:grid-cols-2 gap-6">
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                                Items
                              </p>
                              <ul className="divide-y divide-slate-200 bg-white rounded-lg ring-1 ring-slate-200">
                                {o.items.map((it, i) => (
                                  <li
                                    key={i}
                                    className="p-3 flex gap-3 items-center"
                                  >
                                    {it.image && (
                                      <div className="h-10 w-10 rounded overflow-hidden bg-slate-100">
                                        <img
                                          src={it.image} alt=""
                                          className="h-full w-full object-cover"
                                        />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-slate-900 line-clamp-1">
                                        {it.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {formatPrice(it.price)} × {it.qty}
                                      </p>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-900">
                                      {formatPrice(it.price * it.qty)}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mb-2">
                                Shipping address
                              </p>
                              <div className="bg-white rounded-lg ring-1 ring-slate-200 p-3 text-sm text-slate-700 space-y-0.5">
                                <p className="font-medium text-slate-900">
                                  {o.shippingAddress.fullName}
                                </p>
                                <p>{o.shippingAddress.phone}</p>
                                <p>{o.shippingAddress.street}</p>
                                <p>
                                  {o.shippingAddress.city},{" "}
                                  {o.shippingAddress.state}{" "}
                                  {o.shippingAddress.postalCode}
                                </p>
                                <p>{o.shippingAddress.country}</p>
                              </div>
                              <dl className="mt-3 bg-white rounded-lg ring-1 ring-slate-200 p-3 text-sm space-y-1">
                                <div className="flex justify-between">
                                  <dt className="text-slate-600">Subtotal</dt>
                                  <dd>{formatPrice(o.itemsPrice)}</dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-600">Shipping</dt>
                                  <dd>
                                    {o.shippingPrice === 0
                                      ? "Free"
                                      : formatPrice(o.shippingPrice)}
                                  </dd>
                                </div>
                                <div className="flex justify-between">
                                  <dt className="text-slate-600">Tax</dt>
                                  <dd>{formatPrice(o.taxPrice)}</dd>
                                </div>
                                <div className="flex justify-between border-t border-slate-200 pt-1">
                                  <dt className="font-semibold text-slate-900">
                                    Total
                                  </dt>
                                  <dd className="font-bold text-slate-900">
                                    {formatPrice(o.totalPrice)}
                                  </dd>
                                </div>
                              </dl>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
