import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  createProductApi,
  getProductApi,
  updateProductApi,
} from "../../api/productApi.js";
import { listCategoriesApi } from "../../api/categoryApi.js";
import Loader from "../../components/Loader.jsx";
import ImageUploader from "../components/ImageUploader.jsx";

const empty = {
  name: "",
  description: "",
  price: "",
  discountPrice: "",
  category: "",
  brand: "",
  stock: "",
  images: [],
  isActive: true,
};

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(empty);
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cats = await listCategoriesApi({ all: "true" });
        if (alive) setCategories(cats.data?.categories || []);
      } catch {
        toast.error("Failed to load categories");
      }
      if (isEdit) {
        try {
          const res = await getProductApi(id);
          const p = res.data?.product;
          if (alive && p) {
            setForm({
              name: p.name || "",
              description: p.description || "",
              price: p.price ?? "",
              discountPrice: p.discountPrice ?? "",
              category: p.category?._id || "",
              brand: p.brand || "",
              stock: p.stock ?? "",
              images: p.images || [],
              isActive: p.isActive,
            });
          }
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to load product");
        } finally {
          if (alive) setLoading(false);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, isEdit]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name is required";
    if (form.price === "" || Number(form.price) < 0) e.price = "Valid price required";
    if (
      form.discountPrice !== "" &&
      Number(form.discountPrice) >= Number(form.price)
    )
      e.discountPrice = "Discount must be less than price";
    if (!form.category) e.category = "Select a category";
    if (form.stock !== "" && Number(form.stock) < 0) e.stock = "Stock cannot be negative";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const images = Array.isArray(form.images) ? form.images : [];

      const payload = {
        name: form.name.trim(),
        description: form.description,
        price: Number(form.price),
        discountPrice:
          form.discountPrice === "" ? undefined : Number(form.discountPrice),
        category: form.category,
        brand: form.brand,
        stock: form.stock === "" ? 0 : Number(form.stock),
        images,
        isActive: form.isActive,
      };

      if (isEdit) {
        await updateProductApi(id, payload);
        toast.success("Product updated");
      } else {
        await createProductApi(payload);
        toast.success("Product created");
      }
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loader label="Loading product..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <Link to="/admin/products" className="text-sm text-slate-500 hover:text-brand-600">
          ← Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">
          {isEdit ? "Edit product" : "Add new product"}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Fill in the details below. Required fields are marked with *.
        </p>
      </div>

      <form onSubmit={onSubmit} className="card p-6 space-y-5" noValidate>
        <div>
          <label className="label">Name *</label>
          <input name="name" value={form.name} onChange={onChange} className="input" />
          {errors.name && <p className="field-error">{errors.name}</p>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            rows={4}
            className="input resize-y"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="input"
            >
              <option value="">— Select category —</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
            {errors.category && <p className="field-error">{errors.category}</p>}
          </div>
          <div>
            <label className="label">Brand</label>
            <input name="brand" value={form.brand} onChange={onChange} className="input" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="label">Price (₹) *</label>
            <input
              name="price" type="number" min="0" step="0.01"
              value={form.price} onChange={onChange} className="input"
            />
            {errors.price && <p className="field-error">{errors.price}</p>}
          </div>
          <div>
            <label className="label">Discount price (₹)</label>
            <input
              name="discountPrice" type="number" min="0" step="0.01"
              value={form.discountPrice} onChange={onChange} className="input"
            />
            {errors.discountPrice && <p className="field-error">{errors.discountPrice}</p>}
          </div>
          <div>
            <label className="label">Stock</label>
            <input
              name="stock" type="number" min="0" step="1"
              value={form.stock} onChange={onChange} className="input"
            />
            {errors.stock && <p className="field-error">{errors.stock}</p>}
          </div>
        </div>

        <ImageUploader
          label="Product images"
          value={form.images}
          onChange={(images) => setForm((f) => ({ ...f, images }))}
          multiple
          max={8}
        />

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox" name="isActive" checked={form.isActive}
            onChange={onChange}
            className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
          />
          <span className="text-sm text-slate-700">Active (visible to customers)</span>
        </label>

        <div className="flex gap-3 pt-2 border-t border-slate-200">
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Saving..." : isEdit ? "Update product" : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
