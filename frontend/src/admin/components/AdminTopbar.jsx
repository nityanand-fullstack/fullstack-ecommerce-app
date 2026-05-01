import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";

export default function AdminTopbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1">
          <h2 className="text-base font-semibold text-slate-900 hidden sm:block">
            Admin Panel
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-slate-900">
              {user?.name}
            </span>
            <span className="text-xs text-slate-500">{user?.email}</span>
          </div>
          <div className="h-9 w-9 grid place-items-center rounded-full bg-brand-100 text-brand-600 font-semibold text-sm">
            {(user?.name || "A").charAt(0).toUpperCase()}
          </div>
          <button onClick={handleLogout} className="btn-secondary !py-2">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
