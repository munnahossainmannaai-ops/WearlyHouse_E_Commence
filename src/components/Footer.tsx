import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useStore } from "../store/store";
import { CATEGORIES } from "../data/catalog";
import { IconLogo, IconArrow, IconCheck } from "./icons";

export default function Footer() {
  const toast = useStore((s) => s.toast);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");
  const [clock, setClock] = useState("");

  useEffect(() => {
    const t = setInterval(
      () => setClock(new Date().toLocaleTimeString("en-US", { hour12: false })),
      1000
    );
    return () => clearInterval(t);
  }, []);

  const subscribe = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErr("Enter a valid uplink address.");
      return;
    }
    setErr("");
    setDone(true);
    toast("success", "Uplink confirmed", "Transmission subscription active.");
  };

  return (
    <footer className="relative border-t hairline mt-24 bg-abyss/60">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-neon/50 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-14 pb-8">
        {/* newsletter band */}
        <div className="glass rounded-2xl p-6 md:p-8 mb-14 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-viol/15 blur-3xl pointer-events-none" />
          <div className="flex flex-col md:flex-row md:items-center gap-6 justify-between relative">
            <div>
              <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-2">Incoming transmissions</p>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-white">
                Drops land first in your inbox.
              </h3>
            </div>
            {done ? (
              <div className="flex items-center gap-3 text-mint glass rounded-full px-5 py-3 border-mint/30">
                <IconCheck size={16} />
                <span className="text-sm font-medium">Uplink established — welcome aboard.</span>
              </div>
            ) : (
              <div className="w-full md:w-auto">
                <div className="flex gap-2 w-full md:w-96">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && subscribe()}
                    placeholder="you@station.io"
                    className="flex-1 bg-white/[0.05] border border-white/10 rounded-full px-4 py-3 text-sm outline-none focus:border-neon/60 transition-colors placeholder:text-mist/50"
                  />
                  <button
                    onClick={subscribe}
                    className="shrink-0 w-11 h-[46px] rounded-full bg-gradient-to-r from-neon to-viol text-void flex items-center justify-center hover:shadow-[0_0_26px_-6px_rgba(45,226,255,0.7)] transition-shadow"
                    aria-label="Subscribe"
                  >
                    <IconArrow size={17} />
                  </button>
                </div>
                {err && <p className="text-rose2 text-xs mt-2 ml-2">{err}</p>}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-12 gap-10 mb-12">
          <div className="col-span-2 md:col-span-4">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <IconLogo size={28} />
              <span className="font-display font-bold tracking-[0.14em] text-white">
                WEARLY<span className="text-neon">//</span>HOUSE
              </span>
            </Link>
            <p className="text-sm text-mist leading-relaxed max-w-xs mb-6">
              A future-wear &amp; hardware atelier — cut, tested and shipped from low orbit since 2049.
            </p>
            <div className="glass rounded-xl p-4 max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mist">System status</span>
                <span className="flex items-center gap-1.5 text-[10px] font-mono text-mint">
                  <span className="w-1.5 h-1.5 rounded-full bg-mint anim-pulse-dot" /> ALL GRIDS UP
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-mist">Station clock</span>
                <span className="font-mono text-neon tabular-nums">{clock || "00:00:00"} UTC</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-1">
                <span className="text-mist">Build</span>
                <span className="font-mono text-fog">v8.1.0-house</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-white mb-4">Shop</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/shop" className="text-mist hover:text-neon transition-colors">All gear</Link></li>
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link to={`/shop?cat=${c.id}`} className="text-mist hover:text-neon transition-colors">{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-white mb-4">Account</p>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/account" className="text-mist hover:text-neon transition-colors">Dashboard & orders</Link></li>
              <li><Link to="/wishlist" className="text-mist hover:text-neon transition-colors">Wishlist</Link></li>
              <li><Link to="/cart" className="text-mist hover:text-neon transition-colors">Cargo hold</Link></li>
              <li><Link to="/track" className="text-mist hover:text-neon transition-colors">Track a drop</Link></li>
              <li><Link to="/auth" className="text-mist hover:text-neon transition-colors">Sign in / register</Link></li>
              <li><Link to="/admin" className="text-mist hover:text-viol transition-colors">Mission control (admin)</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-white mb-4">Accepted channels</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["STRIPE", "HOUSE PAY", "ORBITAL", "Q-COIN"].map((m) => (
                <span key={m} className="px-3 py-1.5 glass rounded-md text-[10px] font-mono tracking-[0.18em] text-mist">
                  {m}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-mist/70 leading-relaxed">
              Payments encrypted end-to-end. Card data never touches our servers — processed by Stripe vault.
            </p>
          </div>
        </div>

        <div className="border-t hairline pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-mist/70">
          <p>© 2049 WEARLY HOUSE ATELIER · All timelines reserved.</p>
          <p className="font-mono tracking-[0.2em] uppercase">Prices in USD · Ships to 120+ sectors</p>
        </div>
      </div>
    </footer>
  );
}
