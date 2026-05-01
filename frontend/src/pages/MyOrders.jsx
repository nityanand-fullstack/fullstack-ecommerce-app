import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { myOrdersApi } from "../api/orderApi.js";
import Loader from "../components/Loader.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-brand-50 text-brand-700 ring-brand-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await myOrdersApi();
        if (alive) setOrders(res.data?.orders || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load orders");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loader label="Loading orders..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900">
        My orders
      </h1>
      <p className="text-slate-500 text-sm mt-1 mb-8">
        {orders.length} {orders.length === 1 ? "order" : "orders"}
      </p>

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="h-20 w-20 mx-auto rounded-full bg-brand-50 grid place-items-center text-4xl mb-4">
            📦
          </div>
          <h2 className="text-xl font-semibold text-slate-900">No orders yet</h2>
          <p className="text-slate-500 mt-1">
            When you place your first order, it'll show up here.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link to="/products" className="btn-primary">
              Start shopping
            </Link>
            <Link to="/categories" className="btn-secondary">
              Browse categories
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="block card p-5 hover:shadow-lg hover:ring-brand-500/30 transition"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs text-slate-500">
                    Order #{o._id.slice(-10).toUpperCase()}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Placed on {new Date(o.createdAt).toLocaleDateString()}
                  </p>
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 capitalize ${
                        statusStyles[o.status] || statusStyles.pending
                      }`}
                    >
                      {o.status}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                        o.isPaid
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-50 text-slate-600 ring-slate-200"
                      }`}
                    >
                      {o.isPaid ? "Paid" : "Unpaid"}
                    </span>
                    <span className="text-xs text-slate-500">
                      {o.paymentMethod}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">
                    {o.items.length} {o.items.length === 1 ? "item" : "items"}
                  </p>
                  <p className="text-lg font-bold text-slate-900 mt-1">
                    {formatPrice(o.totalPrice)}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 overflow-x-auto">
                {o.items.slice(0, 5).map((it, i) => (
                  <div
                    key={i}
                    className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0"
                  >
                    {it.image ? (
                      <img src={it.image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid place-items-center h-full text-slate-400 text-xs">
                        {it.name?.charAt(0)}
                      </div>
                    )}
                  </div>
                ))}
                {o.items.length > 5 && (
                  <div className="h-12 w-12 rounded-lg bg-slate-100 grid place-items-center text-xs font-semibold text-slate-600 shrink-0">
                    +{o.items.length - 5}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
