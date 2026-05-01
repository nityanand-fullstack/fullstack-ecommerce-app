import { NavLink, Link } from "react-router-dom";

const items = [
  { to: "/admin", label: "Dashboard", icon: DashIcon, end: true },
  { to: "/admin/products", label: "Products", icon: BoxIcon },
  { to: "/admin/categories", label: "Categories", icon: TagIcon },
  { to: "/admin/orders", label: "Orders", icon: CartIcon },
  { to: "/admin/users", label: "Users", icon: UsersIcon },
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/50 z-30 lg:hidden transition-opacity ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 shrink-0 bg-slate-900 text-slate-200 flex flex-col transition-transform lg:transition-none ${
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="px-6 py-5 border-b border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 grid place-items-center rounded-lg bg-brand-500 text-white font-bold">
            E
          </div>
          <div>
            <p className="font-semibold tracking-tight">E-com Admin</p>
            <p className="text-xs text-slate-400">Control center</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {items.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-500/15 text-white ring-1 ring-brand-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`
              }
            >
              <it.icon />
              {it.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <BackIcon />
            Back to site
          </Link>
        </div>
      </aside>
    </>
  );
}

function IconBase({ children }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
      {children}
    </svg>
  );
}
function DashIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M5 10v10h4v-6h6v6h4V10" />
    </IconBase>
  );
}
function UsersIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m10-4a4 4 0 11-8 0 4 4 0 018 0zm6-3a3 3 0 11-6 0 3 3 0 016 0z" />
    </IconBase>
  );
}
function TagIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5a2 2 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 10V5a2 2 0 012-2z" />
    </IconBase>
  );
}
function BoxIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7L12 3 4 7m16 0v10l-8 4m8-14l-8 4m0 0L4 7m8 4v10M4 7v10l8 4" />
    </IconBase>
  );
}
function CartIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-1.5 4h13M9 21a1 1 0 100-2 1 1 0 000 2zm9 0a1 1 0 100-2 1 1 0 000 2z" />
    </IconBase>
  );
}
function BackIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </IconBase>
  );
}
