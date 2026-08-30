import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import { cx, fmt, dateFmt } from "../lib/utils";
import ProductCard from "../components/ProductCard";
import { NeonButton, QtyStepper, Reveal, Stars, StockMeter, Tag, Field, inputCls, SectionHead } from "../components/ui";
import { IconArrow, IconCart, IconCheck, IconChevron, IconCompare, IconHeart, IconShield, IconStar, IconThumb, IconTruck, IconZoom, IconBolt } from "../components/icons";

const VIEWS = [
  { label: "Unit", pos: "center", scale: 1 },
  { label: "Detail A", pos: "28% 38%", scale: 1.55 },
  { label: "Detail B", pos: "72% 62%", scale: 1.55 },
];

export default function ProductPage() {
  const { slug } = useParams();
  const nav = useNavigate();
  const products = useStore((s) => s.products);
  const reviews = useStore((s) => s.reviews);
  const { addToCart, toggleWishlist, wishlist, user, addReview, recordView, requestRestock, freeShipThreshold, toggleCompare, compare, voteHelpful } = useStore();

  const product = products.find((p) => p.slug === slug);
  const compared = product ? compare.includes(product.id) : false;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (product) recordView(product.id);
  }, [product?.id]);
  useEffect(() => {
    document.title = product ? `${product.name} — Wearly House` : "Unit not found — Wearly House";
  }, [product?.id]);

  const endOfDay = new Date();
  endOfDay.setUTCHours(23, 59, 59, 999);
  const remaining = Math.max(0, endOfDay.getTime() - now);
  const hh = String(Math.floor(remaining / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((remaining % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");

  const [view, setView] = useState(0);
  const [color, setColor] = useState(product?.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const [specOpen, setSpecOpen] = useState(true);

  const [rRating, setRRating] = useState(5);
  const [rTitle, setRTitle] = useState("");
  const [rBody, setRBody] = useState("");
  const [rErr, setRErr] = useState("");
  const [rHover, setRHover] = useState(0);
  const [notifyEmail, setNotifyEmail] = useState(user?.email ?? "");
  const [notified, setNotified] = useState(false);

  const prodReviews = useMemo(() => reviews.filter((r) => r.productId === product?.id), [reviews, product]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-40 pb-24 text-center">
        <p className="font-mono text-neon text-sm tracking-[0.3em] uppercase mb-3">404 // unit not found</p>
        <h1 className="font-display text-4xl font-bold text-white mb-4">This unit has left the timeline.</h1>
        <NeonButton onClick={() => nav("/shop")}>Return to catalog <IconArrow size={15} /></NeonButton>
      </div>
    );
  }

  const wished = wishlist.includes(product.id);
  const out = product.stock === 0;
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const fallbackRelated = related.length ? related : products.filter((p) => p.id !== product.id).slice(0, 4);

  const bundle = (() => {
    const sameCat = products.filter((p) => p.category === product.category && p.id !== product.id && p.stock > 0);
    const others = products
      .filter((p) => p.category !== product.category && p.id !== product.id && p.stock > 0)
      .sort((a, b) => b.ratingCount - a.ratingCount);
    return [...sameCat, ...others].slice(0, 2);
  })();
  const bundleTotal = bundle.reduce((a, p) => a + p.price, 0) + (product.stock > 0 ? product.price : 0);

  const dist = [5, 4, 3, 2, 1].map((star) => {
    const n = prodReviews.filter((r) => r.rating === star).length;
    return { star, n, pct: prodReviews.length ? (n / prodReviews.length) * 100 : 0 };
  });
  const avg = prodReviews.length
    ? prodReviews.reduce((a, r) => a + r.rating, 0) / prodReviews.length
    : product.rating;

  const currentView = VIEWS[view];

  const submitReview = () => {
    if (rTitle.trim().length < 3 || rBody.trim().length < 10) {
      setRErr("Give it a title (3+ chars) and a few words of signal (10+ chars).");
      return;
    }
    setRErr("");
    addReview(product.id, rRating, rTitle.trim(), rBody.trim());
    setRTitle("");
    setRBody("");
    setRRating(5);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
      {/* breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-mist mb-6 font-mono">
        <Link to="/" className="hover:text-neon transition-colors">HOME</Link>
        <IconChevron size={11} />
        <Link to="/shop" className="hover:text-neon transition-colors">SHOP</Link>
        <IconChevron size={11} />
        <Link to={`/shop?cat=${product.category}`} className="hover:text-neon transition-colors uppercase">{product.category}</Link>
        <IconChevron size={11} />
        <span className="text-fog truncate max-w-[180px]">{product.slug.toUpperCase()}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
        {/* ---------- gallery ---------- */}
        <div>
          <div
            className="relative glass rounded-2xl overflow-hidden aspect-square cursor-zoom-in group"
            onMouseEnter={() => setZooming(true)}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <motion.img
              key={view}
              initial={{ opacity: 0.4, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 ease-out"
              style={{
                objectPosition: currentView.pos,
                transform: `scale(${currentView.scale * (zooming ? 1.55 : 1)})`,
                transformOrigin: zooming ? origin : "center",
              }}
            />
            <div className="absolute top-4 left-4 flex flex-col gap-1.5 items-start">
              {product.tags.map((t) => (
                <Tag key={t} tone={t === "Limited" ? "amber" : t === "New" ? "mint" : t === "Flagship" ? "viol" : "neon"}>{t}</Tag>
              ))}
            </div>
            <span className="absolute bottom-4 right-4 glass rounded-full p-2.5 text-mist group-hover:text-neon transition-colors">
              <IconZoom size={16} />
            </span>
            {product.compareAt && (
              <span className="absolute bottom-4 left-4 px-2.5 py-1 text-[11px] font-mono text-void bg-mint clip-notch">
                SAVE {fmt(product.compareAt - product.price)}
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-4">
            {VIEWS.map((v, i) => (
              <button
                key={v.label}
                onClick={() => setView(i)}
                className={cx(
                  "relative w-24 h-24 rounded-xl overflow-hidden border transition-all",
                  view === i ? "border-neon shadow-[0_0_18px_-6px_rgba(45,226,255,0.6)]" : "border-white/10 opacity-60 hover:opacity-100"
                )}
                aria-label={`View: ${v.label}`}
              >
                <img src={product.image} alt="" className="w-full h-full object-cover" style={{ objectPosition: v.pos, transform: `scale(${v.scale})` }} />
                <span className="absolute bottom-0 inset-x-0 bg-void/70 text-[9px] font-mono uppercase tracking-wider text-fog py-0.5">{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ---------- buy panel ---------- */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-neon mb-3">{product.category} // {product.id.toUpperCase()}</p>
          <h1 className="font-display text-3xl md:text-[2.7rem] font-bold text-white leading-[1.02]">{product.name}</h1>
          <p className="text-mist mt-3 leading-relaxed">{product.tagline}</p>

          <button onClick={() => document.getElementById("reviews")?.scrollIntoView({ behavior: "smooth" })} className="flex items-center gap-2.5 mt-4 group">
            <Stars value={avg} />
            <span className="text-sm font-mono text-fog">{avg.toFixed(1)}</span>
            <span className="text-xs text-mist group-hover:text-neon transition-colors underline-offset-4 group-hover:underline">
              {prodReviews.length} field reports
            </span>
          </button>

          <div className="flex items-baseline gap-3 mt-6">
            <span className="font-mono text-4xl text-white">{fmt(product.price)}</span>
            {product.compareAt && <span className="font-mono text-lg text-mist line-through">{fmt(product.compareAt)}</span>}
          </div>

          <div className="mt-5 max-w-sm"><StockMeter stock={product.stock} /></div>

          {!out && (
            <div className="mt-4 inline-flex items-center gap-2.5 glass rounded-full px-4 py-2 border-amber2/30">
              <span className="w-1.5 h-1.5 rounded-full bg-amber2 anim-pulse-dot" />
              <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-amber2">
                Drop 07 closes in <span className="text-white tabular-nums">{hh}:{mm}:{ss}</span>
              </span>
            </div>
          )}

          {/* color */}
          <div className="mt-7">
            <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist mb-2.5">
              Finish — <span className="text-neon">{color}</span>
            </p>
            <div className="flex gap-2.5">
              {product.colors.map((c) => (
                <motion.button
                  key={c.name}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setColor(c.name)}
                  aria-label={`Color ${c.name}`}
                  className={cx(
                    "w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center",
                    color === c.name ? "border-neon shadow-[0_0_14px_-2px_rgba(45,226,255,0.6)]" : "border-white/15 hover:border-white/40"
                  )}
                  style={{ backgroundColor: c.hex }}
                >
                  {color === c.name && <span className="w-2 h-2 rounded-full bg-white" />}
                </motion.button>
              ))}
            </div>
          </div>

          {/* qty + actions */}
          <div className="flex flex-wrap items-center gap-3.5 mt-7">
            <QtyStepper qty={qty} max={Math.max(1, product.stock)} onChange={(q) => setQty(Math.max(1, q))} />
            <NeonButton disabled={out} onClick={() => addToCart(product.id, color, qty)} className="flex-1 min-w-[180px]">
              <IconCart size={16} /> {out ? "Sold out" : "Add to cargo"}
            </NeonButton>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleWishlist(product.id)}
              aria-label="Toggle wishlist"
              className={cx("w-12 h-12 glass rounded-lg flex items-center justify-center transition-colors", wished ? "text-rose2 border-rose2/50" : "text-mist hover:text-rose2")}
            >
              <IconHeart size={19} filled={wished} />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.85 }}
              onClick={() => toggleCompare(product.id)}
              aria-label="Toggle compare"
              title="Add to compare tray"
              className={cx(
                "w-12 h-12 glass rounded-lg flex items-center justify-center transition-all",
                compared ? "text-neon border-neon/60 shadow-[0_0_16px_-4px_rgba(45,226,255,0.6)]" : "text-mist hover:text-neon"
              )}
            >
              <IconCompare size={19} />
            </motion.button>
          </div>
          {!out && (
            <NeonButton
              variant="violet"
              className="w-full mt-3.5"
              onClick={() => {
                addToCart(product.id, color, qty);
                nav("/checkout");
              }}
            >
              <IconBolt size={16} /> Buy now — skip the queue
            </NeonButton>
          )}
          {out && (
            <div className="mt-3.5 glass rounded-xl p-4 border-amber2/30">
              <p className="text-sm text-white font-medium flex items-center gap-2">
                <IconBolt size={15} className="text-amber2" /> This unit is offline.
              </p>
              <p className="text-xs text-mist mt-1 mb-3">Leave an uplink and we'll ping you the moment it's back in orbit.</p>
              {notified ? (
                <p className="text-mint text-sm flex items-center gap-2"><IconCheck size={14} /> You're on the list — watch your inbox.</p>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    placeholder="you@station.io"
                    type="email"
                    aria-label="Email for restock alert"
                    className={inputCls()}
                  />
                  <button
                    onClick={() => {
                      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) return;
                      requestRestock(product.id, notifyEmail);
                      setNotified(true);
                    }}
                    className="shrink-0 px-4 rounded-md bg-gradient-to-r from-amber2 to-rose2 text-void text-xs font-display font-semibold clip-notch"
                  >Notify me</button>
                </div>
              )}
            </div>
          )}

          {/* trust strip */}
          <div className="grid grid-cols-2 gap-px bg-white/8 rounded-xl overflow-hidden mt-8 border hairline">
            {[
              { icon: <IconTruck size={17} />, t: `Free freight over ${fmt(freeShipThreshold)}` },
              { icon: <IconShield size={17} />, t: "2-year House warranty" },
              { icon: <IconBolt size={17} />, t: "Pairs instantly to grid" },
              { icon: <IconArrow size={17} />, t: "30-day timeline returns" },
            ].map((x) => (
              <div key={x.t} className="flex items-center gap-2.5 bg-abyss px-4 py-3 text-xs text-fog">
                <span className="text-neon shrink-0">{x.icon}</span> {x.t}
              </div>
            ))}
          </div>

          {/* bundle */}
          {bundle.length === 2 && (
            <div className="glass rounded-xl p-5 mt-6">
              <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-viol mb-4 flex items-center gap-2">
                <IconBolt size={13} /> Field kit — pairs with this unit
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {product.stock > 0 && (
                  <img src={product.image} alt="" className="w-14 h-14 rounded-lg object-cover border hairline opacity-90" />
                )}
                {bundle.map((b) => (
                  <div key={b.id} className="flex items-center gap-2.5">
                    <span className="text-mist font-mono text-lg">+</span>
                    <Link to={`/product/${b.slug}`} className="group flex items-center gap-2.5">
                      <img src={b.image} alt={b.name} className="w-14 h-14 rounded-lg object-cover border hairline group-hover:border-neon/50 transition-colors" />
                      <span className="hidden sm:block max-w-[110px]">
                        <span className="block text-xs text-white font-medium leading-tight group-hover:text-neon transition-colors">{b.name}</span>
                        <span className="block font-mono text-[11px] text-mist mt-0.5">{fmt(b.price)}</span>
                      </span>
                    </Link>
                  </div>
                ))}
                <div className="ml-auto text-right">
                  <p className="font-mono text-lg text-white">{fmt(bundleTotal)}</p>
                  <button
                    onClick={() => {
                      if (product.stock > 0) addToCart(product.id, color, 1);
                      bundle.forEach((b) => addToCart(b.id, b.colors[0].name, 1));
                    }}
                    className="mt-1.5 px-4 py-2 text-xs font-display font-semibold clip-notch bg-gradient-to-r from-neon to-viol text-void hover:shadow-[0_0_24px_-6px_rgba(45,226,255,0.7)] transition-shadow"
                  >
                    Add all {product.stock > 0 ? 3 : 2} to cargo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* description + specs */}
          <div className="mt-8 space-y-3">
            <button onClick={() => setSpecOpen(!specOpen)} className="w-full flex items-center justify-between glass rounded-xl px-5 py-4 hover:border-neon/40 transition-colors">
              <span className="font-display font-semibold text-white text-sm tracking-wide">Technical readout</span>
              <IconChevron size={16} className={cx("text-neon transition-transform duration-300", specOpen && "rotate-90")} />
            </button>
            <motion.div initial={false} animate={{ height: specOpen ? "auto" : 0, opacity: specOpen ? 1 : 0 }} className="overflow-hidden">
              <p className="text-sm text-mist leading-relaxed mb-4">{product.description}</p>
              <dl className="glass rounded-xl divide-y divide-white/5">
                {product.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-4 px-5 py-3 text-sm">
                    <dt className="text-mist font-mono text-xs uppercase tracking-wider self-center">{s.label}</dt>
                    <dd className="text-fog text-right">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ---------- reviews ---------- */}
      <section id="reviews" className="mt-20 scroll-mt-24">
        <SectionHead eyebrow="Field reports" title={<>Signal <span className="text-neon">verification</span></>} />
        <div className="grid lg:grid-cols-3 gap-6">
          {/* summary */}
          <div className="glass rounded-2xl p-6 h-fit lg:sticky lg:top-24">
            <p className="font-display text-5xl font-bold text-white">{avg.toFixed(1)}</p>
            <Stars value={avg} size={16} />
            <p className="text-xs text-mist mt-2 font-mono">{prodReviews.length} verified reports</p>
            <div className="space-y-2 mt-5">
              {dist.map((d) => (
                <div key={d.star} className="flex items-center gap-2.5 text-xs">
                  <span className="font-mono text-mist w-3">{d.star}</span>
                  <IconStar size={11} filled className="text-neon" />
                  <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} whileInView={{ width: `${d.pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.1 }} className="h-full bg-gradient-to-r from-neon to-viol rounded-full" />
                  </div>
                  <span className="font-mono text-mist w-5 text-right">{d.n}</span>
                </div>
              ))}
            </div>

            {/* add review */}
            <div className="border-t hairline mt-6 pt-5">
              {user ? (
                <div className="space-y-3">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist">Transmit your report</p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} onMouseEnter={() => setRHover(s)} onMouseLeave={() => setRHover(0)} onClick={() => setRRating(s)} aria-label={`${s} stars`}>
                        <IconStar size={20} filled={s <= (rHover || rRating)} className={s <= (rHover || rRating) ? "text-neon" : "text-white/15"} />
                      </button>
                    ))}
                  </div>
                  <input value={rTitle} onChange={(e) => setRTitle(e.target.value)} placeholder="Headline" className={inputCls()} />
                  <textarea value={rBody} onChange={(e) => setRBody(e.target.value)} rows={3} placeholder="What should other pilots know?" className={cx(inputCls(), "resize-none")} />
                  {rErr && <p className="text-rose2 text-xs">{rErr}</p>}
                  <NeonButton onClick={submitReview} className="w-full">Publish report</NeonButton>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-mist mb-3">Sign in to transmit a field report.</p>
                  <Link to="/auth" className="text-neon text-sm hover:underline underline-offset-4">Sign in →</Link>
                </div>
              )}
            </div>
          </div>

          {/* list */}
          <div className="lg:col-span-2 space-y-4">
            {prodReviews.length === 0 && (
              <div className="glass rounded-2xl p-10 text-center text-mist text-sm">No reports yet — be the first on this frequency.</div>
            )}
            {prodReviews.map((r, i) => (
              <Reveal key={r.id} delay={Math.min(i * 0.05, 0.3)}>
                <article className="glass glow-hover rounded-2xl p-5 md:p-6">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-full bg-gradient-to-br from-neon/30 to-viol/30 border border-white/10 flex items-center justify-center font-display font-bold text-white text-sm">
                        {r.userName.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-white">{r.userName}</p>
                        <p className="text-[11px] font-mono text-mist">{dateFmt(r.date)} · verified purchase</p>
                      </div>
                    </div>
                    <Stars value={r.rating} size={12} />
                  </div>
                  <h4 className="font-display font-semibold text-white mt-3.5">{r.title}</h4>
                  <p className="text-sm text-mist leading-relaxed mt-1.5">{r.body}</p>
                  <div className="mt-3.5 pt-3 border-t hairline flex items-center gap-2">
                    <button
                      onClick={() => voteHelpful(r.id)}
                      className="flex items-center gap-1.5 text-[11px] font-mono text-mist hover:text-neon transition-colors"
                    >
                      <IconThumb size={13} /> Helpful
                    </button>
                    {(r.helpful ?? 0) > 0 && (
                      <span className="text-[11px] font-mono text-neon/80 tabular-nums">· {r.helpful}</span>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- related ---------- */}
      <section className="mt-20">
        <SectionHead
          eyebrow="Adjacent tech"
          title={<>Pairs well <span className="text-viol">with</span></>}
          right={<Link to="/shop" className="text-sm text-mist hover:text-neon transition-colors">All gear →</Link>}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {fallbackRelated.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
