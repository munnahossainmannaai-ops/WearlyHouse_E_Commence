import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/store";
import { cx, fmt } from "../lib/utils";
import { IconArrow, IconBolt, IconBox, IconCart, IconGrid, IconHeart, IconSearch, IconUser } from "./icons";

interface Cmd {
  id: string;
  group: string;
  label: string;
  hint?: string;
  icon: ReactNode;
  run: () => void;
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();

  const { products, user, addToCart, setCartOpen } = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onEvt = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("nova:palette", onEvt);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("nova:palette", onEvt);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setTimeout(() => inputRef.current?.focus(), 30);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const close = () => setOpen(false);
  const go = (fn: () => void) => () => { close(); fn(); };

  const commands = useMemo<Cmd[]>(() => {
    const t = q.trim().toLowerCase();
    const navs: Cmd[] = [
      { id: "n-home", group: "Navigate", label: "Home base", hint: "/", icon: <IconBolt size={15} />, run: go(() => nav("/")) },
      { id: "n-shop", group: "Navigate", label: "Full catalog", hint: "10 units", icon: <IconGrid size={15} />, run: go(() => nav("/shop")) },
      { id: "n-cart", group: "Navigate", label: "Cargo hold", hint: "cart", icon: <IconCart size={15} />, run: go(() => nav("/cart")) },
      { id: "n-wish", group: "Navigate", label: "Wishlist", hint: "pinned", icon: <IconHeart size={15} />, run: go(() => nav("/wishlist")) },
      { id: "n-acct", group: "Navigate", label: user ? "Operator dashboard" : "Sign in / register", hint: "account", icon: <IconUser size={15} />, run: go(() => nav(user ? "/account" : "/auth")) },
      ...(user?.role === "admin"
        ? [{ id: "n-admin", group: "Navigate", label: "Mission control", hint: "admin", icon: <IconBox size={15} />, run: go(() => nav("/admin")) }]
        : []),
      { id: "a-cart", group: "Actions", label: "Open cargo drawer", icon: <IconCart size={15} />, run: go(() => setCartOpen(true)) },
    ];

    const matchedNavs = t ? navs.filter((n) => (n.label + " " + (n.hint ?? "")).toLowerCase().includes(t)) : navs;

    const prodCmds: Cmd[] = products
      .filter((p) => !t || (p.name + " " + p.category + " " + p.tags.join(" ")).toLowerCase().includes(t))
      .slice(0, t ? 6 : 4)
      .flatMap((p) => [
        {
          id: `p-${p.id}`,
          group: "Units",
          label: p.name,
          hint: fmt(p.price),
          icon: <img src={p.image} alt="" className="w-5 h-5 rounded object-cover border hairline" />,
          run: go(() => nav(`/product/${p.slug}`)),
        },
        {
          id: `pa-${p.id}`,
          group: "Quick add",
          label: `Add ${p.name.split(" ").slice(0, 2).join(" ")} to cargo`,
          hint: p.stock === 0 ? "sold out" : `${p.stock} in stock`,
          icon: <IconCart size={15} />,
          run: go(() => (p.stock > 0 ? addToCart(p.id, p.colors[0].name) : undefined)),
        },
      ]);

    return [...matchedNavs, ...prodCmds];
  }, [q, products, user]);

  useEffect(() => setIdx(0), [q]);

  useEffect(() => {
    const el = listRef.current?.children[idx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setIdx((i) => Math.min(commands.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
    else if (e.key === "Enter" && commands[idx]) { e.preventDefault(); commands[idx].run(); }
    else if (e.key === "Escape") close();
  };

  let lastGroup = "";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[98] flex items-start justify-center pt-[12vh] px-4"
        >
          <div className="absolute inset-0 bg-void/75 backdrop-blur-md" onClick={close} />
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className="relative w-full max-w-xl glass rounded-2xl overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,0.9),0_0_50px_-20px_rgba(45,226,255,0.35)]"
          >
            {/* console header */}
            <div className="flex items-center gap-3 px-5 border-b hairline">
              <IconSearch size={16} className="text-neon shrink-0" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Query the grid — units, sectors, actions…"
                className="flex-1 h-14 bg-transparent outline-none text-[15px] text-white placeholder:text-mist/50"
              />
              <kbd className="hidden sm:block text-[10px] font-mono text-mist border border-white/12 rounded px-1.5 py-0.5">ESC</kbd>
            </div>

            <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
              {commands.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-mist">
                  No signal matches <span className="text-neon font-mono">"{q}"</span>.
                </p>
              )}
              {commands.map((c, i) => {
                const showGroup = c.group !== lastGroup;
                lastGroup = c.group;
                return (
                  <div key={c.id}>
                    {showGroup && (
                      <p className="px-3 pt-3 pb-1.5 text-[9px] font-mono uppercase tracking-[0.3em] text-mist/60">{c.group}</p>
                    )}
                    <button
                      onMouseEnter={() => setIdx(i)}
                      onClick={c.run}
                      className={cx(
                        "w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-left transition-all duration-150",
                        i === idx ? "bg-gradient-to-r from-neon/15 to-viol/10 border border-neon/25" : "border border-transparent hover:bg-white/[0.04]"
                      )}
                    >
                      <span className={cx("w-7 h-7 rounded-md flex items-center justify-center shrink-0 border", i === idx ? "border-neon/40 text-neon bg-neon/10" : "border-white/10 text-mist")}>
                        {c.icon}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cx("block text-sm truncate", i === idx ? "text-white font-medium" : "text-fog")}>{c.label}</span>
                      </span>
                      {c.hint && <span className="text-[10px] font-mono text-mist shrink-0">{c.hint}</span>}
                      {i === idx && <IconArrow size={13} className="text-neon shrink-0" />}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-4 px-5 py-2.5 border-t hairline bg-abyss/60">
              {[["↑↓", "navigate"], ["↵", "execute"], ["⌘K", "toggle"]].map(([k, l]) => (
                <span key={k} className="flex items-center gap-1.5 text-[10px] font-mono text-mist/70">
                  <kbd className="border border-white/12 rounded px-1 py-px text-mist">{k}</kbd> {l}
                </span>
              ))}
              <span className="ml-auto text-[10px] font-mono tracking-[0.25em] uppercase text-neon/60">nova//console</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
