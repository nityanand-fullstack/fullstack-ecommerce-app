import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getOrderApi, payOrderApi } from "../api/orderApi.js";
import Loader from "../components/Loader.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const statusStyles = {
  pending: "bg-amber-50 text-amber-700 ring-amber-200",
  processing: "bg-brand-50 text-brand-700 ring-brand-200",
  shipped: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
};

const stages = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getOrderApi(id);
      setOrder(res.data?.order);
    } catch (err) {
      toast.error(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePay = async () => {
    setPaying(true);
    try {
      await payOrderApi(id);
      toast.success("Payment successful");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <Loader label="Loading order..." />;
  if (!order) {
    return (
      <div className="grid place-items-center py-24">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-slate-900">Order not found</h1>
          <Link to="/orders" className="btn-primary mt-4 inline-flex">
            Back to my orders
          </Link>
        </div>
      </div>
    );
  }

  const currentStage = stages.indexOf(order.status);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        to="/orders"
        className="text-sm text-slate-500 hover:text-brand-600"
      >
        ← Back to my orders
      </Link>

      <div className="mt-4 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Order #{order._id.slice(-10).toUpperCase()}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Placed on {new Date(order.createdAt).toLocaleString()}
          </p>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 capitalize ${
            statusStyles[order.status] || statusStyles.pending
          }`}
        >
          {order.status}
        </span>
      </div>

      {order.status !== "cancelled" && (
        <div className="card p-6 mt-6">
          <div className="relative">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200" />
            <div
              className="absolute top-4 left-0 h-0.5 bg-brand-500 transition-all"
              style={{
                width: `${
                  currentStage < 0
                    ? 0
                    : (currentStage / (stages.length - 1)) * 100
                }%`,
              }}
            />
            <div className="relative grid grid-cols-4 gap-2">
              {stages.map((s, i) => {
                const reached = i <= currentStage;
                return (
                  <div key={s} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full grid place-items-center ring-4 ring-white text-xs font-bold ${
                        reached
                          ? "bg-brand-500 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {reached ? "✓" : i + 1}
                    </div>
                    <p
                      className={`mt-2 text-xs font-medium capitalize ${
                        reached ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {s}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-[1fr_340px] gap-6 mt-6">
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold text-slate-900 text-lg">Items</h2>
            <ul className="mt-4 divide-y divide-slate-200">
              {order.items.map((it) => (
                <li key={it.product} className="py-3 flex gap-4 items-center">
                  {it.image && (
                    <Link
                      to={`/products/${it.product}`}
                      className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0"
                    >
                      <img src={it.image} alt="" className="h-full w-full object-cover" />
                    </Link>
                  )}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/products/${it.product}`}
                      className="font-medium text-slate-900 hover:text-brand-600 line-clamp-2"
                    >
                      {it.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {formatPrice(it.price)} × {it.qty}
                    </p>
                  </div>
                  <p className="font-semibold text-slate-900">
                    {formatPrice(it.price * it.qty)}
                  </p>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-slate-900 text-lg">Shipping address</h2>
            <div className="mt-3 text-sm text-slate-700 space-y-0.5">
              <p className="font-medium text-slate-900">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold text-slate-900">Order summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-slate-600">Subtotal</dt><dd>{formatPrice(order.itemsPrice)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">Shipping</dt><dd>{order.shippingPrice === 0 ? "Free" : formatPrice(order.shippingPrice)}</dd></div>
              <div className="flex justify-between"><dt className="text-slate-600">Tax</dt><dd>{formatPrice(order.taxPrice)}</dd></div>
              <div className="flex justify-between border-t border-slate-200 pt-2">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-lg font-bold text-slate-900">{formatPrice(order.totalPrice)}</dd>
              </div>
            </dl>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-slate-900">Payment</h2>
            <p className="mt-2 text-sm text-slate-700">
              Method: <span className="font-medium">{order.paymentMethod}</span>
            </p>
            <p className="mt-1 text-sm">
              Status:{" "}
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
                  order.isPaid
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-amber-50 text-amber-700 ring-amber-200"
                }`}
              >
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </p>
            {order.isPaid && order.paidAt && (
              <p className="mt-1 text-xs text-slate-500">
                Paid on {new Date(order.paidAt).toLocaleString()}
              </p>
            )}
            {!order.isPaid && order.status !== "cancelled" && (
              <button
                onClick={handlePay}
                disabled={paying}
                className="btn-primary w-full mt-4"
              >
                {paying ? "Processing..." : "Pay now (mock)"}
              </button>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
