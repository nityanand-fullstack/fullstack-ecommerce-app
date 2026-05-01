import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { listProductsApi } from "../api/productApi.js";
import { listCategoriesApi } from "../api/categoryApi.js";
import Loader from "../components/Loader.jsx";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "rating-desc", label: "Top rated" },
];

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);
  const [data, setData] = useState({ products: [], page: 1, pages: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");

  const params = useMemo(() => {
    const p = {};
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "newest";
    const page = searchParams.get("page") || 1;
    if (category) p.category = category;
    if (search) p.search = search;
    if (sort) p.sort = sort;
    p.page = page;
    p.limit = 12;
    return p;
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await listCategoriesApi();
        if (alive) setCategories(res.data?.categories || []);
      } catch {
        // silent
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    (async () => {
      try {
        const res = await listProductsApi(params);
        if (alive) setData(res.data);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load products");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [params]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    updateParam("search", searchInput.trim());
  };

  const activeCategory = searchParams.get("category");
  const activeSort = searchParams.get("sort") || "newest";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          {activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name || "Products"
            : "All products"}
        </h1>
        <p className="text-slate-600 mt-1">
          {data.total} {data.total === 1 ? "item" : "items"}
        </p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="space-y-6">
          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Search</h3>
            <form onSubmit={onSearchSubmit}>
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                className="input"
              />
            </form>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Categories</h3>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={() => updateParam("category", "")}
                  className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition ${
                    !activeCategory
                      ? "bg-brand-50 text-brand-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  All categories
                </button>
              </li>
              {categories.map((c) => (
                <li key={c._id}>
                  <button
                    onClick={() => updateParam("category", c.slug)}
                    className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition ${
                      activeCategory === c.slug
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-5">
            <h3 className="font-semibold text-slate-900 mb-3">Sort by</h3>
            <select
              value={activeSort}
              onChange={(e) => updateParam("sort", e.target.value)}
              className="input"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </aside>

        <div>
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
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
          ) : data.products.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="h-20 w-20 mx-auto rounded-full bg-brand-50 grid place-items-center text-4xl mb-3">
                🔎
              </div>
              <p className="text-lg font-semibold text-slate-900">No products found</p>
              <p className="text-sm text-slate-500 mt-1">Try clearing filters or searching for something else.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {data.products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {data.pages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => updateParam("page", n)}
                      className={`h-9 min-w-9 px-3 rounded-md text-sm font-semibold transition ${
                        n === data.page
                          ? "bg-brand-500 text-white"
                          : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const hasDiscount =
    product.discountPrice && product.discountPrice < product.price;
  const finalPrice = hasDiscount ? product.discountPrice : product.price;

  return (
    <Link
      to={`/products/${product.slug || product._id}`}
      className="group bg-white rounded-2xl ring-1 ring-slate-200/70 overflow-hidden hover:ring-brand-500/40 hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
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
      </div>
      <div className="p-4">
        <p className="text-xs text-slate-500">{product.category?.name}</p>
        <h3 className="mt-1 font-semibold text-slate-900 line-clamp-2 leading-snug">
          {product.name}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-amber-500 text-xs">
          <span>★</span>
          <span className="font-semibold text-slate-700">{product.rating?.toFixed(1) || "0.0"}</span>
          <span className="text-slate-400">({product.numReviews || 0})</span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-slate-900">
            {formatPrice(finalPrice)}
          </span>
          {hasDiscount && (
            <span className="text-sm text-slate-400 line-through">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
