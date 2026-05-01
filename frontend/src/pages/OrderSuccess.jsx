import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderApi } from "../api/orderApi.js";
import Loader from "../components/Loader.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await getOrderApi(id);
        if (alive) setOrder(res.data?.order);
      } catch (err) {
        toast.error(err.response?.data?.message || "Order not found");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading order..." />;
  if (!order) {
    return (
      <div className="grid place-items-center py-24">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Order not found</h1>
          <Link to="/orders" className="btn-primary mt-4 inline-flex">
            View my orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="card overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-8 py-10 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-white/20 grid place-items-center text-3xl ring-4 ring-white/30">
            ✓
          </div>
          <h1 className="mt-4 text-3xl font-bold">Order placed!</h1>
          <p className="mt-2 text-emerald-50">
            Thanks for your order. A confirmation has been saved to your account.
          </p>
          <p className="mt-4 inline-block bg-white/20 backdrop-blur rounded-full px-4 py-1.5 text-sm font-mono">
            #{order._id.slice(-10).toUpperCase()}
          </p>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid sm:grid-cols-2 gap-6 text-sm">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Shipping to
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {order.shippingAddress.fullName}
              </p>
              <p className="text-slate-600">{order.shippingAddress.phone}</p>
              <p className="text-slate-600 mt-1">
                {order.shippingAddress.street}, {order.shippingAddress.city},{" "}
                {order.shippingAddress.state} {order.shippingAddress.postalCode},{" "}
                {order.shippingAddress.country}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
                Payment
              </p>
              <p className="mt-1 font-medium text-slate-900">
                {order.paymentMethod}{" "}
                <span
                  className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                    order.isPaid
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      : "bg-amber-50 text-amber-700 ring-amber-200"
                  }`}
                >
                  {order.isPaid ? "Paid" : "Pending"}
                </span>
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500 font-semibold mt-4">
                Status
              </p>
              <p className="mt-1 font-medium text-slate-900 capitalize">{order.status}</p>
              <p className="text-xs text-slate-500 mt-1">
                Placed {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <h2 className="font-semibold text-slate-900 mb-3">Items</h2>
            <ul className="divide-y divide-slate-200">
              {order.items.map((it) => (
                <li key={it.product} className="py-3 flex gap-4 items-center">
                  {it.image && (
                    <div className="h-14 w-14 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                      <img src={it.image} alt="" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 line-clamp-1">{it.name}</p>
                    <p className="text-xs text-slate-500">
                      {formatPrice(it.price)} × {it.qty}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatPrice(it.price * it.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <dl className="border-t border-slate-200 pt-6 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>{formatPrice(order.itemsPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd>{order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-600">Tax</dt><dd>{formatPrice(order.taxPrice)}</dd></div>
            <div className="flex justify-between border-t border-slate-200 pt-2">
              <dt className="font-semibold text-slate-900">Total</dt>
              <dd className="text-lg font-bold text-slate-900">{formatPrice(order.totalPrice)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link to="/orders" className="btn-primary">View my orders</Link>
            <Link to="/products" className="btn-secondary">Continue shopping</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
