import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/store";
import { cx, fmt } from "../lib/utils";
import { Modal, NeonButton, Stars } from "./ui";
import { IconCart, IconClose, IconCompare } from "./icons";
import { Link } from "react-router-dom";

export default function CompareDrawer() {
  const { compare, products, toggleCompare, clearCompare, addToCart } = useStore();
  const [open, setOpen] = useState(false);

  const units = useMemo(
    () => compare.flatMap((id) => {
      const p = products.find((x) => x.id === id);
      return p ? [p] : [];
    }),
    [compare, products]
  );

  const specLabels = useMemo(() => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const u of units)
      for (const s of u.specs)
        if (!seen.has(s.label)) {
          seen.add(s.label);
          out.push(s.label);
        }
    return out;
  }, [units]);

  return (
    <>
      {/* dock */}
      <AnimatePresence>
        {units.length > 0 && (
          <motion.div
            initial={{ y: 90, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 90, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="fixed bottom-4 inset-x-4 z-[80] max-w-2xl mx-auto"
          >
            <div className="glass rounded-2xl shadow-[0_18px_60px_-18px_rgba(0,0,0,0.8)] border-neon/25 flex items-center gap-3 px-4 py-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon/20 to-viol/20 border hairline flex items-center justify-center text-neon shrink-0">
                <IconCompare size={17} />
              </span>
              <div className="flex -space-x-3 shrink-0">
                {units.map((u) => (
                  <span key={u.id} className="relative group">
                    <img src={u.image} alt={u.name} className="w-10 h-10 rounded-lg object-cover border-2 border-abyss" />
                    <button
                      onClick={() => toggleCompare(u.id)}
                      aria-label={`Remove ${u.name} from compare`}
                      className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-rose2 text-void hidden group-hover:flex items-center justify-center"
                      style={{ width: 18, height: 18 }}
                    >
                      <IconClose size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <p className="text-xs text-mist font-mono hidden sm:block flex-1 truncate">
                {units.length}/3 loaded · {units.map((u) => u.name.split(" ")[0]).join(" vs ")}
              </p>
              <div className="flex-1 sm:flex-none" />
              <button onClick={clearCompare} className="text-[11px] font-mono uppercase tracking-wider text-mist hover:text-rose2 transition-colors">
                Clear
              </button>
              <NeonButton onClick={() => setOpen(true)} disabled={units.length < 2} className="!px-4 !py-2 text-xs">
                Compare {units.length >= 2 ? `(${units.length})` : "— pick 2+"}
              </NeonButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* spec table */}
      <Modal open={open} onClose={() => setOpen(false)} wide>
        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-2">Side by side</p>
        <h3 className="font-display text-2xl font-bold text-white mb-6">Spec face-off</h3>
        <div className="overflow-x-auto no-scrollbar -mx-2 px-2">
          <table className="w-full min-w-[560px] border-separate" style={{ borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="w-32" />
                {units.map((u) => (
                  <th key={u.id} className="text-left pb-4 px-2 align-bottom">
                    <div className="relative group inline-block">
                      <img src={u.image} alt={u.name} className="w-full max-w-[180px] aspect-square object-cover rounded-xl border hairline" />
                      <button
                        onClick={() => { toggleCompare(u.id); if (units.length <= 2) setOpen(false); }}
                        aria-label={`Remove ${u.name}`}
                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-void/70 border hairline text-mist hover:text-rose2 flex items-center justify-center"
                      >
                        <IconClose size={12} />
                      </button>
                    </div>
                    <Link to={`/product/${u.slug}`} onClick={() => setOpen(false)} className="block font-display font-semibold text-white text-sm mt-3 hover:text-neon transition-colors leading-snug">
                      {u.name}
                    </Link>
                    <span className="flex items-center gap-2 mt-1">
                      <Stars value={u.rating} size={11} />
                      <span className="text-[10px] font-mono text-mist">{u.rating}</span>
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row label="Price">
                {units.map((u) => (
                  <td key={u.id} className="px-2 py-2.5 text-sm">
                    <span className="font-mono text-neon">{fmt(u.price)}</span>
                    {u.compareAt && <span className="font-mono text-[10px] text-mist line-through ml-2">{fmt(u.compareAt)}</span>}
                  </td>
                ))}
              </Row>
              <Row label="Division">
                {units.map((u) => <td key={u.id} className="px-2 py-2.5 text-xs text-fog capitalize">{u.category}</td>)}
              </Row>
              <Row label="Availability">
                {units.map((u) => (
                  <td key={u.id} className="px-2 py-2.5">
                    <span className={cx("text-[11px] font-mono flex items-center gap-1.5 w-fit", u.stock === 0 ? "text-rose2" : u.stock <= 5 ? "text-amber2" : "text-mint")}>
                      <span className={cx("w-1.5 h-1.5 rounded-full", u.stock === 0 ? "bg-rose2" : u.stock <= 5 ? "bg-amber2" : "bg-mint")} />
                      {u.stock === 0 ? "Sold out" : `${u.stock} in stock`}
                    </span>
                  </td>
                ))}
              </Row>
              <Row label="Finishes">
                {units.map((u) => (
                  <td key={u.id} className="px-2 py-2.5">
                    <span className="flex gap-1.5">
                      {u.colors.map((c) => (
                        <span key={c.name} title={c.name} className="w-4 h-4 rounded-full border border-white/25" style={{ background: c.hex }} />
                      ))}
                    </span>
                  </td>
                ))}
              </Row>
              {specLabels.map((label, ri) => (
                <Row key={label} label={label} alt={ri % 2 === 0}>
                  {units.map((u) => {
                    const v = u.specs.find((s) => s.label === label)?.value;
                    return (
                      <td key={u.id} className={cx("px-2 py-2.5 text-xs", v ? "text-fog" : "text-mist/40")}>
                        {v ?? "—"}
                      </td>
                    );
                  })}
                </Row>
              ))}
              <tr>
                <td />
                {units.map((u) => (
                  <td key={u.id} className="px-2 pt-4">
                    <button
                      disabled={u.stock === 0}
                      onClick={() => addToCart(u.id, u.colors[0].name)}
                      className={cx(
                        "flex items-center gap-2 px-3.5 py-2 text-xs font-display font-semibold clip-notch transition-all",
                        u.stock === 0
                          ? "bg-white/5 text-mist cursor-not-allowed"
                          : "bg-gradient-to-r from-neon to-viol text-void hover:shadow-[0_0_24px_-6px_rgba(45,226,255,0.7)]"
                      )}
                    >
                      <IconCart size={13} /> {u.stock === 0 ? "Offline" : "Add"}
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}

function Row({ label, children, alt }: { label: string; children: React.ReactNode; alt?: boolean }) {
  return (
    <tr className={alt ? "bg-white/[0.02]" : ""}>
      <td className="px-2 py-2.5 text-[10px] font-mono uppercase tracking-[0.18em] text-mist align-top pt-3">{label}</td>
      {children}
    </tr>
  );
}
