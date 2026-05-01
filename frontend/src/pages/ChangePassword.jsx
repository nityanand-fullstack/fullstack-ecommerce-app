import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

function PasswordField({ name, label, autoComplete, value, onChange, error, visible, onToggle }) {
  return (
    <div>
      <label className="label" htmlFor={name}>{label}</label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          className="input pr-20"
          placeholder="••••••••"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-brand-600 hover:text-brand-700 px-2 py-1"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default function ChangePassword() {
  const { changePassword } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ cur: false, next: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const toggle = (key) => () =>
    setShow((s) => ({ ...s, [key]: !s[key] }));

  const validate = () => {
    const e = {};
    if (!form.currentPassword) e.currentPassword = "Current password is required";
    if (!form.newPassword) e.newPassword = "New password is required";
    else if (!/^(?=.*[A-Za-z])(?=.*\d).{6,}$/.test(form.newPassword))
      e.newPassword = "Min 6 chars, must include a letter and a digit";
    if (form.newPassword && form.newPassword === form.currentPassword)
      e.newPassword = "New password must be different from current password";
    if (form.newPassword !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      navigate("/profile");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-slate-900">Change password</h1>
        <p className="text-sm text-slate-500 mt-1">
          Use a strong password — at least 6 characters with letters and digits.
        </p>

        <form onSubmit={onSubmit} className="space-y-5 mt-6" noValidate>
          <PasswordField
            name="currentPassword"
            label="Current password"
            autoComplete="current-password"
            value={form.currentPassword}
            onChange={onChange}
            error={errors.currentPassword}
            visible={show.cur}
            onToggle={toggle("cur")}
          />
          <PasswordField
            name="newPassword"
            label="New password"
            autoComplete="new-password"
            value={form.newPassword}
            onChange={onChange}
            error={errors.newPassword}
            visible={show.next}
            onToggle={toggle("next")}
          />
          <PasswordField
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={onChange}
            error={errors.confirmPassword}
            visible={show.confirm}
            onToggle={toggle("confirm")}
          />

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Updating..." : "Update password"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
