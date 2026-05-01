import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext.jsx";
import Loader from "../components/Loader.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function Cart() {
  const { items, count, subtotal, loading, updateQty, removeItem, clear } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState({});
  const [clearing, setClearing] = useState(false);

  const setItemBusy = (id, v) => setBusy((b) => ({ ...b, [id]: v }));

  const handleQty = async (productId, newQty) => {
    if (newQty < 1) return;
    setItemBusy(productId, true);
    try {
      await updateQty(productId, newQty);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setItemBusy(productId, false);
    }
  };

  const handleRemove = async (productId) => {
    setItemBusy(productId, true);
    try {
      await removeItem(productId);
      toast.success("Removed from cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Remove failed");
    } finally {
      setItemBusy(productId, false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    try {
      await clear();
      toast.success("Cart cleared");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to clear cart");
    } finally {
      setClearing(false);
    }
  };

  if (loading && items.length === 0) {
    return <Loader label="Loading cart..." />;
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="card p-12">
          <div className="h-20 w-20 mx-auto rounded-full bg-brand-50 grid place-items-center text-4xl mb-4">
            🛒
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
          <p className="text-slate-500 mt-2">
            Browse our catalog and add something you love.
          </p>
          <div className="mt-6 flex justify-center gap-3 flex-wrap">
            <Link to="/products" className="btn-primary">
              Browse products
            </Link>
            <Link to="/categories" className="btn-secondary">
              Shop by category
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const shipping = subtotal > 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Shopping cart
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {count} {count === 1 ? "item" : "items"} in your cart
          </p>
        </div>
        {items.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearing}
            className="text-sm font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Clear cart"}
          </button>
        )}
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div className="space-y-3">
          {items.map((it) => {
            const p = it.product;
            if (!p) return null;
            const unit =
              p.discountPrice && p.discountPrice < p.price
                ? p.discountPrice
                : p.price;
            const lineTotal = unit * it.qty;
            const isBusy = busy[p._id];
            const maxQty = p.stock || 99;

            return (
              <div key={p._id} className="card p-4 flex gap-4 items-center">
                <Link
                  to={`/products/${p.slug || p._id}`}
                  className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 rounded-xl overflow-hidden bg-slate-100 ring-1 ring-slate-200"
                >
                  <img
                    src={p.images?.[0] || "https://via.placeholder.com/200"}
                    alt={p.name}
                    className="h-full w-full object-cover"
                  />
                </Link>

                <div className="flex-1 min-w-0">
                  <Link
                    to={`/products/${p.slug || p._id}`}
                    className="font-semibold text-slate-900 hover:text-brand-600 line-clamp-2"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatPrice(unit)} each
                  </p>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <div className="flex items-center rounded-lg ring-1 ring-slate-300 overflow-hidden">
                      <button
                        onClick={() => handleQty(p._id, it.qty - 1)}
                        disabled={isBusy || it.qty <= 1}
                        className="px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        −
                      </button>
                      <span className="px-3 py-1.5 font-semibold text-slate-900 min-w-[2.5ch] text-center text-sm">
                        {it.qty}
                      </span>
                      <button
                        onClick={() => handleQty(p._id, it.qty + 1)}
                        disabled={isBusy || it.qty >= maxQty}
                        className="px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemove(p._id)}
                      disabled={isBusy}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-lg font-bold text-slate-900">
                    {formatPrice(lineTotal)}
                  </p>
                </div>
              </div>
            );
          })}
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

            {shipping > 0 && (
              <p className="mt-4 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                Add {formatPrice(999 - subtotal)} more for free shipping.
              </p>
            )}

            <button
              onClick={() => navigate("/checkout")}
              className="btn-primary w-full mt-6 !py-3"
            >
              Proceed to checkout
            </button>
            <Link
              to="/products"
              className="block text-center text-sm font-semibold text-brand-600 hover:text-brand-700 mt-3"
            >
              Continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
