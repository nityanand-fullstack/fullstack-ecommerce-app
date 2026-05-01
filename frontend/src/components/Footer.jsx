import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useState } from "react";

const shopLinks = [
  { to: "/products", label: "All products" },
  { to: "/categories", label: "Categories" },
  { to: "/products?sort=price-asc", label: "Best deals" },
  { to: "/products?sort=rating-desc", label: "Top rated" },
];

const accountLinks = [
  { to: "/profile", label: "My profile" },
  { to: "/orders", label: "My orders" },
  { to: "/cart", label: "My cart" },
  { to: "/change-password", label: "Change password" },
];

const helpLinks = [
  { to: "#", label: "Shipping policy" },
  { to: "#", label: "Returns & refunds" },
  { to: "#", label: "FAQs" },
  { to: "#", label: "Contact us" },
];

export default function Footer() {
  const [email, setEmail] = useState("");

  const subscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thanks for subscribing!");
    setEmail("");
  };

  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      {/* Newsletter */}
      <div className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid lg:grid-cols-2 gap-6 items-center">
          <div>
            <h3 className="text-white text-2xl font-bold tracking-tight">
              Get 10% off your first order
            </h3>
            <p className="text-slate-400 mt-1.5 text-sm">
              Sign up for our newsletter and be the first to know about deals & new arrivals.
            </p>
          </div>
          <form onSubmit={subscribe} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 rounded-lg bg-slate-800 ring-1 ring-slate-700 text-white px-4 py-3 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-semibold px-5 py-3 transition cursor-pointer"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="col-span-2 lg:col-span-1">
          <Link to="/" className="flex items-center gap-2 cursor-pointer">
            <div className="h-9 w-9 grid place-items-center rounded-lg bg-brand-500 text-white font-bold">
              E
            </div>
            <span className="font-semibold text-white tracking-tight text-lg">
              E-com App
            </span>
          </Link>
          <p className="mt-4 text-sm text-slate-400 max-w-xs">
            Your one-stop destination for premium products at unbeatable prices.
          </p>
          <div className="mt-5 flex gap-2">
            <SocialIcon label="Facebook" path="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89H7.898V12H10.438V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.89H13.563v6.989C18.343 21.128 22 16.991 22 12z" />
            <SocialIcon label="Instagram" path="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            <SocialIcon label="Twitter" path="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            <SocialIcon label="YouTube" path="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </div>
        </div>

        <FooterColumn title="Shop" links={shopLinks} />
        <FooterColumn title="Account" links={accountLinks} />
        <FooterColumn title="Help" links={helpLinks} />
      </div>

      {/* Bottom strip */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} E-com App. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition cursor-pointer">Privacy</a>
            <a href="#" className="hover:text-slate-300 transition cursor-pointer">Terms</a>
            <a href="#" className="hover:text-slate-300 transition cursor-pointer">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <h4 className="text-white font-semibold text-sm">{title}</h4>
      <ul className="mt-4 space-y-2">
        {links.map((l, i) => (
          <li key={i}>
            <Link
              to={l.to}
              className="text-sm text-slate-400 hover:text-white transition cursor-pointer"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialIcon({ label, path }) {
  return (
    <a
      href="#"
      aria-label={label}
      className="h-9 w-9 grid place-items-center rounded-lg bg-slate-800 hover:bg-brand-500 text-slate-300 hover:text-white transition cursor-pointer"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    </a>
  );
}
