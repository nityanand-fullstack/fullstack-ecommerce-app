import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { getProductApi } from "../api/productApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import Loader from "../components/Loader.jsx";
import ProductReviews from "../components/ProductReviews.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setActiveImage(0);
    setQty(1);
    (async () => {
      try {
        const res = await getProductApi(id);
        if (alive) setProduct(res.data?.product);
      } catch (err) {
        toast.error(err.response?.data?.message || "Product not found");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <Loader label="Loading product..." />;

  if (!product) {
    return (
      <div className="grid place-items-center py-24 text-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Product not found
          </h1>
          <Link to="/products" className="mt-4 inline-block btn-primary">
            Browse products
          </Link>
        </div>
      </div>
    );
  }

  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPct = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  const inStock = product.stock > 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast("Please sign in to add items to your cart", { icon: "🔐" });
      navigate("/login", { state: { from: { pathname: `/products/${id}` } } });
      return;
    }
    setAdding(true);
    try {
      await addToCart(product._id, qty);
      toast.success(`Added ${qty} × ${product.name} to cart`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <nav className="text-sm text-slate-500 mb-6">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span className="mx-2">/</span>
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        {product.category?.slug && (
          <>
            <span className="mx-2">/</span>
            <Link
              to={`/products?category=${product.category.slug}`}
              className="hover:text-brand-600"
            >
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden ring-1 ring-slate-200">
            <img
              src={product.images?.[activeImage] || "https://via.placeholder.com/800?text=Product"}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="mt-4 grid grid-cols-5 gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square rounded-lg overflow-hidden ring-2 transition ${
                    activeImage === i ? "ring-brand-500" : "ring-transparent hover:ring-slate-300"
                  }`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.brand && (
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
              {product.brand}
            </p>
          )}
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            {product.name}
          </h1>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex items-center gap-1 text-amber-500">
              <span>★</span>
              <span className="font-semibold text-slate-800">
                {product.rating?.toFixed(1) || "0.0"}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-500">
              {product.numReviews || 0} reviews
            </span>
            <span className="text-slate-300">|</span>
            <span
              className={`text-sm font-semibold ${
                inStock ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              {inStock ? `In stock (${product.stock})` : "Out of stock"}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-slate-900">
              {formatPrice(finalPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-slate-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm font-bold text-rose-600">
                  -{discountPct}% OFF
                </span>
              </>
            )}
          </div>

          {product.description && (
            <p className="mt-6 text-slate-600 leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg ring-1 ring-slate-300 overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="px-3 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={qty <= 1}
              >
                −
              </button>
              <span className="px-4 py-2.5 font-semibold text-slate-900 min-w-[3ch] text-center">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(product.stock || 99, q + 1))}
                className="px-3 py-2.5 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                disabled={qty >= (product.stock || 99)}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!inStock || adding}
              className="btn-primary !px-6 !py-3 flex-1 sm:flex-none"
            >
              {adding ? "Adding..." : inStock ? "Add to cart" : "Out of stock"}
            </button>
            <button
              onClick={() => toast("Wishlist coming soon")}
              className="btn-secondary !px-4 !py-3"
              aria-label="Add to wishlist"
            >
              ♡
            </button>
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-y-3 gap-x-6 text-sm border-t border-slate-200 pt-6">
            <dt className="text-slate-500">Category</dt>
            <dd className="text-slate-800 font-medium">
              {product.category?.name || "—"}
            </dd>
            {product.brand && (
              <>
                <dt className="text-slate-500">Brand</dt>
                <dd className="text-slate-800 font-medium">{product.brand}</dd>
              </>
            )}
            <dt className="text-slate-500">SKU</dt>
            <dd className="text-slate-800 font-medium font-mono text-xs">
              {product._id?.slice(-8).toUpperCase()}
            </dd>
          </dl>
        </div>
      </div>

      <ProductReviews
        productId={product._id}
        onChange={() => {
          getProductApi(id)
            .then((res) => setProduct(res.data?.product))
            .catch(() => {});
        }}
      />
    </div>
  );
}
