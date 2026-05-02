import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext.jsx";
import { getAdminStatsApi } from "../../api/adminApi.js";
import StatCard from "../components/StatCard.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-brand-50 text-brand-700 ring-brand-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    try {
      const res = await getAdminStatsApi(force);
      setData(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load stats");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here's what's happening with your store today.
          </p>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing || loading}
          className="btn-secondary !py-2 cursor-pointer"
          title="Force refresh (bypass cache)"
        >
          <svg
            className={`h-4 w-4 mr-1.5 ${refreshing ? "animate-spin" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data ? (
          <>
            <StatCard
              label="Total Revenue"
              value={formatPrice(data.totals.revenue)}
              tone="emerald"
              icon={<Icon path="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8V6m0 12v-2" />}
            />
            <StatCard
              label="Orders"
              value={data.totals.orders}
              tone="brand"
              icon={<Icon path="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 4h13" />}
            />
            <StatCard
              label="Customers"
              value={data.totals.users}
              tone="amber"
              icon={<Icon path="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-4a4 4 0 11-8 0 4 4 0 018 0z" />}
            />
            <StatCard
              label="Products"
              value={data.totals.products}
              tone="rose"
              icon={<Icon path="M20 7L12 3 4 7m16 0v10l-8 4m8-14l-8 4m0 0L4 7m8 4v10M4 7v10l8 4" />}
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <KpiSkeleton key={i} />)
        )}
      </div>

      {/* Attention tiles */}
      <div className="grid sm:grid-cols-2 gap-4">
        {data ? (
          <>
            <Link
              to="/admin/orders?status=processing"
              className="card p-5 hover:shadow-lg transition flex items-center gap-4 cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-brand-50 text-brand-600 grid place-items-center text-xl">
                📦
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">New orders to fulfill</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.totals.newOrders}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Paid · awaiting shipment
                </p>
              </div>
              <span className="text-slate-400">→</span>
            </Link>
            <Link
              to="/admin/products"
              className="card p-5 hover:shadow-lg transition flex items-center gap-4 cursor-pointer"
            >
              <div className="h-12 w-12 rounded-xl bg-rose-50 text-rose-600 grid place-items-center text-xl">
                ⚠️
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-500">Low stock items</p>
                <p className="text-2xl font-bold text-slate-900">
                  {data.totals.lowStock}
                </p>
              </div>
              <span className="text-slate-400">→</span>
            </Link>
          </>
        ) : (
          <>
            <TileSkeleton />
            <TileSkeleton />
          </>
        )}
      </div>

      {/* Recent orders */}
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Recent orders</h2>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 cursor-pointer"
          >
            View all →
          </Link>
        </div>
        {!data ? (
          <RecentOrdersSkeleton />
        ) : data.recentOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Order</th>
                  <th className="text-left font-semibold px-6 py-3">Customer</th>
                  <th className="text-left font-semibold px-6 py-3">Total</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-left font-semibold px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.recentOrders.map((o) => (
                  <tr key={o._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      #{o._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {o.user?.name || "—"}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {formatPrice(o.totalPrice)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 capitalize ${
                          statusStyles[o.status] || statusStyles.pending
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function KpiSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
          <div className="h-7 w-20 bg-slate-200 animate-pulse rounded" />
        </div>
        <div className="h-11 w-11 rounded-xl bg-slate-200 animate-pulse" />
      </div>
    </div>
  );
}

function TileSkeleton() {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="h-12 w-12 rounded-xl bg-slate-200 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-24 bg-slate-200 animate-pulse rounded" />
        <div className="h-7 w-12 bg-slate-200 animate-pulse rounded" />
      </div>
    </div>
  );
}

function RecentOrdersSkeleton() {
  return (
    <div className="p-6 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-3 w-20 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-32 bg-slate-200 animate-pulse rounded" />
          <div className="h-3 w-16 bg-slate-200 animate-pulse rounded" />
          <div className="h-5 w-20 bg-slate-200 animate-pulse rounded-full" />
          <div className="h-3 w-20 bg-slate-200 animate-pulse rounded ml-auto" />
        </div>
      ))}
    </div>
  );
}

function Icon({ path }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}
