import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { placeOrderApi } from "../api/orderApi.js";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function Checkout() {
  const { user } = useAuth();
  const { items, count, subtotal, refresh } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    postalCode: user?.address?.postalCode || "",
    country: user?.address?.country || "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Required";
    if (!form.phone.trim()) e.phone = "Required";
    else if (!/^\+?\d{7,15}$/.test(form.phone.trim())) e.phone = "Invalid phone";
    if (!form.street.trim()) e.street = "Required";
    if (!form.city.trim()) e.city = "Required";
    if (!form.state.trim()) e.state = "Required";
    if (!form.postalCode.trim()) e.postalCode = "Required";
    if (!form.country.trim()) e.country = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await placeOrderApi({
        shippingAddress: {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          street: form.street.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
          country: form.country.trim(),
        },
        paymentMethod,
      });
      toast.success("Order placed successfully");
      await refresh();
      navigate(`/orders/${res.data.order._id}/success`, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not place order");
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="card p-12">
          <h1 className="text-2xl font-bold text-slate-900">Nothing to checkout</h1>
          <p className="text-slate-500 mt-2">Your cart is empty.</p>
          <Link to="/products" className="btn-primary mt-6 inline-flex">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const shipping = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
        Checkout
      </h1>
      <p className="text-slate-500 text-sm mb-8">
        {count} {count === 1 ? "item" : "items"} · Review and place your order.
      </p>

      <form
        onSubmit={onSubmit}
        className="grid lg:grid-cols-[1fr_380px] gap-8"
        noValidate
      >
        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-semibold text-slate-900 text-lg">
              Shipping address
            </h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="label">Full name</label>
                <input
                  name="fullName" value={form.fullName} onChange={onChange}
                  className="input"
                />
                {errors.fullName && <p className="field-error">{errors.fullName}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Phone</label>
                <input
                  name="phone" value={form.phone} onChange={onChange}
                  className="input" placeholder="+919876543210"
                />
                {errors.phone && <p className="field-error">{errors.phone}</p>}
              </div>
              <div className="sm:col-span-2">
                <label className="label">Street address</label>
                <input
                  name="street" value={form.street} onChange={onChange}
                  className="input"
                />
                {errors.street && <p className="field-error">{errors.street}</p>}
              </div>
              <div>
                <label className="label">City</label>
                <input name="city" value={form.city} onChange={onChange} className="input" />
                {errors.city && <p className="field-error">{errors.city}</p>}
              </div>
              <div>
                <label className="label">State</label>
                <input name="state" value={form.state} onChange={onChange} className="input" />
                {errors.state && <p className="field-error">{errors.state}</p>}
              </div>
              <div>
                <label className="label">Postal code</label>
                <input name="postalCode" value={form.postalCode} onChange={onChange} className="input" />
                {errors.postalCode && <p className="field-error">{errors.postalCode}</p>}
              </div>
              <div>
                <label className="label">Country</label>
                <input name="country" value={form.country} onChange={onChange} className="input" />
                {errors.country && <p className="field-error">{errors.country}</p>}
              </div>
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-slate-900 text-lg">Payment method</h2>
            <div className="mt-4 space-y-2">
              {[
                { id: "COD", label: "Cash on Delivery", desc: "Pay when your order arrives" },
                { id: "Card", label: "Credit / Debit Card", desc: "Mock — pay after placing order" },
                { id: "UPI", label: "UPI", desc: "Mock — pay after placing order" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-3 rounded-xl ring-1 cursor-pointer transition ${
                    paymentMethod === opt.id
                      ? "ring-brand-500 bg-brand-50/40"
                      : "ring-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio" name="paymentMethod" value={opt.id}
                    checked={paymentMethod === opt.id}
                    onChange={() => setPaymentMethod(opt.id)}
                    className="mt-1 text-brand-500 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{opt.label}</p>
                    <p className="text-xs text-slate-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </section>

          <section className="card p-6">
            <h2 className="font-semibold text-slate-900 text-lg">Order items</h2>
            <ul className="mt-4 divide-y divide-slate-200">
              {items.map((it) => {
                const p = it.product;
                if (!p) return null;
                const unit =
                  p.discountPrice && p.discountPrice < p.price
                    ? p.discountPrice
                    : p.price;
                return (
                  <li key={p._id} className="py-3 flex gap-4 items-center">
                    <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200 shrink-0">
                      <img src={p.images?.[0]} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 line-clamp-1">{p.name}</p>
                      <p className="text-xs text-slate-500">
                        {formatPrice(unit)} × {it.qty}
                      </p>
                    </div>
                    <p className="font-semibold text-slate-900">
                      {formatPrice(unit * it.qty)}
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside>
          <div className="card p-6 sticky top-20">
            <h2 className="font-semibold text-slate-900 text-lg">Order summary</h2>
            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-600">Subtotal</dt>
                <dd className="font-medium text-slate-900">{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Shipping</dt>
                <dd className="font-medium text-slate-900">
                  {shipping === 0 ? "Free" : formatPrice(shipping)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-600">Tax (5%)</dt>
                <dd className="font-medium text-slate-900">{formatPrice(tax)}</dd>
              </div>
              <div className="border-t border-slate-200 pt-3 flex justify-between">
                <dt className="font-semibold text-slate-900">Total</dt>
                <dd className="text-xl font-bold text-slate-900">
                  {formatPrice(total)}
                </dd>
              </div>
            </dl>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full mt-6 !py-3"
            >
              {submitting ? "Placing order..." : `Place order · ${formatPrice(total)}`}
            </button>
            <Link
              to="/cart"
              className="block text-center text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3"
            >
              Back to cart
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}
