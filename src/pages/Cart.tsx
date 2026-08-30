import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cartCount, cartSubtotal, useStore } from "../store/store";
import { fmt } from "../lib/utils";
import { NeonButton, QtyStepper, Field, inputCls } from "../components/ui";
import { SHIPPING_METHODS } from "../data/catalog";
import { IconArrow, IconCart, IconCheck, IconTrash } from "../components/icons";

export default function CartPage() {
  const { cart, products, setQty, removeFromCart, clearCart, promos, freeShipThreshold, redeemPromo } = useStore();
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const activePromos = promos.filter((p) => p.active);
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [promoErr, setPromoErr] = useState("");

  const subtotal = cartSubtotal(cart, products);
  const rows = cart.flatMap((c) => {
    const p = products.find((x) => x.id === c.productId);
    return p ? [{ ...c, product: p }] : [];
  });
  const freeShip = subtotal >= freeShipThreshold;
  const shipCost = rows.length === 0 ? 0 : freeShip ? 0 : SHIPPING_METHODS[1].cost;
  const discount = applied
    ? Math.round(subtotal * ((activePromos.find((p) => p.code === applied)?.pct ?? 0) / 100))
    : 0;

  const applyPromo = () => {
    const code = promo.trim().toUpperCase();
    const found = activePromos.find((p) => p.code === code);
    if (found) {
      setApplied(code);
      setPromoErr("");
      redeemPromo(code);
      toast("success", `Code ${code} locked in`, `-${found.pct}% on hardware.`);
    } else {
      setPromoErr("Unknown code. Try NEON10.");
    }
  };

  if (rows.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-40 pb-24 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 mx-auto rounded-full border border-dashed border-white/15 flex items-center justify-center mb-6">
          <IconCart size={36} className="text-mist" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-white">Cargo hold is empty</h1>
        <p className="text-mist mt-3 max-w-sm mx-auto">Nothing loaded for transport. Scan the catalog and secure some hardware before the next drop lands.</p>
        <NeonButton className="mt-8" onClick={() => nav("/shop")}>Browse the catalog <IconArrow size={15} /></NeonButton>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-2">Transport manifest</p>
          <h1 className="font-display text-4xl font-bold text-white">Cargo Hold</h1>
        </div>
        <button onClick={() => { clearCart(); toast("info", "Hold cleared", "All units released."); }} className="text-xs font-mono uppercase tracking-wider text-mist hover:text-rose2 transition-colors">
          Clear all
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.div
                key={r.productId + r.color}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="glass glow-hover rounded-2xl p-4 flex gap-4 items-center"
              >
                <Link to={`/product/${r.product.slug}`} className="shrink-0">
                  <img src={r.product.image} alt={r.product.name} className="w-24 h-24 md:w-28 md:h-28 object-cover rounded-xl border hairline" />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/product/${r.product.slug}`} className="font-display font-semibold text-white hover:text-neon transition-colors leading-snug line-clamp-1">
                        {r.product.name}
                      </Link>
                      <p className="text-[11px] font-mono uppercase tracking-wider text-mist mt-1">Finish · {r.color}</p>
                    </div>
                    <button onClick={() => removeFromCart(r.productId, r.color)} aria-label="Remove" className="text-mist hover:text-rose2 transition-colors shrink-0">
                      <IconTrash size={16} />
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 mt-3">
                    <QtyStepper qty={r.qty} max={r.product.stock} onChange={(q) => setQty(r.productId, r.color, q)} />
                    <div className="text-right">
                      <p className="font-mono text-white">{fmt(r.product.price * r.qty)}</p>
                      {r.qty > 1 && <p className="text-[10px] font-mono text-mist">{fmt(r.product.price)} / unit</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="h-fit lg:sticky lg:top-24 space-y-4">
          <div className="glass rounded-2xl p-6">
            <h3 className="font-display font-bold text-white mb-5">Order readout</h3>

            {/* free freight progress */}
            <div className="mb-5">
              <div className="flex justify-between text-[10px] font-mono uppercase tracking-[0.15em] mb-1.5">
                <span className={freeShip ? "text-mint" : "text-mist"}>{freeShip ? "Free orbital freight unlocked" : "Orbital freight progress"}</span>
                <span className={freeShip ? "text-mint" : "text-neon"}>{freeShip ? "100%" : `${Math.min(100, Math.round((subtotal / 150) * 100))}%`}</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${Math.min(100, (subtotal / 150) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 90, damping: 20 }}
                  className="h-full rounded-full bg-gradient-to-r from-neon to-viol shadow-[0_0_10px_rgba(45,226,255,0.6)]"
                />
              </div>
              {!freeShip && (
                <p className="text-[10px] text-mist mt-1.5">Add <span className="text-neon font-mono">{fmt(150 - subtotal)}</span> more to unlock free freight.</p>
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-mist">Units ({cartCount(cart)})</span><span className="font-mono text-fog">{fmt(subtotal)}</span></div>
              <div className="flex justify-between">
                <span className="text-mist">Freight</span>
                <span className="font-mono">{freeShip ? <span className="text-mint">FREE</span> : fmt(shipCost)}</span>
              </div>
              {applied && (
                <div className="flex justify-between text-mint"><span>Promo {applied}</span><span className="font-mono">-{fmt(discount)}</span></div>
              )}
              <div className="border-t hairline pt-3 flex justify-between items-baseline">
                <span className="text-white font-semibold">Total</span>
                <span className="font-mono text-2xl text-neon">{fmt(Math.max(0, subtotal - discount) + shipCost)}</span>
              </div>
            </div>

            <div className="mt-5">
              <Field label="Promo code">
                <div className="flex gap-2">
                  <input
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && applyPromo()}
                    placeholder="NEON10"
                    disabled={!!applied}
                    className={inputCls(promoErr) + " uppercase disabled:opacity-50"}
                  />
                  <button
                    onClick={applyPromo}
                    disabled={!!applied}
                    className="shrink-0 px-4 rounded-md border border-neon/40 text-neon text-xs font-mono uppercase tracking-wider hover:bg-neon/10 transition-colors disabled:opacity-40"
                  >
                    {applied ? <IconCheck size={14} /> : "Apply"}
                  </button>
                </div>
              </Field>
              {promoErr && <p className="text-rose2 text-xs mt-1.5">{promoErr}</p>}
              {applied && <p className="text-mint text-xs mt-1.5">Code active — discount locked.</p>}
            </div>

            <NeonButton className="w-full mt-6" onClick={() => nav("/checkout")}>
              Initiate checkout <IconArrow size={15} />
            </NeonButton>
            <Link to="/shop" className="block text-center text-xs text-mist hover:text-neon transition-colors mt-3.5">
              ← Continue scanning
            </Link>
          </div>

          <div className="glass rounded-2xl p-5 text-xs text-mist leading-relaxed">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon mb-2">Freight note</p>
            {freeShip
              ? "Your manifest qualifies for free orbital freight. Nice."
              : `Add ${fmt(freeShipThreshold - subtotal)} more to unlock free orbital freight.`}
          </div>
        </div>
      </div>
    </div>
  );
}
