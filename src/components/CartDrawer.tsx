import { AnimatePresence, motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { cartCount, cartSubtotal, useStore } from "../store/store";
import { fmt } from "../lib/utils";
import { QtyStepper, NeonButton } from "./ui";
import { IconCart, IconClose, IconTrash, IconArrow } from "./icons";

export default function CartDrawer() {
  const { cart, products, cartOpen, setCartOpen, setQty, removeFromCart } = useStore();
  const nav = useNavigate();
  const subtotal = cartSubtotal(cart, products);

  const rows = cart.flatMap((c) => {
    const p = products.find((x) => x.id === c.productId);
    return p ? [{ ...c, product: p }] : [];
  });

  return (
    <AnimatePresence>
      {cartOpen && (
        <div className="fixed inset-0 z-[95]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-void/70 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: "105%" }}
            animate={{ x: 0 }}
            exit={{ x: "105%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-md glass border-l hairline flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b hairline shrink-0">
              <h2 className="font-display font-bold text-white tracking-wide flex items-center gap-2.5">
                <IconCart size={18} className="text-neon" />
                CARGO HOLD
                <span className="text-[11px] font-mono text-mist">({cartCount(cart)})</span>
              </h2>
              <button onClick={() => setCartOpen(false)} aria-label="Close cart" className="text-mist hover:text-neon transition-colors">
                <IconClose size={20} />
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="w-20 h-20 rounded-full border border-dashed border-white/15 flex items-center justify-center">
                  <IconCart size={28} className="text-mist" />
                </div>
                <p className="font-display font-semibold text-white">Hold is empty</p>
                <p className="text-sm text-mist">Scan the catalog and load up some future-grade hardware.</p>
                <NeonButton onClick={() => { setCartOpen(false); nav("/shop"); }}>
                  Browse catalog <IconArrow size={15} />
                </NeonButton>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                  <AnimatePresence initial={false}>
                    {rows.map((r) => (
                      <motion.div
                        key={r.productId + r.color}
                        layout
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 40 }}
                        className="flex gap-3.5 glass rounded-xl p-3"
                      >
                        <Link to={`/product/${r.product.slug}`} onClick={() => setCartOpen(false)} className="shrink-0">
                          <img src={r.product.image} alt={r.product.name} className="w-20 h-20 object-cover rounded-lg border hairline" />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <Link to={`/product/${r.product.slug}`} onClick={() => setCartOpen(false)} className="text-sm font-semibold text-white hover:text-neon transition-colors leading-snug line-clamp-2">
                              {r.product.name}
                            </Link>
                            <button
                              onClick={() => removeFromCart(r.productId, r.color)}
                              aria-label="Remove item"
                              className="text-mist hover:text-rose2 transition-colors shrink-0 mt-0.5"
                            >
                              <IconTrash size={15} />
                            </button>
                          </div>
                          <p className="text-[11px] text-mist font-mono uppercase tracking-wider mt-0.5">{r.color}</p>
                          <div className="flex items-center justify-between mt-2.5">
                            <QtyStepper small qty={r.qty} max={r.product.stock} onChange={(q) => setQty(r.productId, r.color, q)} />
                            <span className="font-mono text-sm text-neon">{fmt(r.product.price * r.qty)}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="border-t hairline px-6 py-5 shrink-0 space-y-3 bg-abyss/60">
                  <div className="flex justify-between text-sm">
                    <span className="text-mist">Subtotal</span>
                    <span className="font-mono text-white">{fmt(subtotal)}</span>
                  </div>
                  <p className="text-[11px] text-mist/70">Shipping + promos calculated at checkout.</p>
                  <NeonButton
                    className="w-full"
                    onClick={() => {
                      setCartOpen(false);
                      nav("/checkout");
                    }}
                  >
                    Initiate checkout <IconArrow size={15} />
                  </NeonButton>
                  <button
                    onClick={() => { setCartOpen(false); nav("/cart"); }}
                    className="w-full text-center text-xs text-mist hover:text-neon transition-colors"
                  >
                    View full cart →
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
