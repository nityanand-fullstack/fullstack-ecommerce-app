import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || "",
        phone: user.phone || "",
        street: user.address?.street || "",
        city: user.address?.city || "",
        state: user.address?.state || "",
        postalCode: user.address?.postalCode || "",
        country: user.address?.country || "",
      });
    }
  }, [user, editing]);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone)) e.phone = "Invalid phone number";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const address =
        form.street || form.city || form.state || form.postalCode || form.country
          ? {
              street: form.street || undefined,
              city: form.city || undefined,
              state: form.state || undefined,
              postalCode: form.postalCode || undefined,
              country: form.country || undefined,
            }
          : undefined;

      await updateProfile({
        name: form.name.trim(),
        phone: form.phone || undefined,
        address,
      });
      toast.success("Profile updated");
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  const memberSince = user.createdAt ? new Date(user.createdAt) : null;
  const lastUpdated = user.updatedAt ? new Date(user.updatedAt) : null;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-brand-50/30 to-amber-50/30">
      {/* Decorative gradient blobs */}
      <div className="absolute inset-x-0 top-0 h-72 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-20 h-80 w-80 rounded-full bg-brand-500/15 blur-3xl" />
        <div className="absolute -top-32 right-0 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Quick actions */}
        <div className="mb-6 flex flex-wrap gap-2.5">
          <QuickLink to="/orders" icon="📦" label="My orders" />
          <QuickLink to="/cart" icon="🛒" label="My cart" />
          <QuickLink to="/products" icon="🛍️" label="Continue shopping" />
        </div>

        {/* Hero card */}
        <div className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
            <div className="h-20 w-20 sm:h-24 sm:w-24 shrink-0 grid place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-indigo-600 text-3xl sm:text-4xl font-bold text-white shadow-md ring-4 ring-white">
              {(user.name || "U").charAt(0).toUpperCase()}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {user.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${
                    user.role === "admin"
                      ? "bg-slate-900 text-white"
                      : "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
                  }`}
                >
                  {user.role}
                </span>
                {user.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2.5 py-0.5 text-xs font-semibold">
                    ✓ Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2.5 py-0.5 text-xs font-semibold">
                    ◷ Unverified
                  </span>
                )}
              </div>
              <p className="text-slate-600 text-sm mt-1.5 flex items-center gap-1.5 truncate">
                <span>✉️</span> {user.email}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary cursor-pointer"
                >
                  ✎ Edit profile
                </button>
              ) : (
                <button
                  onClick={() => {
                    setEditing(false);
                    setErrors({});
                  }}
                  className="btn-secondary cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Quick stats strip */}
          <div className="mt-6 grid grid-cols-3 gap-3">
            <StatTile
              tone="brand"
              icon="📅"
              label="Member since"
              value={memberSince ? memberSince.toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—"}
            />
            <StatTile
              tone="emerald"
              icon="🛡️"
              label="Status"
              value={user.isVerified ? "Verified" : "Pending"}
            />
            <StatTile
              tone="amber"
              icon="🔄"
              label="Last update"
              value={lastUpdated ? lastUpdated.toLocaleDateString() : "—"}
            />
          </div>
        </div>

        {/* Two-column body */}
        <div className="mt-6 grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">
            {editing ? (
              <form
                onSubmit={onSubmit}
                className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8 space-y-6"
                noValidate
              >
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Edit profile</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Update your personal details below.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">Full name</label>
                    <input name="name" value={form.name} onChange={onChange} className="input" />
                    {errors.name && <p className="field-error">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      value={user.email}
                      disabled
                      className="input bg-slate-50 cursor-not-allowed text-slate-500"
                    />
                    <p className="text-xs text-slate-400 mt-1">Email cannot be changed</p>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label">Phone</label>
                    <input
                      name="phone"
                      value={form.phone}
                      onChange={onChange}
                      className="input"
                      placeholder="+919876543210"
                    />
                    {errors.phone && <p className="field-error">{errors.phone}</p>}
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-5">
                  <p className="label">Shipping address</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input name="street" value={form.street} onChange={onChange} className="input sm:col-span-2" placeholder="Street" />
                    <input name="city" value={form.city} onChange={onChange} className="input" placeholder="City" />
                    <input name="state" value={form.state} onChange={onChange} className="input" placeholder="State" />
                    <input name="postalCode" value={form.postalCode} onChange={onChange} className="input" placeholder="Postal code" />
                    <input name="country" value={form.country} onChange={onChange} className="input" placeholder="Country" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2 border-t border-slate-200">
                  <button type="submit" disabled={submitting} className="btn-primary cursor-pointer">
                    {submitting ? "Saving..." : "Save changes"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setErrors({});
                    }}
                    className="btn-secondary cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <>
                <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
                      <p className="text-xs text-slate-500">Your basic account information</p>
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <Field icon="👤" label="Full name" value={user.name} />
                    <Field icon="✉️" label="Email" value={user.email} />
                    <Field icon="📱" label="Phone" value={user.phone || "Not added"} />
                    <Field icon="🛡️" label="Role" value={user.role} capitalize />
                  </div>
                </section>

                <section className="rounded-3xl bg-white shadow-sm ring-1 ring-slate-200/70 p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="h-10 w-10 grid place-items-center rounded-xl bg-amber-50 text-amber-600">
                      <Icon path="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">Shipping address</h2>
                      <p className="text-xs text-slate-500">Used as default during checkout</p>
                    </div>
                  </div>
                  {user.address && (user.address.street || user.address.city) ? (
                    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200 p-5">
                      <div className="text-sm text-slate-700 space-y-1">
                        {user.address.street && <p className="font-semibold text-slate-900">{user.address.street}</p>}
                        <p>
                          {[user.address.city, user.address.state, user.address.postalCode]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                        {user.address.country && <p>{user.address.country}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center">
                      <p className="text-3xl mb-2">📍</p>
                      <p className="text-sm font-semibold text-slate-700">No address on file</p>
                      <p className="text-xs text-slate-500 mt-1 mb-3">
                        Add one to speed up checkout
                      </p>
                      <button
                        onClick={() => setEditing(true)}
                        className="btn-primary !py-2 !text-xs cursor-pointer"
                      >
                        Add address
                      </button>
                    </div>
                  )}
                </section>
              </>
            )}
          </div>

          {/* Side column */}
          <aside className="space-y-6">
            <section className="rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 shadow-lg ring-1 ring-slate-900/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
                <span>🔒</span> Security
              </div>
              <h3 className="mt-2 text-lg font-semibold">Keep your account safe</h3>
              <p className="text-sm text-slate-300 mt-1">
                Use a strong password and update it regularly.
              </p>
              <Link
                to="/change-password"
                className="inline-flex items-center justify-center gap-2 mt-4 w-full rounded-lg bg-white text-slate-900 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 transition cursor-pointer"
              >
                Change password →
              </Link>
            </section>

            <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200/70">
              <h3 className="font-semibold text-slate-900">Quick links</h3>
              <div className="mt-3 space-y-1.5">
                <SideLink to="/orders" icon="📦" label="My orders" />
                <SideLink to="/cart" icon="🛒" label="My cart" />
                <SideLink to="/products" icon="🛍️" label="Continue shopping" />
                <SideLink to="/categories" icon="🗂️" label="Browse categories" />
              </div>
            </section>

            <section className="rounded-3xl bg-gradient-to-br from-brand-50 to-amber-50 p-6 ring-1 ring-brand-100">
              <p className="text-3xl">🎉</p>
              <h3 className="mt-2 font-semibold text-slate-900">Welcome aboard</h3>
              <p className="text-sm text-slate-600 mt-1">
                Thanks for being part of E-com App. Enjoy curated picks and member-only deals.
              </p>
            </section>
          </aside>
        </div>
      </div>
    // </div>
  );
}

function StatTile({ tone, icon, label, value }) {
  const tones = {
    brand: "from-brand-50 to-white ring-brand-100 text-brand-700",
    emerald: "from-emerald-50 to-white ring-emerald-100 text-emerald-700",
    amber: "from-amber-50 to-white ring-amber-100 text-amber-700",
  };
  return (
    <div className={`rounded-2xl bg-gradient-to-br ring-1 p-3 sm:p-4 ${tones[tone] || tones.brand}`}>
      <p className="text-xl sm:text-2xl">{icon}</p>
      <p className="mt-1 text-[10px] sm:text-xs uppercase tracking-wider font-semibold opacity-80">
        {label}
      </p>
      <p className="mt-0.5 text-xs sm:text-sm font-bold text-slate-900 truncate">
        {value}
      </p>
    </div>
  );
}

function Field({ icon, label, value, capitalize = false }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50/60 ring-1 ring-slate-200/60 p-3.5 hover:bg-slate-50 transition">
      <div className="text-xl">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">
          {label}
        </p>
        <p className={`mt-0.5 text-sm font-semibold text-slate-900 truncate ${capitalize ? "capitalize" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function QuickLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full bg-white shadow-sm ring-1 ring-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:text-brand-600 hover:ring-brand-300 hover:shadow transition cursor-pointer"
    >
      <span>{icon}</span> {label}
    </Link>
  );
}

function SideLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-brand-600 hover:bg-slate-50 transition cursor-pointer group"
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
      <span className="text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition">→</span>
    </Link>
  );
}

function Icon({ path }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  );
}
