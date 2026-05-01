import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { listProductsApi, deleteProductApi } from "../../api/productApi.js";
import Loader from "../../components/Loader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";

const formatPrice = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState({ open: false, product: null });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listProductsApi({ all: "true", limit: 60 });
      setProducts(res.data?.products || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || "").toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async () => {
    if (!confirm.product) return;
    setDeleting(true);
    try {
      await deleteProductApi(confirm.product._id);
      toast.success("Product deleted");
      setConfirm({ open: false, product: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const stockStatus = (p) =>
    p.stock === 0
      ? { label: "Out of stock", style: "bg-rose-50 text-rose-700 ring-rose-200" }
      : p.stock < 15
      ? { label: "Low stock", style: "bg-amber-50 text-amber-700 ring-amber-200" }
      : { label: "Active", style: "bg-emerald-50 text-emerald-700 ring-emerald-200" };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your catalog and inventory.
          </p>
        </div>
        <Link to="/admin/products/new" className="btn-primary">
          <span className="mr-1.5">+</span> Add product
        </Link>
      </div>

      <div className="card p-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or brand"
          className="input"
        />
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading products..." />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            {products.length === 0
              ? "No products yet. Click 'Add product' to create one."
              : "No products match your search."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Product</th>
                  <th className="text-left font-semibold px-6 py-3">Category</th>
                  <th className="text-left font-semibold px-6 py-3">Price</th>
                  <th className="text-left font-semibold px-6 py-3">Stock</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-right font-semibold px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((p) => {
                  const s = stockStatus(p);
                  return (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="grid place-items-center h-full text-slate-400 font-bold">
                                {p.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-1">{p.name}</p>
                            <p className="text-xs text-slate-500">{p.brand || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{p.category?.name || "—"}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <div>
                          <p className="font-medium">
                            {formatPrice(p.discountPrice || p.price)}
                          </p>
                          {p.discountPrice && p.discountPrice < p.price && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatPrice(p.price)}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700">{p.stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${s.style}`}
                        >
                          {s.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          to={`/admin/products/${p._id}/edit`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 mr-3"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setConfirm({ open: true, product: p })}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        title="Delete this product?"
        message={
          confirm.product
            ? `"${confirm.product.name}" will be permanently removed.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, product: null })}
      />
    </div>
  );
}
