import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";

const CartIcon = ({ count = 0, className = "" }) => {
  const [bump, setBump] = useState(false);
  const prev = useRef(count);

  useEffect(() => {
    if (count > prev.current) {
      setBump(true);
      const t = setTimeout(() => setBump(false), 360);
      prev.current = count;
      return () => clearTimeout(t);
    }
    prev.current = count;
  }, [count]);

  return (
    <span className={`relative inline-flex ${className}`}>
      <svg
        className={`h-6 w-6 ${bump ? "cart-bump" : ""}`}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.5l1.5 12h13.5l1.5-9h-15M9 19.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm9 0a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"
        />
      </svg>
      {count > 0 && (
        <span
          className={`absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-bold grid place-items-center ring-2 ring-white ${
            bump ? "cart-bump" : ""
          }`}
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </span>
  );
};

const navItem = ({ isActive }) =>
  `relative px-3 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
    isActive
      ? "text-brand-600 bg-brand-50"
      : "text-slate-600 hover:text-brand-600 hover:bg-slate-50"
  }`;

const mobileNavItem = ({ isActive }) =>
  `block px-3 py-2.5 rounded-lg text-sm font-medium transition ${
    isActive
      ? "text-brand-600 bg-brand-50"
      : "text-slate-700 hover:text-brand-600 hover:bg-slate-50"
  }`;

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { count: cartCount } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = isAuthenticated && user?.role === "admin";

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    navigate("/login");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  // ----- ADMIN NAVBAR -----
  if (isAdmin) {
    return (
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/admin" className="flex items-center gap-2 cursor-pointer">
              <div className="h-8 w-8 grid place-items-center rounded-lg bg-brand-500 text-white font-bold">
                E
              </div>
              <span className="font-semibold text-slate-800 tracking-tight">
                E-com App
                <span className="ml-2 text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white rounded-full px-2 py-0.5 align-middle">
                  Admin
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <NavLink to="/admin" className={navItem}>Admin Panel</NavLink>
              <button onClick={handleLogout} className="btn-secondary cursor-pointer">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  // ----- USER / PUBLIC NAVBAR -----
  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 cursor-pointer">
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-brand-500 text-white font-bold shadow-sm">
              E
            </div>
            <span className="font-semibold text-slate-900 tracking-tight hidden sm:inline">
              E-com App
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            <NavLink to="/" end className={navItem}>Home</NavLink>
            <NavLink to="/categories" className={navItem}>Categories</NavLink>
            <NavLink to="/products" className={navItem}>Products</NavLink>
            {isAuthenticated && (
              <>
                <NavLink to="/orders" className={navItem}>Orders</NavLink>
                <NavLink to="/profile" className={navItem}>Profile</NavLink>
              </>
            )}
          </div>

          {/* Right actions */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  aria-label="Cart"
                  className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-50"
                >
                  <CartIcon count={cartCount} />
                </Link>
                <div className="flex items-center gap-2 px-2 py-1 rounded-lg bg-slate-50">
                  <div className="h-7 w-7 grid place-items-center rounded-full bg-brand-500 text-white font-semibold text-xs">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-slate-700 max-w-[120px] truncate">
                    {user?.name?.split(" ")[0]}
                  </span>
                </div>
                <button onClick={handleLogout} className="btn-secondary cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary cursor-pointer">Sign in</Link>
                <Link to="/register" className="btn-primary cursor-pointer">Sign up</Link>
              </>
            )}
          </div>

          {/* Mobile right cluster: cart icon + hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            {isAuthenticated && (
              <Link
                to="/cart"
                className="p-2 rounded-lg text-slate-600 hover:text-brand-600 hover:bg-slate-50 cursor-pointer"
                aria-label="Cart"
                onClick={closeMenu}
              >
                <CartIcon count={cartCount} />
              </Link>
            )}
            <button
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 cursor-pointer"
              onClick={() => setMenuOpen((s) => !s)}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden pb-4 border-t border-slate-200 mt-1 pt-3 space-y-1">
            <NavLink to="/" end className={mobileNavItem} onClick={closeMenu}>Home</NavLink>
            <NavLink to="/categories" className={mobileNavItem} onClick={closeMenu}>Categories</NavLink>
            <NavLink to="/products" className={mobileNavItem} onClick={closeMenu}>Products</NavLink>
            {isAuthenticated ? (
              <>
                <NavLink to="/orders" className={mobileNavItem} onClick={closeMenu}>Orders</NavLink>
                <NavLink to="/profile" className={mobileNavItem} onClick={closeMenu}>Profile</NavLink>
                <NavLink to="/change-password" className={mobileNavItem} onClick={closeMenu}>Change Password</NavLink>
                <div className="px-3 pt-3 mt-2 border-t border-slate-200 flex items-center gap-2">
                  <div className="h-8 w-8 grid place-items-center rounded-full bg-brand-500 text-white font-semibold text-sm">
                    {(user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="pt-2 border-t border-slate-200 mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" className="btn-secondary justify-center cursor-pointer" onClick={closeMenu}>
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary justify-center cursor-pointer" onClick={closeMenu}>
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
