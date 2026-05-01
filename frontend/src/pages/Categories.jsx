import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { listCategoriesApi } from "../api/categoryApi.js";
import Loader from "../components/Loader.jsx";

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await listCategoriesApi();
        if (alive) setCategories(res.data?.categories || []);
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load categories");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest">
          Browse
        </p>
        <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
          Shop by category
        </h1>
        <p className="mt-2 text-slate-600 max-w-xl">
          Pick a category to explore our handpicked selection.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-200 animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="card p-12 text-center text-slate-500">
          <div className="h-20 w-20 mx-auto rounded-full bg-brand-50 grid place-items-center text-4xl mb-3">
            📂
          </div>
          <p className="text-lg font-semibold text-slate-900">No categories yet</p>
          <p className="text-sm text-slate-500 mt-1">Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/products?category=${c.slug}`}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
            >
              <img
                src={c.image || "https://via.placeholder.com/600x800?text=Category"}
                alt={c.name}
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <p className="text-lg sm:text-xl font-bold">{c.name}</p>
                {c.description && (
                  <p className="text-xs sm:text-sm text-white/80 line-clamp-2">
                    {c.description}
                  </p>
                )}
              </div>
              <span className="absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-white/95 backdrop-blur text-slate-900 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
