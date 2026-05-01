import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  listCategoriesApi,
  createCategoryApi,
  updateCategoryApi,
  deleteCategoryApi,
} from "../../api/categoryApi.js";
import Loader from "../../components/Loader.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import ImageUploader from "../components/ImageUploader.jsx";

const emptyForm = { name: "", description: "", image: "", isActive: true };

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, mode: "create", id: null });
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, category: null });
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await listCategoriesApi({ all: "true" });
      setCategories(res.data?.categories || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setErrors({});
    setModal({ open: true, mode: "create", id: null });
  };

  const openEdit = (c) => {
    setForm({
      name: c.name,
      description: c.description || "",
      image: c.image || "",
      isActive: c.isActive,
    });
    setErrors({});
    setModal({ open: true, mode: "edit", id: c._id });
  };

  const closeModal = () => setModal({ open: false, mode: "create", id: null });

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2)
      e.name = "Name must be at least 2 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description,
        image: form.image,
        isActive: form.isActive,
      };
      if (modal.mode === "edit") {
        await updateCategoryApi(modal.id, payload);
        toast.success("Category updated");
      } else {
        await createCategoryApi(payload);
        toast.success("Category created");
      }
      closeModal();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm.category) return;
    setDeleting(true);
    try {
      await deleteCategoryApi(confirm.category._id);
      toast.success("Category deleted");
      setConfirm({ open: false, category: null });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-1">
            Organize your catalog into categories.
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <span className="mr-1.5">+</span> Add category
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <Loader label="Loading categories..." />
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            No categories yet. Click 'Add category' to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-semibold px-6 py-3">Category</th>
                  <th className="text-left font-semibold px-6 py-3">Slug</th>
                  <th className="text-left font-semibold px-6 py-3">Status</th>
                  <th className="text-right font-semibold px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {categories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-slate-100 ring-1 ring-slate-200">
                          {c.image ? (
                            <img src={c.image} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <div className="grid place-items-center h-full text-slate-400 font-bold">
                              {c.name?.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{c.name}</p>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            {c.description || "—"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-600">
                      {c.slug}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${
                          c.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-slate-200"
                        }`}
                      >
                        {c.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => openEdit(c)}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirm({ open: true, category: c })}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={closeModal} />
          <div className="relative card max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900">
              {modal.mode === "edit" ? "Edit category" : "New category"}
            </h3>
            <form onSubmit={onSubmit} className="space-y-4 mt-4" noValidate>
              <div>
                <label className="label">Name *</label>
                <input
                  name="name" value={form.name} onChange={onChange}
                  className="input" placeholder="e.g. Fashion"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  name="description" value={form.description}
                  onChange={onChange} rows={2} className="input resize-y"
                />
              </div>
              <ImageUploader
                label="Image"
                value={form.image}
                onChange={(image) => setForm((f) => ({ ...f, image }))}
                multiple={false}
              />
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox" name="isActive" checked={form.isActive}
                  onChange={onChange}
                  className="rounded border-slate-300 text-brand-500 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">Active</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? "Saving..." : modal.mode === "edit" ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Delete this category?"
        message={
          confirm.category
            ? `"${confirm.category.name}" will be permanently removed. Products in this category will need to be reassigned.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, category: null })}
      />
    </div>
  );
}
