import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { listCategoriesApi } from "../api/categoryApi.js";
import { listProductsApi } from "../api/productApi.js";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

const HERO_BG =
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2000&q=80";
const SALE_BG =
  "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80";
const PROMO_BG =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80";

const faqs = [
  {
    q: "How long does delivery take?",
    a: "Standard shipping takes 3–5 business days. Express delivery is available at checkout for next-day delivery in select cities.",
  },
  {
    q: "What is your return policy?",
    a: "We offer hassle-free 7-day returns on most products. Items must be unused and in original packaging. Refunds are processed within 5 business days.",
  },
  {
    q: "Do you offer Cash on Delivery (COD)?",
    a: "Yes, COD is available on all orders below ₹50,000. We also accept UPI, credit/debit cards, and net banking.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, you'll get an email with a tracking link. You can also view live status anytime from your 'My Orders' page.",
  },
  {
    q: "Are the products genuine?",
    a: "Absolutely. We source directly from authorized brands and manufacturers, and every product comes with a warranty where applicable.",
  },
  {
    q: "How can I contact support?",
    a: "Reach us 24/7 via the contact form, email us at support@ecomapp.com, or chat with our team between 9 AM and 9 PM IST.",
  },
];

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [c, p] = await Promise.all([
          listCategoriesApi(),
          listProductsApi({ limit: 8, sort: "rating-desc" }),
        ]);
        if (!alive) return;
        setCategories(c.data?.categories || []);
        setProducts(p.data?.products || []);
      } catch (err) {
        if (alive) toast.error(err.response?.data?.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      toast("Please sign in to add to cart", { icon: "🔐" });
      navigate("/login");
      return;
    }
    setAdding(product._id);
    try {
      await addToCart(product._id, 1);
      toast.success("Added to cart");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not add to cart");
    } finally {
      setAdding(null);
    }
  };

  const requireLogin = (path) => {
    if (!isAuthenticated) {
      toast("Please sign in to continue", { icon: "🔐" });
      navigate("/login");
      return;
    }
    navigate(path);
  };

  return (
    <div className="bg-slate-50">
      {/* Top promo strip */}
      <div className="bg-slate-900 text-white text-center text-xs sm:text-sm py-2 px-4">
        <span className="hidden sm:inline">🎉 </span>
        Free shipping on orders above ₹999 ·{" "}
        <span className="font-semibold underline">Use code FIRST10 for 10% off</span>
      </div>

      {/* Welcome strip for logged-in users */}
      {isAuthenticated && user?.role !== "admin" && (
        <div className="bg-gradient-to-r from-brand-50 via-white to-amber-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-lg">👋</span>
              <span className="text-slate-700">
                Welcome back,{" "}
                <span className="font-semibold text-slate-900">
                  {user?.name?.split(" ")[0]}
                </span>
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/orders"
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-300 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                📦 My orders
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center gap-1.5 rounded-full bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-brand-300 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                🛒 My cart
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand-500 text-white hover:bg-brand-600 px-3 py-1.5 text-xs font-semibold transition cursor-pointer"
              >
                Browse categories →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* HERO with cover image */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/60 to-slate-900/30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 text-white">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 backdrop-blur ring-1 ring-white/20 px-3 py-1.5 text-xs font-semibold">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            New collection 2026
          </span>
          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight max-w-3xl leading-[1.05]">
            Discover{" "}
            <span className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              premium products
            </span>{" "}
            curated just for you
          </h1>
          <p className="mt-5 text-base sm:text-lg text-slate-200 max-w-xl">
            Shop the latest in fashion, electronics, beauty and home — top brands, exclusive deals, fast delivery.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-6 py-3 text-sm font-bold shadow-xl hover:bg-amber-50 transition cursor-pointer"
            >
              Shop now
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center rounded-lg border-2 border-white/40 hover:border-white text-white px-6 py-3 text-sm font-semibold backdrop-blur bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              Browse categories
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 max-w-md">
            <Stat value="50K+" label="Happy customers" />
            <Stat value="2,500+" label="Products" />
            <Stat value="4.9★" label="Avg rating" />
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Trust icon="🚚" title="Free shipping" text="On orders over ₹999" />
          <Trust icon="↩️" title="7-day returns" text="Easy & hassle-free" />
          <Trust icon="🔒" title="Secure payment" text="100% protected" />
          <Trust icon="💬" title="24/7 support" text="We've got your back" />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <SectionHeader
          eyebrow="Browse"
          title="Shop by category"
          link={{ to: "/categories", label: "View all" }}
        />
        {loading ? (
          <CategorySkeleton />
        ) : categories.length === 0 ? (
          <EmptyState message="No categories yet." />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c.slug}`}
                className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <img
                  src={
                    c.image ||
                    "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=900&q=80"
                  }
                  alt={c.name}
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <p className="text-lg sm:text-xl font-bold">{c.name}</p>
                  {c.description && (
                    <p className="text-xs sm:text-sm text-white/80 line-clamp-2 mt-0.5">
                      {c.description}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* SALE BANNER with cover */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 lg:mb-16">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${SALE_BG})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/90 via-rose-500/70 to-amber-500/40" />
          <div className="relative px-6 sm:px-12 lg:px-16 py-12 lg:py-16 max-w-2xl text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-amber-200">
              Mega sale · This week only
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Up to 50% off bestsellers
            </h2>
            <p className="mt-3 text-rose-50 text-base sm:text-lg max-w-lg">
              Hand-picked deals on the products you love. Limited stock — grab yours before they're gone.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                to="/products?sort=price-asc"
                className="inline-flex items-center justify-center rounded-lg bg-white text-slate-900 px-6 py-3 text-sm font-bold shadow-lg hover:bg-rose-50 transition cursor-pointer"
              >
                Shop the sale →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="bg-white border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionHeader
            eyebrow="Bestsellers"
            title="Featured products"
            link={{ to: "/products", label: "View all products" }}
          />
          {loading ? (
            <ProductSkeleton />
          ) : products.length === 0 ? (
            <EmptyState message="No products yet. Check back soon!" />
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  product={p}
                  onAdd={() => handleAddToCart(p)}
                  busy={adding === p._id}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <SectionHeader
          eyebrow="Reviews"
          title="What our customers say"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              name: "Priya Sharma",
              role: "Verified buyer",
              text: "Fast delivery and the quality is genuinely top-notch. The packaging was beautiful too. Will shop again!",
              rating: 5,
            },
            {
              name: "Rohit Verma",
              role: "Verified buyer",
              text: "Great prices and the return process was smooth. Customer support replied within minutes. Highly recommend.",
              rating: 5,
            },
            {
              name: "Ananya Iyer",
              role: "Verified buyer",
              text: "Loved the curation. Found exactly what I was looking for and the deals were amazing. 10/10.",
              rating: 5,
            },
          ].map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl ring-1 ring-slate-200 p-6 shadow-sm hover:shadow-lg transition"
            >
              <div className="text-amber-500 text-sm">{"★".repeat(t.rating)}</div>
              <p className="mt-3 text-slate-700 leading-relaxed">"{t.text}"</p>
              <div className="mt-5 flex items-center gap-3">
                <div className="h-10 w-10 grid place-items-center rounded-full bg-gradient-to-br from-brand-500 to-indigo-600 text-white font-bold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white border-y border-slate-200/70">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <SectionHeader
            eyebrow="Help center"
            title="Frequently asked questions"
            center
          />
          <div className="space-y-3">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-slate-500">
            Still have a question?{" "}
            <a href="#" className="font-semibold text-brand-600 hover:text-brand-700 cursor-pointer">
              Contact our support team →
            </a>
          </p>
        </div>
      </section>

      {/* MEMBER PROMO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${PROMO_BG})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/85 to-slate-900/40" />
          <div className="relative px-6 sm:px-12 lg:px-16 py-14 lg:py-20 max-w-2xl text-white">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-300">
              Member exclusive
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              Get an extra 15% off your first order
            </h2>
            <p className="mt-4 text-slate-300 text-base sm:text-lg max-w-lg">
              Sign up today and unlock member-only pricing, early access to drops, and free shipping on every order.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => requireLogin("/products")}
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-sm font-bold text-slate-900 hover:bg-slate-100 transition shadow-lg cursor-pointer"
              >
                {isAuthenticated ? "Shop now" : "Claim offer"}
              </button>
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-lg border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition cursor-pointer"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function SectionHeader({ eyebrow, title, link, center = false }) {
  return (
    <div
      className={`flex items-end justify-between flex-wrap gap-4 mb-8 ${
        center ? "text-center justify-center" : ""
      }`}
    >
      <div className={center ? "w-full" : ""}>
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest">
          {eyebrow}
        </p>
        <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {title}
        </h2>
      </div>
      {link && !center && (
        <Link
          to={link.to}
          className="text-sm font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1 cursor-pointer"
        >
          {link.label} →
        </Link>
      )}
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl ring-1 transition ${
        open ? "bg-brand-50/40 ring-brand-200" : "bg-white ring-slate-200 hover:ring-brand-200"
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left cursor-pointer"
      >
        <span className="font-semibold text-slate-900">{q}</span>
        <span
          className={`h-8 w-8 grid place-items-center rounded-full bg-white ring-1 ring-slate-200 transition ${
            open ? "rotate-45 text-brand-600" : "text-slate-500"
          }`}
        >
          +
        </span>
      </button>
      {open && (
        <div className="px-5 pb-5 -mt-1 text-slate-700 text-sm leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, onAdd, busy }) {
  const hasDiscount = product.discountPrice && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? product.discountPrice : product.price;
  const inStock = product.stock > 0;

  return (
    <article className="group bg-white rounded-2xl ring-1 ring-slate-200/70 overflow-hidden hover:ring-brand-500/40 hover:shadow-xl transition-all duration-300 flex flex-col">
      <Link to={`/products/${product.slug || product._id}`} className="block cursor-pointer">
        <div className="relative aspect-square bg-slate-100 overflow-hidden">
          <img
            src={product.images?.[0] || "https://via.placeholder.com/600?text=Product"}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
            loading="lazy"
          />
          {hasDiscount && (
            <span className="absolute top-3 left-3 rounded-full bg-rose-500 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
            </span>
          )}
          {!inStock && (
            <div className="absolute inset-0 bg-white/70 grid place-items-center">
              <span className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-bold">
                Out of stock
              </span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/products/${product.slug || product._id}`} className="cursor-pointer">
          <p className="text-xs text-slate-500">{product.category?.name || ""}</p>
          <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2 leading-snug min-h-[2.5rem] hover:text-brand-600 transition">
            {product.name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-1 text-amber-500 text-xs">
          <span>★</span>
          <span className="font-semibold text-slate-700">{(product.rating || 0).toFixed(1)}</span>
          <span className="text-slate-400">({product.numReviews || 0})</span>
        </div>
        <div className="mt-3 flex items-baseline justify-between gap-2">
          <div>
            <span className="text-lg font-bold text-slate-900">{formatPrice(finalPrice)}</span>
            {hasDiscount && (
              <span className="ml-2 text-sm text-slate-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onAdd}
          disabled={!inStock || busy}
          className="btn-primary mt-3 w-full !py-2 !text-xs cursor-pointer disabled:cursor-not-allowed"
        >
          {busy ? "Adding..." : inStock ? "Add to cart" : "Out of stock"}
        </button>
      </div>
    </article>
  );
}

function CategorySkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-200 animate-pulse" />
      ))}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-200 overflow-hidden">
          <div className="aspect-square bg-slate-200 animate-pulse" />
          <div className="p-4 space-y-2">
            <div className="h-3 w-1/3 bg-slate-200 animate-pulse rounded" />
            <div className="h-4 w-3/4 bg-slate-200 animate-pulse rounded" />
            <div className="h-5 w-1/2 bg-slate-200 animate-pulse rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="card p-12 text-center text-slate-500">
      <div className="text-4xl mb-2">📦</div>
      <p>{message}</p>
    </div>
  );
}

function Trust({ icon, title, text }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 grid place-items-center rounded-xl bg-brand-50 text-2xl shrink-0">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-slate-900 text-sm">{title}</p>
        <p className="text-xs text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <p className="text-2xl sm:text-3xl font-bold tracking-tight">{value}</p>
      <p className="text-xs sm:text-sm text-slate-300 mt-1">{label}</p>
    </div>
  );
}
