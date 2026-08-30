import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../lib/types";
import { useStore } from "../store/store";
import { cx, fmt } from "../lib/utils";
import { Stars, Tag } from "./ui";
import SmartImage from "./SmartImage";
import { IconCart, IconHeart } from "./icons";

export default function ProductCard({ product, layout = "grid", index = 0 }: { product: Product; layout?: "grid" | "list"; index?: number }) {
  const { wishlist, toggleWishlist, addToCart } = useStore();
  const nav = useNavigate();
  const wished = wishlist.includes(product.id);
  const out = product.stock === 0;

  const heart = (
    <motion.button
      whileTap={{ scale: 0.75 }}
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(product.id);
      }}
      aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
      className={cx(
        "absolute top-3 right-3 z-10 w-8 h-8 rounded-full glass flex items-center justify-center transition-colors",
        wished ? "text-rose2 border-rose2/50" : "text-mist hover:text-rose2"
      )}
    >
      <motion.span animate={wished ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.35 }}>
        <IconHeart size={15} filled={wished} />
      </motion.span>
    </motion.button>
  );

  const quickAdd = (
    <motion.button
      initial={false}
      whileTap={{ scale: 0.94 }}
      disabled={out}
      onClick={(e) => {
        e.preventDefault();
        addToCart(product.id, product.colors[0].name);
      }}
      className={cx(
        "flex items-center gap-2 px-4 py-2 text-xs font-display font-semibold tracking-wide clip-notch transition-all duration-300",
        out
          ? "bg-white/5 text-mist cursor-not-allowed"
          : "bg-gradient-to-r from-neon to-viol text-void hover:shadow-[0_0_28px_-6px_rgba(45,226,255,0.7)]"
      )}
    >
      <IconCart size={14} /> {out ? "Sold out" : "Quick add"}
    </motion.button>
  );

  if (layout === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5, delay: (index % 6) * 0.05 }}
      >
        <Link to={`/product/${product.slug}`} className="group glass glow-hover rounded-xl overflow-hidden flex flex-col sm:flex-row">
          <div className="relative sm:w-56 aspect-square sm:aspect-auto shrink-0 overflow-hidden">
            <SmartImage src={product.image} alt={product.name} eager={index < 3} className="absolute inset-0 transition-transform duration-700 group-hover:scale-110" />
            {product.tags[0] && (
              <span className="absolute top-3 left-3">
                <Tag tone={product.tags[0] === "Limited" ? "amber" : product.tags[0] === "New" ? "mint" : "viol"}>{product.tags[0]}</Tag>
              </span>
            )}
            {heart}
          </div>
          <div className="flex-1 p-5 flex flex-col gap-2 min-w-0">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon">{product.category}</span>
              <Stars value={product.rating} size={12} />
              <span className="text-[11px] text-mist font-mono">({product.ratingCount})</span>
            </div>
            <h3 className="font-display font-bold text-lg text-white group-hover:text-neon transition-colors leading-tight">{product.name}</h3>
            <p className="text-sm text-mist leading-relaxed line-clamp-2">{product.tagline} {product.description.slice(0, 90)}…</p>
            <div className="flex items-center justify-between mt-auto pt-3">
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-lg text-white">{fmt(product.price)}</span>
                {product.compareAt && <span className="font-mono text-xs text-mist line-through">{fmt(product.compareAt)}</span>}
              </div>
              {quickAdd}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 6) * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/product/${product.slug}`} className="group block glass glow-hover rounded-xl overflow-hidden h-full">
        <div className="relative aspect-square overflow-hidden">
          <SmartImage
            src={product.image}
            alt={product.name}
            eager={index < 4}
            className="w-full h-full transition-transform duration-700 ease-out group-hover:scale-[1.08]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent opacity-60" />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
            {product.tags.map((t, i) => (
              <Tag key={t} tone={t === "Limited" ? "amber" : t === "New" ? "mint" : i === 0 && t === "Flagship" ? "viol" : "neon"}>{t}</Tag>
            ))}
          </div>
          {heart}
          {product.compareAt && (
            <span className="absolute bottom-3 left-3 px-2 py-0.5 text-[10px] font-mono text-void bg-mint clip-notch">
              SAVE {fmt(product.compareAt - product.price)}
            </span>
          )}
          <div className="absolute bottom-0 inset-x-0 p-3 translate-y-[120%] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
            {quickAdd}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon/80">{product.category}</span>
            <span className="flex items-center gap-1.5">
              <Stars value={product.rating} size={11} />
              <span className="text-[10px] text-mist font-mono">{product.rating}</span>
            </span>
          </div>
          <h3 className="font-display font-semibold text-[15px] text-white group-hover:text-neon transition-colors leading-snug line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-white">{fmt(product.price)}</span>
              {product.compareAt && <span className="font-mono text-[11px] text-mist line-through">{fmt(product.compareAt)}</span>}
            </div>
            <span className={cx("flex items-center gap-1.5 text-[10px] font-mono", out ? "text-rose2" : product.stock <= 5 ? "text-amber2" : "text-mist")}>
              <span className={cx("w-1.5 h-1.5 rounded-full", out ? "bg-rose2" : product.stock <= 5 ? "bg-amber2 anim-pulse-dot" : "bg-mint")} />
              {out ? "Offline" : product.stock <= 5 ? `Low · ${product.stock}` : "In stock"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
