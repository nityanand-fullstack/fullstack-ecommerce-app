import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  listProductReviewsApi,
  checkReviewEligibilityApi,
  createReviewApi,
  deleteReviewApi,
} from "../api/reviewApi.js";
import { useAuth } from "../context/AuthContext.jsx";
import Stars from "./Stars.jsx";

export default function ProductReviews({ productId, onChange }) {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: "", comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const tasks = [listProductReviewsApi(productId)];
      if (isAuthenticated) tasks.push(checkReviewEligibilityApi(productId));
      const [reviewsRes, eligRes] = await Promise.all(tasks);
      setReviews(reviewsRes.data?.reviews || []);
      if (eligRes) setEligibility(eligRes.data);
      else setEligibility(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, isAuthenticated]);

  const distribution = [5, 4, 3, 2, 1].map((s) => ({
    star: s,
    count: reviews.filter((r) => r.rating === s).length,
  }));
  const total = reviews.length;
  const avg = total
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / total
    : 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.rating) errs.rating = "Pick a star rating";
    if (!form.comment.trim()) errs.comment = "Write a short comment";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSubmitting(true);
    try {
      await createReviewApi(productId, {
        rating: form.rating,
        title: form.title.trim(),
        comment: form.comment.trim(),
      });
      toast.success("Review posted");
      setForm({ rating: 0, title: "", comment: "" });
      setShowForm(false);
      onChange?.();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not post review");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this review?")) return;
    try {
      await deleteReviewApi(id);
      toast.success("Review deleted");
      onChange?.();
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <section className="border-t border-slate-200 mt-12 pt-10">
      <div className="grid lg:grid-cols-[280px_1fr] gap-10">
        <aside>
          <h2 className="text-2xl font-bold text-slate-900">Reviews</h2>
          {total > 0 ? (
            <>
              <div className="mt-3 flex items-center gap-3">
                <span className="text-4xl font-bold text-slate-900">
                  {avg.toFixed(1)}
                </span>
                <div>
                  <Stars value={Math.round(avg)} size="md" />
                  <p className="text-xs text-slate-500 mt-0.5">
                    {total} {total === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-1.5">
                {distribution.map((d) => (
                  <div key={d.star} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-600 w-6">{d.star}★</span>
                    <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-amber-400"
                        style={{ width: total ? `${(d.count / total) * 100}%` : 0 }}
                      />
                    </div>
                    <span className="text-slate-500 w-6 text-right">{d.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No reviews yet — be the first.
            </p>
          )}

          {isAuthenticated && eligibility && (
            <div className="mt-6">
              {eligibility.canReview ? (
                <button
                  onClick={() => setShowForm((s) => !s)}
                  className="btn-primary w-full"
                >
                  {showForm ? "Cancel" : "Write a review"}
                </button>
              ) : (
                <p className="text-xs text-slate-500 bg-slate-50 ring-1 ring-slate-200 rounded-lg p-3">
                  {eligibility.reason}
                </p>
              )}
            </div>
          )}
          {!isAuthenticated && (
            <p className="mt-6 text-xs text-slate-500 bg-slate-50 ring-1 ring-slate-200 rounded-lg p-3">
              Sign in to leave a review.
            </p>
          )}
        </aside>

        <div>
          {showForm && eligibility?.canReview && (
            <form
              onSubmit={onSubmit}
              className="card p-5 mb-6 space-y-4"
              noValidate
            >
              <div>
                <label className="label">Your rating</label>
                <Stars
                  value={form.rating}
                  size="lg"
                  interactive
                  onChange={(rating) => setForm((f) => ({ ...f, rating }))}
                />
                {errors.rating && <p className="field-error">{errors.rating}</p>}
              </div>
              <div>
                <label className="label">Title <span className="text-slate-400 font-normal">(optional)</span></label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="input"
                  placeholder="Loved it!"
                />
              </div>
              <div>
                <label className="label">Your review</label>
                <textarea
                  value={form.comment}
                  onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
                  rows={4}
                  className="input resize-y"
                  placeholder="Share your thoughts..."
                />
                {errors.comment && <p className="field-error">{errors.comment}</p>}
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? "Posting..." : "Post review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-slate-500 text-sm">Loading reviews...</p>
          ) : reviews.length === 0 ? (
            <div className="card p-8 text-center text-slate-500">
              No reviews yet.
            </div>
          ) : (
            <ul className="space-y-4">
              {reviews.map((r) => {
                const isOwn = r.user?._id === user?._id;
                return (
                  <li key={r._id} className="card p-5">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 grid place-items-center rounded-full bg-brand-100 text-brand-600 font-semibold shrink-0">
                        {(r.user?.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-slate-900">
                            {r.user?.name || "User"}
                          </p>
                          {isOwn && (
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 ring-1 ring-brand-200 rounded-full px-2 py-0.5">
                              You
                            </span>
                          )}
                          <span className="text-xs text-slate-400">
                            · {new Date(r.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <Stars value={r.rating} size="sm" />
                        {r.title && (
                          <p className="mt-2 font-semibold text-slate-900">
                            {r.title}
                          </p>
                        )}
                        <p className="mt-1 text-slate-700 leading-relaxed">
                          {r.comment}
                        </p>
                        {(isOwn || user?.role === "admin") && (
                          <button
                            onClick={() => handleDelete(r._id)}
                            className="mt-3 text-xs font-semibold text-rose-600 hover:text-rose-700"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
