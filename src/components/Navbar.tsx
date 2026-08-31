import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cartCount, useStore } from "../store/store";
import { cx, fmt, fuzzyScore } from "../lib/utils";
import { CATEGORIES } from "../data/catalog";
import {
  IconCart, IconChevron, IconClose, IconHeart, IconLogo, IconMenu, IconSearch, IconUser, IconLogout, IconGrid, IconBolt,
} from "./icons";
import ThemeSwitch from "./ThemeSwitch";

export default function Navbar() {
  const { cart, wishlist, user, setCartOpen, logout } = useStore();
  const products = useStore((s) => s.products);
  const nav = useNavigate();
  const loc = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [mobile, setMobile] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setFocus(false);
      setUserMenu(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    setMobile(false);
    setUserMenu(false);
  }, [loc.pathname, loc.search]);

  const suggestions = useMemo(() => {
    const t = q.trim();
    if (!t) return [];
    return products
      .map((p) => ({ p, score: fuzzyScore(t, p.name + " " + p.category + " " + p.tags.join(" ")) }))
      .filter((x) => x.score !== null)
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 5)
      .map((x) => x.p);
  }, [q, products]);

  const count = cartCount(cart);

  const goSuggestion = (slug: string) => {
    setQ("");
    setFocus(false);
    nav(`/product/${slug}`);
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
    ...CATEGORIES.slice(0, 3).map((c) => ({ to: `/shop?cat=${c.id}`, label: c.name })),
  ];

  return (
    <>
      <header
        className={cx(
          "fixed top-0 inset-x-0 z-[80] transition-all duration-500",
          scrolled ? "glass border-b hairline shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9)]" : "border-b border-transparent bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <IconLogo size={26} className="transition-transform duration-500 group-hover:rotate-[18deg]" />
            <span className="font-display font-bold tracking-[0.14em] text-white text-sm">
              WEARLY<span className="text-neon">//</span>HOUSE
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-6 ml-6">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className={cx(
                  "text-[13px] font-medium tracking-wide transition-colors link-underline pb-0.5",
                  loc.pathname + loc.search === l.to ? "text-neon" : "text-mist hover:text-white"
                )}
              >
                {l.label}
              </Link>
            ))}
            {user?.role === "admin" && (
              <Link to="/admin" className="text-[13px] font-medium tracking-wide text-viol hover:text-white transition-colors link-underline pb-0.5">
                Admin
              </Link>
            )}
          </nav>

          <div className="flex-1" />

          {/* search */}
          <div ref={searchRef} className="relative hidden md:block w-44 focus-within:w-72 transition-all duration-500">
            <div className="flex items-center gap-2 glass rounded-full px-3.5 h-9 focus-within:border-neon/50 transition-colors">
              <IconSearch size={15} className="text-mist shrink-0" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setFocus(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && q.trim()) {
                    nav(`/shop?q=${encodeURIComponent(q.trim())}`);
                    setQ("");
                    setFocus(false);
                  }
                }}
                placeholder="Search gear…"
                className="bg-transparent outline-none text-sm w-full placeholder:text-mist/50"
              />
            </div>
            <AnimatePresence>
              {focus && q.trim() && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-11 inset-x-0 glass rounded-xl overflow-hidden p-1.5"
                >
                  {suggestions.length === 0 ? (
                    <p className="px-3 py-3 text-xs text-mist">No units match "{q}".</p>
                  ) : (
                    suggestions.map((p) => (
                      <button
                        key={p.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          goSuggestion(p.slug);
                        }}
                        className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-white/6 text-left transition-colors group"
                      >
                        <img src={p.image} alt="" className="w-9 h-9 object-cover rounded-md border hairline" />
                        <span className="flex-1 min-w-0">
                          <span className="block text-xs font-medium text-fog group-hover:text-neon truncate transition-colors">{p.name}</span>
                          <span className="block text-[10px] font-mono uppercase tracking-wider text-mist">{p.category}</span>
                        </span>
                        <span className="text-xs font-mono text-neon">{fmt(p.price)}</span>
                      </button>
                    ))
                  )}
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      nav(`/shop?q=${encodeURIComponent(q.trim())}`);
                      setQ("");
                      setFocus(false);
                    }}
                    className="w-full px-3 py-2 text-[11px] font-mono uppercase tracking-[0.18em] text-neon hover:bg-white/6 rounded-lg transition-colors text-left"
                  >
                    View all results →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* actions */}
          <div className="flex items-center gap-1">
            <div className="hidden md:block lg:hidden mr-1.5">
              <ThemeSwitch compact />
            </div>
            <div className="hidden lg:block mr-1.5">
              <ThemeSwitch />
            </div>
            <button
              onClick={() => window.dispatchEvent(new Event("wearly:palette"))}
              aria-label="Open command console"
              className="hidden md:flex items-center gap-2 mr-1.5 pl-3 pr-2 h-9 rounded-full glass text-mist hover:text-neon hover:border-neon/45 transition-all duration-300 group"
            >
              <IconBolt size={13} className="text-neon group-hover:text-glow" />
              <span className="text-[10px] font-mono tracking-[0.18em] uppercase">console</span>
              <kbd className="text-[9px] font-mono border border-white/12 rounded px-1 py-px text-mist/70">⌘K</kbd>
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative p-2.5 text-mist hover:text-rose2 transition-colors"
            >
              <IconHeart size={19} />
              {wishlist.length > 0 && (
                <motion.span
                  key={wishlist.length}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose2/90 text-void text-[9px] font-bold flex items-center justify-center"
                >
                  {wishlist.length}
                </motion.span>
              )}
            </Link>
            <button
              onClick={() => setCartOpen(true)}
              aria-label="Open cart"
              className="relative p-2.5 text-mist hover:text-neon transition-colors"
            >
              <IconCart size={19} />
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-neon text-void text-[9px] font-bold flex items-center justify-center"
                >
                  {count}
                </motion.span>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setUserMenu((v) => !v)}
                aria-label="Account menu"
                className={cx("p-2.5 transition-colors", user ? "text-neon" : "text-mist hover:text-white")}
              >
                <IconUser size={19} />
              </button>
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.18 }}
                    className="absolute right-0 top-11 w-52 glass rounded-xl overflow-hidden py-1.5"
                  >
                    {user ? (
                      <>
                        <div className="px-4 py-2.5 border-b hairline">
                          <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                          <p className="text-[11px] text-mist truncate">{user.email}</p>
                        </div>
                        <button onClick={() => { nav("/account"); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-fog hover:bg-white/6 hover:text-neon transition-colors">
                          <IconGrid size={15} /> Dashboard
                        </button>
                        {user.role === "admin" && (
                          <button onClick={() => nav("/admin")} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-viol hover:bg-white/6 transition-colors">
                            <IconChevron size={15} /> Admin panel
                          </button>
                        )}
                        <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-rose2 hover:bg-white/6 transition-colors">
                          <IconLogout size={15} /> Sign out
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => nav("/auth")} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-fog hover:bg-white/6 hover:text-neon transition-colors">
                          <IconUser size={15} /> Sign in
                        </button>
                        <button onClick={() => nav("/auth?mode=signup")} className="w-full px-4 py-2.5 text-[13px] text-neon hover:bg-white/6 transition-colors text-left">
                          Create account
                        </button>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => setMobile(true)}
              aria-label="Open menu"
              className="lg:hidden p-2.5 text-mist hover:text-white transition-colors"
            >
              <IconMenu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <AnimatePresence>
        {mobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] lg:hidden"
          >
            <div className="absolute inset-0 bg-void/85 backdrop-blur-sm" onClick={() => setMobile(false)} />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute right-0 top-0 bottom-0 w-[78%] max-w-xs glass border-l hairline p-6 flex flex-col gap-2 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold tracking-[0.14em] text-white text-sm">
                  WEARLY<span className="text-neon">//</span>HOUSE
                </span>
                <button onClick={() => setMobile(false)} aria-label="Close menu" className="text-mist hover:text-white">
                  <IconClose size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2 glass rounded-full px-3.5 h-10 mb-4">
                <IconSearch size={15} className="text-mist" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && q.trim()) {
                      nav(`/shop?q=${encodeURIComponent(q.trim())}`);
                      setQ("");
                    }
                  }}
                  placeholder="Search gear…"
                  className="bg-transparent outline-none text-sm w-full placeholder:text-mist/50"
                />
              </div>
              {[...links, ...(user?.role === "admin" ? [{ to: "/admin", label: "Admin" }] : [])].map((l) => (
                <Link key={l.to + l.label} to={l.to} className="font-display text-lg font-semibold text-fog hover:text-neon py-2.5 border-b hairline transition-colors">
                  {l.label}
                </Link>
              ))}
              <Link to={user ? "/account" : "/auth"} className="font-display text-lg font-semibold text-viol hover:text-white py-2.5 transition-colors">
                {user ? "Dashboard" : "Sign in"}
              </Link>
              <div className="mt-auto pt-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist mb-3">Interface protocol</p>
                <ThemeSwitch />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
