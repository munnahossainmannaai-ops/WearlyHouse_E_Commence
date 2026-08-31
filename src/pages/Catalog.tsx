import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/store";
import { CATEGORIES } from "../data/catalog";
import { cx, fmt, fuzzyMatch } from "../lib/utils";
import ProductCard from "../components/ProductCard";
import { Reveal } from "../components/ui";
import { IconClose, IconGrid, IconRows, IconSearch, IconChevron, IconAlert } from "../components/icons";

const SORTS = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price · low → high" },
  { id: "price-desc", label: "Price · high → low" },
  { id: "rating", label: "Top rated" },
];

export default function Catalog() {
  const products = useStore((s) => s.products);
  const [params, setParams] = useSearchParams();
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  const [sort, setSort] = useState("featured");
  const [price, setPrice] = useState<[number, number]>([0, 2000]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [saleOnly, setSaleOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const q = params.get("q") ?? "";
  const cat = params.get("cat") ?? "all";

  const PRICE_MAX = 2000;

  const setParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (cat !== "all" && p.category !== cat) return false;
      if (q && !fuzzyMatch(q, p.name + " " + p.tagline + " " + p.category + " " + p.tags.join(" "))) return false;
      if (p.price < price[0] || p.price > price[1]) return false;
      if (inStockOnly && p.stock === 0) return false;
      if (saleOnly && !p.compareAt) return false;
      if (minRating && p.rating < minRating) return false;
      return true;
    });
    switch (sort) {
      case "newest": list = [...list].sort((a, b) => b.createdAt - a.createdAt); break;
      case "price-asc": list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating": list = [...list].sort((a, b) => b.rating - a.rating); break;
      default: list = [...list].sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false) || b.ratingCount - a.ratingCount);
    }
    return list;
  }, [products, cat, q, price, inStockOnly, saleOnly, minRating, sort]);

  const activeFilters = (cat !== "all" ? 1 : 0) + (q ? 1 : 0) + (price[0] > 0 || price[1] < PRICE_MAX ? 1 : 0) + (inStockOnly ? 1 : 0) + (saleOnly ? 1 : 0) + (minRating ? 1 : 0);

  const clearAll = () => {
    setParams(new URLSearchParams(), { replace: true });
    setPrice([0, PRICE_MAX]);
    setInStockOnly(false);
    setSaleOnly(false);
    setMinRating(0);
  };

  const FilterPanel = (
    <div className="space-y-7">
      {/* categories */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist mb-3">Division</p>
        <div className="space-y-1">
          {[{ id: "all", name: "All units" }, ...CATEGORIES].map((c) => {
            const count = c.id === "all" ? products.length : products.filter((p) => p.category === c.id).length;
            const active = cat === c.id;
            return (
              <button
                key={c.id}
                onClick={() => setParam("cat", c.id === "all" ? null : c.id)}
                className={cx(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                  active ? "bg-neon/10 text-neon border border-neon/30" : "text-mist hover:text-white hover:bg-white/[0.04] border border-transparent"
                )}
              >
                <span>{c.name}</span>
                <span className="font-mono text-[11px]">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* rating */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist mb-3">Minimum rating</p>
        <div className="flex gap-2">
          {[{ v: 0, l: "Any" }, { v: 4, l: "4.0+" }, { v: 4.5, l: "4.5+" }].map((r) => (
            <button
              key={r.v}
              onClick={() => setMinRating(r.v)}
              className={cx(
                "flex-1 py-2 rounded-lg text-xs font-mono border transition-all",
                minRating === r.v ? "border-neon/50 text-neon bg-neon/10" : "border-white/10 text-mist hover:text-white"
              )}
            >
              {r.l}
            </button>
          ))}
        </div>
      </div>

      {/* price */}
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-mist mb-3">Price range</p>
        <div className="relative h-1.5 bg-white/10 rounded-full my-4">
          <div
            className="absolute h-full bg-gradient-to-r from-neon to-viol rounded-full"
            style={{ left: `${(price[0] / PRICE_MAX) * 100}%`, right: `${100 - (price[1] / PRICE_MAX) * 100}%` }}
          />
          <input
            type="range" min={0} max={PRICE_MAX} step={10} value={price[0]}
            onChange={(e) => setPrice([Math.min(Number(e.target.value), price[1] - 20), price[1]])}
            className="range-dual" aria-label="Minimum price"
          />
          <input
            type="range" min={0} max={PRICE_MAX} step={10} value={price[1]}
            onChange={(e) => setPrice([price[0], Math.max(Number(e.target.value), price[0] + 20)])}
            className="range-dual" aria-label="Maximum price"
          />
        </div>
        <div className="flex justify-between font-mono text-xs text-fog">
          <span>{fmt(price[0])}</span>
          <span>{price[1] >= PRICE_MAX ? `${fmt(PRICE_MAX)}+` : fmt(price[1])}</span>
        </div>
      </div>

      {/* toggles */}
      <div className="space-y-2.5">
        {[
          { label: "In stock only", v: inStockOnly, set: setInStockOnly },
          { label: "On sale", v: saleOnly, set: setSaleOnly },
        ].map((t) => (
          <button key={t.label} onClick={() => t.set(!t.v)} className="w-full flex items-center justify-between group">
            <span className="text-sm text-mist group-hover:text-white transition-colors">{t.label}</span>
            <span className={cx("w-9 h-5 rounded-full p-0.5 transition-colors", t.v ? "bg-gradient-to-r from-neon to-viol" : "bg-white/10")}>
              <motion.span layout className={cx("block w-4 h-4 rounded-full", t.v ? "bg-void translate-x-4" : "bg-mist")} />
            </span>
          </button>
        ))}
      </div>

      {activeFilters > 0 && (
        <button onClick={clearAll} className="w-full py-2.5 text-xs font-mono uppercase tracking-[0.18em] text-rose2 border border-rose2/30 rounded-lg hover:bg-rose2/10 transition-colors">
          Clear all filters ({activeFilters})
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
      {/* header */}
      <div className="relative overflow-hidden glass rounded-2xl px-6 py-8 md:px-10 mb-8">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute -right-24 -top-24 w-72 h-72 rounded-full bg-viol/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-2.5">Inventory // {filtered.length} units</p>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-white">The Catalog</h1>
          </div>
          <div className="flex items-center gap-2.5 glass rounded-full px-4 h-11 w-full md:w-80 focus-within:border-neon/50 transition-colors">
            <IconSearch size={16} className="text-mist shrink-0" />
            <input
              value={q}
              onChange={(e) => setParam("q", e.target.value || null)}
              placeholder="Filter units in real time…"
              className="bg-transparent outline-none text-sm w-full placeholder:text-mist/50"
            />
            {q && (
              <button onClick={() => setParam("q", null)} aria-label="Clear search" className="text-mist hover:text-rose2">
                <IconClose size={14} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-8">
        {/* sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="sticky top-24 glass rounded-2xl p-5">{FilterPanel}</div>
        </aside>

        {/* results */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-3 mb-5">
            <button
              onClick={() => setFiltersOpen(true)}
              className="lg:hidden flex items-center gap-2 glass rounded-full px-4 h-9 text-xs font-mono uppercase tracking-wider text-fog"
            >
              Filters {activeFilters > 0 && <span className="text-neon">({activeFilters})</span>}
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-panel border border-white/10 rounded-full h-9 px-3.5 text-xs text-fog outline-none focus:border-neon/50 cursor-pointer"
                aria-label="Sort products"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id} className="bg-panel">{s.label}</option>
                ))}
              </select>
              <div className="flex glass rounded-full p-1">
                {([["grid", IconGrid], ["list", IconRows]] as const).map(([id, Ic]) => (
                  <button
                    key={id}
                    onClick={() => setLayout(id)}
                    aria-label={`${id} view`}
                    className={cx("w-8 h-7 rounded-full flex items-center justify-center transition-all", layout === id ? "bg-gradient-to-r from-neon to-viol text-void" : "text-mist hover:text-white")}
                  >
                    <Ic size={14} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="glass rounded-2xl py-20 text-center">
              <IconAlert size={34} className="mx-auto text-mist mb-4" />
              <p className="font-display text-xl font-bold text-white">No units on this frequency</p>
              <p className="text-sm text-mist mt-2 mb-6">Loosen the filters or re-tune your search.</p>
              <button onClick={clearAll} className="px-5 py-2.5 bg-gradient-to-r from-neon to-viol text-void text-xs font-display font-bold clip-notch">
                Reset filters
              </button>
            </div>
          ) : (
            <motion.div layout className={cx(layout === "grid" ? "grid grid-cols-2 xl:grid-cols-3 gap-4" : "space-y-4")}>
              <AnimatePresence mode="popLayout">
                {filtered.map((p, i) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ProductCard product={p} layout={layout} index={i} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>

      {/* mobile filters */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div className="fixed inset-0 z-[90] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={() => setFiltersOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="absolute left-0 top-0 bottom-0 w-[82%] max-w-xs glass border-r hairline p-5 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-display font-bold text-white">Filters</span>
                <button onClick={() => setFiltersOpen(false)} aria-label="Close filters" className="text-mist hover:text-white">
                  <IconClose size={20} />
                </button>
              </div>
              {FilterPanel}
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full mt-6 py-3 bg-gradient-to-r from-neon to-viol text-void text-xs font-display font-bold clip-notch flex items-center justify-center gap-2"
              >
                Show {filtered.length} units <IconChevron size={14} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Reveal className="mt-14">
        <p className="text-center text-[11px] font-mono tracking-[0.25em] uppercase text-mist/60">
          End of inventory · {products.length} units catalogued
        </p>
      </Reveal>
    </div>
  );
}
