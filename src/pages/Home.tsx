import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useStore } from "../store/store";
import { CATEGORIES, TESTIMONIALS } from "../data/catalog";
import { fmt } from "../lib/utils";
import { Counter, NeonButton, Reveal, SectionHead, Stars, useScramble } from "../components/ui";
import ProductCard from "../components/ProductCard";
import { IconArrow, IconBolt, IconChevron, IconOrbit, IconShield, IconSpark, IconTruck } from "../components/icons";

const MARQUEE = [
  "FREE ORBITAL FREIGHT OVER $150",
  "30-DAY RETURN WINDOW",
  "2-YEAR WARRANTY ON ALL UNITS",
  "8K SUPPORT UPLINK · 24/7",
  "DROP 07 LIVE NOW",
  "CARBON-NEUTRAL RE-ENTRY",
];

export default function Home() {
  const products = useStore((s) => s.products);
  const addToCart = useStore((s) => s.addToCart);
  const nav = useNavigate();

  const flagship = products.find((p) => p.id === "p-halo-x1") ?? products[0];
  const trending = [...products].sort((a, b) => b.ratingCount - a.ratingCount);
  const recentlyViewed = useStore((s) => s.recentlyViewed);
  const recentlyScanned = recentlyViewed
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .slice(0, 4);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroImgY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroTextY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  const tiltX = useSpring(0, { stiffness: 120, damping: 18 });
  const tiltY = useSpring(0, { stiffness: 120, damping: 18 });
  const onMove = (e: React.MouseEvent) => {
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    tiltX.set(((e.clientY - r.top) / r.height - 0.5) * -10);
    tiltY.set(((e.clientX - r.left) / r.width - 0.5) * 12);
  };

  const line1 = useScramble("WEAR");
  const line2 = useScramble("THE NEAR FUTURE");

  const carouselRef = useRef<HTMLDivElement>(null);
  const scrollCarousel = (dir: 1 | -1) =>
    carouselRef.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  const catImage = (id: string) => products.find((p) => p.category === id)?.image ?? "";
  const catCount = (id: string) => products.filter((p) => p.category === id).length;

  const featuredTiles: { id: string; span: string }[] = [
    { id: "audio", span: "md:col-span-2 md:row-span-2" },
    { id: "wearables", span: "md:col-span-1 md:row-span-2" },
    { id: "robotics", span: "md:col-span-1" },
    { id: "immersive", span: "md:col-span-1" },
    { id: "peripherals", span: "md:col-span-1" },
    { id: "apparel", span: "md:col-span-1" },
  ];

  return (
    <div className="relative">
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative min-h-[100svh] flex items-center overflow-hidden pt-16">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -top-40 -left-40 w-[34rem] h-[34rem] rounded-full bg-neon/12 blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-48 -right-32 w-[36rem] h-[36rem] rounded-full bg-viol/14 blur-[140px] pointer-events-none" />
        <div className="scanline" />

        <p className="hidden xl:block absolute left-5 top-1/2 -translate-y-1/2 font-mono text-[10px] tracking-[0.5em] text-mist/50 uppercase [writing-mode:vertical-rl] rotate-180">
          Established 2049 — Low Earth Orbit
        </p>

        <div className="max-w-7xl mx-auto px-4 md:px-6 w-full grid lg:grid-cols-2 gap-12 lg:gap-6 items-center py-16">
          <motion.div style={{ y: heroTextY }} className="relative z-10">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2.5 glass rounded-full px-4 py-1.5 mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-mint anim-pulse-dot" />
              <span className="font-mono text-[11px] tracking-[0.3em] uppercase text-fog">Drop 07 // Now live</span>
            </motion.p>

            <h1 className="font-display font-bold leading-[0.98] text-white">
              <span className="block text-5xl md:text-7xl xl:text-[5.2rem] tracking-tight">{line1 || "\u00A0"}</span>
              <span className="block text-5xl md:text-7xl xl:text-[5.2rem] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-neon via-[#3db8dd] to-viol text-glow">
                {line2 || "\u00A0"}
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-mist text-base md:text-lg leading-relaxed max-w-md mt-6"
            >
              Future-wear and hardware, cut before their time. Levitating audio, haptic couture,
              autonomous machines — tested in orbit, delivered to your door.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65 }}
              className="flex flex-wrap gap-3.5 mt-8"
            >
              <NeonButton onClick={() => nav("/shop")}>
                Shop the drop <IconArrow size={16} />
              </NeonButton>
              <NeonButton variant="ghost" onClick={() => nav(`/product/${flagship.slug}`)}>
                Meet the {flagship.name.split(" ")[0]} X1
              </NeonButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-x-10 gap-y-4 mt-12"
            >
              {[
                { v: <Counter to={24} suffix="k+" />, l: "clients outfitted" },
                { v: <Counter to={120} suffix="+" />, l: "sectors shipped" },
                { v: <><Counter to={48} prefix="" suffix="" /><span className="text-neon">/10</span></>, l: "avg. rating ×10" },
              ].map((s) => (
                <div key={s.l}>
                  <p className="font-display text-3xl font-bold text-white">{s.v}</p>
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist mt-1">{s.l}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* hero product */}
          <motion.div
            style={{ y: heroImgY }}
            onMouseMove={onMove}
            onMouseLeave={() => { tiltX.set(0); tiltY.set(0); }}
            className="relative z-10 flex items-center justify-center"
          >
            <div className="relative w-[min(88vw,520px)] aspect-square">
              {/* orbit rings */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full anim-spin-slow text-neon/25">
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.25" strokeDasharray="2 4" />
              </svg>
              <svg viewBox="0 0 100 100" className="absolute inset-[9%] w-[82%] h-[82%] anim-spin-slow text-viol/30" style={{ animationDirection: "reverse", animationDuration: "34s" }}>
                <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.3" strokeDasharray="1 6" />
              </svg>

              <motion.div
                style={{ rotateX: tiltX, rotateY: tiltY, transformPerspective: 900 }}
                className="absolute inset-[12%]"
              >
                <motion.img
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                  src={flagship.image}
                  alt={flagship.name}
                  className="w-full h-full object-cover rounded-[2rem] border hairline shadow-[0_0_90px_-20px_rgba(45,226,255,0.5)]"
                />
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-t from-void/50 via-transparent to-transparent" />
              </motion.div>

              {/* floating chips */}
              <div className="absolute top-[8%] -left-2 md:left-[-8%] anim-float">
                <div className="glass rounded-lg px-3.5 py-2 flex items-center gap-2">
                  <IconBolt size={14} className="text-neon" />
                  <span className="text-xs font-mono text-fog">-48dB ANC</span>
                </div>
              </div>
              <div className="absolute top-[38%] -right-2 md:right-[-7%] anim-float-late">
                <div className="glass rounded-lg px-3.5 py-2 flex items-center gap-2">
                  <IconOrbit size={14} className="text-viol" />
                  <span className="text-xs font-mono text-fog">Maglev drivers</span>
                </div>
              </div>
              <div className="absolute bottom-[16%] left-[2%] anim-float-late">
                <div className="glass rounded-lg px-3.5 py-2 flex items-center gap-2">
                  <IconSpark size={14} className="text-mint" />
                  <span className="text-xs font-mono text-fog">42h cell · 9ms latency</span>
                </div>
              </div>

              {/* price card */}
              <motion.div
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-5 right-[4%] glass rounded-xl p-4 w-56 clip-notch"
              >
                <p className="font-display font-bold text-white text-sm leading-tight">{flagship.name}</p>
                <div className="flex items-center justify-between mt-2.5">
                  <div>
                    <p className="font-mono text-lg text-neon">{fmt(flagship.price)}</p>
                    {flagship.compareAt && <p className="font-mono text-[10px] text-mist line-through">{fmt(flagship.compareAt)}</p>}
                  </div>
                  <button
                    onClick={() => addToCart(flagship.id, flagship.colors[0].name)}
                    className="px-3 py-2 bg-gradient-to-r from-neon to-viol text-void text-[11px] font-display font-bold tracking-wide clip-notch hover:shadow-[0_0_22px_-4px_rgba(45,226,255,0.8)] transition-shadow"
                  >
                    ADD +
                  </button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* scroll cue */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-mist/60">
          <span className="text-[9px] font-mono tracking-[0.4em] uppercase">Scroll</span>
          <motion.span
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6 }}
            className="w-px h-8 bg-gradient-to-b from-neon/70 to-transparent"
          />
        </div>
      </section>

      {/* ============ MARQUEE ============ */}
      <div className="border-y hairline bg-abyss/70 overflow-hidden py-3.5 relative">
        <div className="marquee-track flex gap-10 whitespace-nowrap w-max">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i} className="flex items-center gap-10 text-[12px] font-mono tracking-[0.28em] text-mist">
              {m} <span className="text-neon">◆</span>
            </span>
          ))}
        </div>
      </div>

      {/* ============ COLLECTIONS BENTO ============ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-24">
        <Reveal>
          <SectionHead
            eyebrow="Collections"
            title={<>Browse by <span className="text-neon">division</span></>}
            right={
              <Link to="/shop" className="group flex items-center gap-2 text-sm text-mist hover:text-neon transition-colors">
                All gear <IconArrow size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
            }
          />
        </Reveal>

        <div className="grid md:grid-cols-3 gap-4 md:auto-rows-[190px]">
          {featuredTiles.map((t, i) => {
            const cat = CATEGORIES.find((c) => c.id === t.id)!;
            return (
              <Reveal key={t.id} delay={i * 0.06} className={t.span}>
                <Link
                  to={`/shop?cat=${t.id}`}
                  className="group relative h-full min-h-[190px] glass glow-hover rounded-2xl overflow-hidden block"
                >
                  <img src={catImage(t.id)} alt="" className="absolute inset-0 w-full h-full object-cover opacity-45 transition-all duration-700 group-hover:opacity-70 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-void via-void/30 to-transparent" />
                  <div className="relative h-full flex flex-col justify-end p-5">
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-neon mb-1.5">
                      {catCount(t.id)} units
                    </span>
                    <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                      {cat.name}
                      <IconChevron size={16} className="text-neon opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </h3>
                    <p className="text-xs text-mist mt-1 max-w-[240px] line-clamp-1">{cat.blurb}</p>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ============ TRENDING CAROUSEL ============ */}
      <section className="pt-24">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Reveal>
            <SectionHead
              eyebrow="Trending"
              title={<>Most <span className="text-viol">requested</span> units</>}
              right={
                <div className="flex gap-2">
                  {([-1, 1] as const).map((d) => (
                    <button
                      key={d}
                      onClick={() => scrollCarousel(d)}
                      aria-label={d === -1 ? "Scroll left" : "Scroll right"}
                      className="w-10 h-10 glass rounded-full flex items-center justify-center text-mist hover:text-neon hover:border-neon/50 transition-all"
                    >
                      <IconChevron size={16} className={d === -1 ? "rotate-180" : ""} />
                    </button>
                  ))}
                </div>
              }
            />
          </Reveal>
        </div>
        <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 md:px-[max(1rem,calc((100vw-80rem)/2+1.5rem))] pb-2">
          {trending.map((p, i) => (
            <div key={p.id} className="w-[272px] shrink-0 snap-start">
              <ProductCard product={p} index={i} />
            </div>
          ))}
        </div>
      </section>

      {recentlyScanned.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 md:px-6 pt-20">
          <Reveal>
            <SectionHead
              eyebrow="Your trail"
              title={<>Recently <span className="text-neon">scanned</span></>}
              right={
                <Link to="/shop" className="group flex items-center gap-2 text-sm text-mist hover:text-neon transition-colors">
                  Back to catalog <IconArrow size={15} className="transition-transform group-hover:translate-x-1" />
                </Link>
              }
            />
          </Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyScanned.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ============ VALUE STRIP ============ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-24">
        <Reveal>
          <div className="glass rounded-2xl grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 divide-white/5 overflow-hidden">
            {[
              { icon: <IconTruck size={22} />, t: "Orbital freight", d: "Free over $150 · next-day express drops to most sectors." },
              { icon: <IconShield size={22} />, t: "2-year warranty", d: "Every unit covered. Replacements ship before returns land." },
              { icon: <IconBolt size={22} />, t: "Instant uplink", d: "All gear pairs to the House grid out of the box, zero friction." },
              { icon: <IconOrbit size={22} />, t: "30-day returns", d: "Change your timeline. Full refund, no interrogation." },
            ].map((f, i) => (
              <div key={f.t} className="p-6 flex gap-4 items-start group hover:bg-white/[0.03] transition-colors">
                <span className="text-neon group-hover:text-viol transition-colors shrink-0 mt-1">{f.icon}</span>
                <div>
                  <h4 className="font-display font-semibold text-white text-sm tracking-wide mb-1.5">{f.t}</h4>
                  <p className="text-xs text-mist leading-relaxed">{f.d}</p>
                </div>
                {i === 3 && <span className="sr-only">end</span>}
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-24">
        <Reveal>
          <SectionHead eyebrow="Transmissions" title={<>Signals from <span className="text-neon">the field</span></>} />
        </Reveal>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} y={30}>
              <motion.figure
                whileHover={{ rotate: 0, y: -6 }}
                className={`glass rounded-xl p-5 h-full transition-shadow hover:shadow-[0_14px_50px_-16px_rgba(45,226,255,0.35)] ${
                  ["md:-rotate-2", "md:rotate-1 md:translate-y-4", "md:-rotate-1 md:-translate-y-2", "md:rotate-2 md:translate-y-6"][i % 4]
                }`}
              >
                <Stars value={t.rating} size={12} />
                <blockquote className="text-sm text-fog leading-relaxed mt-3.5 mb-5">“{t.quote}”</blockquote>
                <figcaption className="border-t hairline pt-3.5">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-[11px] font-mono text-mist mt-0.5">{t.role}</p>
                </figcaption>
              </motion.figure>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ CTA BAND ============ */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 pt-24">
        <Reveal>
          <div className="relative glass rounded-3xl overflow-hidden px-6 py-16 md:py-20 text-center">
            <div className="absolute inset-0 grid-bg opacity-70" />
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[36rem] h-[36rem] rounded-full bg-neon/10 blur-[120px]" />
            <div className="relative">
              <p className="font-mono text-[11px] tracking-[0.35em] uppercase text-neon mb-4">Ready for pickup</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white max-w-2xl mx-auto leading-[1.05]">
                The future doesn't wait. <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-viol">Neither should you.</span>
              </h2>
              <div className="flex flex-wrap justify-center gap-3.5 mt-8">
                <NeonButton onClick={() => nav("/shop")}>
                  Enter the catalog <IconArrow size={16} />
                </NeonButton>
                <NeonButton variant="ghost" onClick={() => nav("/auth?mode=signup")}>Create an account</NeonButton>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
