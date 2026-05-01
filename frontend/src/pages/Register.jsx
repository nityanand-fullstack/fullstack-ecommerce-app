import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const initialForm = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.name || form.name.trim().length < 2) e.name = "Name must be at least 2 characters";
    if (!form.email) e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(form.password))
      e.password = "Min 6 chars, must include a letter and a digit";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    if (form.phone && !/^\+?\d{7,15}$/.test(form.phone))
      e.phone = "Invalid phone number";
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

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone: form.phone || undefined,
        address,
      };

      const res = await register(payload);
      toast.success("Account created successfully");
      const role = res?.data?.user?.role;
      navigate(role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      if (data?.errors?.length) {
        const fieldErrors = {};
        data.errors.forEach((e) => (fieldErrors[e.field] = e.message));
        setErrors(fieldErrors);
      }
      toast.error(data?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid place-items-center px-4 py-10">
      <div className="w-full max-w-2xl">
        <div className="card p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
            <p className="text-sm text-slate-500 mt-1">
              Join us — it only takes a minute.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5" noValidate>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="name">Full name *</label>
                <input
                  id="name" name="name" type="text" autoComplete="name"
                  value={form.name} onChange={onChange} className="input"
                  placeholder="Jane Doe"
                />
                {errors.name && <p className="field-error">{errors.name}</p>}
              </div>
              <div>
                <label className="label" htmlFor="email">Email *</label>
                <input
                  id="email" name="email" type="email" autoComplete="email"
                  value={form.email} onChange={onChange} className="input"
                  placeholder="you@example.com"
                />
                {errors.email && <p className="field-error">{errors.email}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label" htmlFor="password">Password *</label>
                <div className="relative">
                  <input
                    id="password" name="password"
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.password} onChange={onChange}
                    className="input pr-20" placeholder="••••••••"
                  />
                  <button
                    type="button" onClick={() => setShowPw((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 hover:text-brand-700 px-2 py-1"
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password}</p>}
              </div>
              <div>
                <label className="label" htmlFor="confirmPassword">Confirm password *</label>
                <input
                  id="confirmPassword" name="confirmPassword"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword} onChange={onChange}
                  className="input" placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="phone">Phone <span className="text-slate-400 font-normal">(optional)</span></label>
              <input
                id="phone" name="phone" type="tel" autoComplete="tel"
                value={form.phone} onChange={onChange} className="input"
                placeholder="+919876543210"
              />
              {errors.phone && <p className="field-error">{errors.phone}</p>}
            </div>

            <div>
              <p className="label">Address <span className="text-slate-400 font-normal">(optional)</span></p>
              <div className="grid sm:grid-cols-2 gap-4">
                <input name="street" value={form.street} onChange={onChange}
                  className="input" placeholder="Street" />
                <input name="city" value={form.city} onChange={onChange}
                  className="input" placeholder="City" />
                <input name="state" value={form.state} onChange={onChange}
                  className="input" placeholder="State" />
                <input name="postalCode" value={form.postalCode} onChange={onChange}
                  className="input" placeholder="Postal code" />
                <input name="country" value={form.country} onChange={onChange}
                  className="input sm:col-span-2" placeholder="Country" />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
