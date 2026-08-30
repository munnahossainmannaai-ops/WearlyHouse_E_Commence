import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import type { Order, OrderStatus, Product } from "../lib/types";
import { CATEGORIES, PRODUCT_IMAGES } from "../data/catalog";
import { cx, fmt, dateFmt, timeAgo, seededSeries, STATUS_META, ORDER_FLOW } from "../lib/utils";
import { Counter, Field, inputCls, Modal, NeonButton, Reveal, Tag, StockMeter } from "../components/ui";
import {
  IconAlert, IconBolt, IconBox, IconCard, IconChart, IconCheck, IconChevron, IconDownload,
  IconEdit, IconEye, IconMinus, IconPin, IconPlus, IconSearch, IconTrash, IconTruck, IconUsers,
} from "../components/icons";

const TABS = [
  { id: "overview", label: "Overview", icon: <IconChart size={15} /> },
  { id: "inventory", label: "Inventory", icon: <IconAlert size={15} /> },
  { id: "products", label: "Products", icon: <IconBox size={15} /> },
  { id: "orders", label: "Orders", icon: <IconTruck size={15} /> },
  { id: "users", label: "Users", icon: <IconUsers size={15} /> },
] as const;

/* ================= chart primitives ================= */

const SalesChart = ({ data, labels, tickEvery = 1 }: { data: number[]; labels: string[]; tickEvery?: number }) => {
  const W = 640, H = 200, PAD = 8;
  const max = Math.max(...data) * 1.15;
  const pts = data.map((v, i) => [PAD + (i / (data.length - 1)) * (W - PAD * 2), H - PAD - (v / max) * (H - PAD * 2)]);
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");
  const area = `${line} L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;
  const [hover, setHover] = useState<number | null>(null);

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopOpacity="0.28" style={{ stopColor: "var(--neon)" }} />
            <stop offset="100%" stopOpacity="0.02" style={{ stopColor: "var(--viol)" }} />
          </linearGradient>
          <linearGradient id="salesStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" style={{ stopColor: "var(--neon)" }} />
            <stop offset="100%" style={{ stopColor: "var(--viol)" }} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={H * f} y2={H * f} strokeDasharray="3 5" style={{ stroke: "var(--chart-grid)" }} />
        ))}
        <motion.path d={area} fill="url(#salesFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }} />
        <motion.path
          d={line} fill="none" stroke="url(#salesStroke)" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 6px var(--neon-60))" }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <rect x={p[0] - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent" onMouseEnter={() => setHover(i)} />
            <circle cx={p[0]} cy={p[1]} r={hover === i ? 5 : 2.5} strokeWidth="2" className="transition-all" style={{ fill: "var(--abyss)", stroke: hover === i ? "var(--neon)" : "var(--viol)", opacity: hover === i ? 1 : 0.7 }} />
          </g>
        ))}
        {hover !== null && (
          <line x1={pts[hover][0]} x2={pts[hover][0]} y1={PAD} y2={H - PAD} strokeDasharray="2 4" style={{ stroke: "var(--neon)", opacity: 0.35 }} />
        )}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {labels.map((l, i) => (
          <span key={i} className={cx("text-[9px] font-mono tabular-nums", hover === i ? "text-neon" : "text-mist/60")}>
            {i % tickEvery === 0 || i === labels.length - 1 ? l : ""}
          </span>
        ))}
      </div>
      {hover !== null && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 glass rounded-lg px-3.5 py-2 text-center pointer-events-none">
          <p className="font-mono text-neon text-sm">{fmt(data[hover])}</p>
          <p className="text-[9px] font-mono uppercase text-mist">{labels[hover]}</p>
        </div>
      )}
    </div>
  );
};

const Sparkline = ({ data, id }: { data: number[]; id: string }) => {
  const W = 140, H = 38;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v, i) => `${((i / (data.length - 1)) * W).toFixed(1)},${(H - 4 - ((v - min) / (max - min || 1)) * (H - 8)).toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-10" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--neon)" }} />
          <stop offset="100%" style={{ stopColor: "var(--viol)" }} />
        </linearGradient>
      </defs>
      <motion.polyline
        points={pts} fill="none" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
      />
      <circle cx={W} cy={pts.split(" ").pop()?.split(",")[1]} r="2.6" style={{ fill: "var(--viol)" }} />
    </svg>
  );
};

const Donut = ({ segs, total }: { segs: { label: string; value: number; color: string }[]; total: number }) => {
  const R = 52, C = 2 * Math.PI * R;
  let acc = 0;
  return (
    <div className="relative w-40 h-40 shrink-0">
      <svg viewBox="0 0 140 140" className="w-full h-full">
        <circle cx="70" cy="70" r={R} fill="none" strokeWidth="15" style={{ stroke: "var(--chart-grid)" }} opacity="0.5" />
        {segs.filter((s) => s.value > 0).map((s) => {
          const frac = s.value / total;
          const dash = Math.max(0, frac * C - 1.5);
          const off = -acc * C;
          acc += frac;
          return (
            <motion.circle
              key={s.label} cx="70" cy="70" r={R} fill="none" strokeWidth="15"
              stroke={s.color} strokeDasharray={`${dash} ${C - dash}`} strokeDashoffset={off}
              transform="rotate(-90 70 70)"
              initial={{ strokeDasharray: `0 ${C}` }}
              animate={{ strokeDasharray: `${dash} ${C - dash}` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold text-white">{total}</span>
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-mist">orders</span>
      </div>
    </div>
  );
};

const actIcon = (s: string) =>
  s === "placed" ? <IconBolt size={13} /> : s === "processing" ? <IconBox size={13} /> : s === "shipped" ? <IconTruck size={13} /> : s === "delivered" ? <IconCheck size={13} /> : <IconAlert size={13} />;

/* ================= product form seed ================= */
const blankProduct = (): Product => ({
  id: `p-${Date.now().toString(36)}`,
  slug: "",
  name: "",
  tagline: "",
  category: "audio",
  price: 199,
  stock: 10,
  rating: 4.5,
  ratingCount: 0,
  colors: [{ name: "Void Black", hex: "#17171f" }, { name: "Ion Cyan", hex: "#2de2ff" }],
  image: PRODUCT_IMAGES[0],
  tags: ["New"],
  description: "",
  specs: [
    { label: "Warranty", value: "2-year House coverage" },
    { label: "In the box", value: "Unit, dock, HouseLink cable" },
  ],
  createdAt: Date.now(),
});

/* ================= page ================= */
export default function Admin() {
  const { user, users, products, orders, upsertProduct, deleteProduct, setStock, setOrderStatus, toast } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [pfErr, setPfErr] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [pq, setPq] = useState("");
  const [range, setRange] = useState<7 | 30 | 90>(30);
  const [threshold, setThreshold] = useState(8);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toISOString().slice(11, 19));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const revenue = useMemo(() => orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0), [orders]);
  const unitsSold = useMemo(() => orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.items.reduce((b, i) => b + i.qty, 0), 0), [orders]);
  const lowStock = useMemo(() => products.filter((p) => p.stock <= threshold).sort((a, b) => a.stock - b.stock), [products, threshold]);
  const stockValue = useMemo(() => products.reduce((a, p) => a + p.price * p.stock, 0), [products]);
  const totalUnits = useMemo(() => products.reduce((a, p) => a + p.stock, 0), [products]);

  const chart = useMemo(() => {
    const n = range === 90 ? 13 : range;
    const stepDays = range === 90 ? 7 : 1;
    const labels = Array.from({ length: n }, (_, i) => {
      const d = new Date(Date.now() - (n - 1 - i) * stepDays * 86_400_000);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    });
    const seedBase = range === 7 ? 4200 : range === 30 ? 5200 : 34_000;
    const amp = range === 7 ? 1900 : range === 30 ? 2500 : 13_000;
    const data = seededSeries(range * 17 + 5, n, seedBase, amp);
    data[data.length - 1] += Math.round(revenue * 0.35);
    return { data, labels, tickEvery: Math.max(1, Math.ceil(n / 8)) };
  }, [range, revenue]);

  const catUnits = CATEGORIES.map((c) => ({
    name: c.name,
    n: products.filter((p) => p.category === c.id).length,
    rev: orders.reduce((a, o) => a + o.items.filter((i) => products.find((p) => p.id === i.productId)?.category === c.id).reduce((b, i) => b + i.price * i.qty, 0), 0),
  }));
  const maxCat = Math.max(...catUnits.map((c) => c.rev), 1);

  const topMovers = useMemo(() => {
    const map = new Map<string, { name: string; image: string; units: number; revenue: number }>();
    orders.filter((o) => o.status !== "cancelled").forEach((o) =>
      o.items.forEach((it) => {
        const e = map.get(it.productId) ?? { name: it.name, image: it.image, units: 0, revenue: 0 };
        e.units += it.qty;
        e.revenue += it.price * it.qty;
        map.set(it.productId, e);
      })
    );
    return [...map.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [orders]);
  const maxMover = Math.max(...topMovers.map((m) => m.revenue), 1);

  const activity = useMemo(
    () => orders.flatMap((o) => o.timeline.map((t) => ({ ...t, orderId: o.id, who: o.userEmail }))).sort((a, b) => b.at - a.at).slice(0, 8),
    [orders]
  );

  const donutSegs = (["processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => ({
    label: STATUS_META[s].label,
    value: orders.filter((o) => o.status === s).length,
    color: s === "processing" ? "var(--amber2)" : s === "shipped" ? "var(--neon)" : s === "delivered" ? "var(--mint)" : "var(--rose2)",
  }));

  if (!user) return <Navigate to="/auth?next=/admin" replace />;
  if (user.role !== "admin") {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-40 pb-24 text-center">
        <p className="font-mono text-rose2 text-sm tracking-[0.3em] uppercase mb-3">403 // clearance denied</p>
        <h1 className="font-display text-3xl font-bold text-white mb-3">Mission control requires admin clearance.</h1>
        <p className="text-mist text-sm mb-8">Sign in with the demo admin to explore the panel.</p>
        <Link to="/auth"><NeonButton>Switch operator</NeonButton></Link>
      </div>
    );
  }

  const saveProduct = () => {
    if (!editProduct) return;
    const e: Record<string, string> = {};
    if (editProduct.name.trim().length < 3) e.name = "Name required (3+ chars)";
    if (editProduct.price <= 0) e.price = "Price must be positive";
    if (editProduct.stock < 0) e.stock = "Stock can't be negative";
    if (editProduct.tagline.trim().length < 5) e.tagline = "Tagline required";
    setPfErr(e);
    if (Object.keys(e).length) return;
    upsertProduct({
      ...editProduct,
      slug: editProduct.slug || editProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    });
    setEditProduct(null);
  };

  const visibleOrders = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);
  const visibleProducts = products.filter((p) => (p.name + " " + p.slug + " " + p.category).toLowerCase().includes(pq.trim().toLowerCase()));

  const exportOrdersCsv = () => {
    const head = ["Order ID", "Date", "Customer", "Email", "Units", "Subtotal", "Shipping", "Discount", "Total", "Status"];
    const lines = visibleOrders.map((o) =>
      [o.id, new Date(o.createdAt).toISOString().slice(0, 10), o.address.fullName, o.userEmail, o.items.reduce((a, i) => a + i.qty, 0), o.subtotal, o.shippingCost, o.discount, o.total, o.status]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",")
    );
    const blob = new Blob([[head.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wearly-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast("success", "Manifest exported", `${visibleOrders.length} orders → CSV.`);
  };

  const kpis = [
    { l: "Orders", v: orders.length + 412, d: "+9.1%", up: true, spark: seededSeries(21, 12, 40, 26) },
    { l: "Operators", v: users.length + 1930, d: "+3.8%", up: true, spark: seededSeries(33, 12, 50, 20) },
    { l: "Avg. order value", v: orders.length ? Math.round((revenue + 184_500) / (orders.length + 412)) : 448, pre: "$", d: "-1.2%", up: false, spark: seededSeries(55, 12, 44, 18) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
      {/* ---------- header ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-viol mb-2 flex items-center gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-mint anim-pulse-dot" /> Mission control · live feed
          </p>
          <h1 className="font-display text-4xl font-bold text-white">Admin Panel</h1>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="glass rounded-full px-4 py-2 font-mono text-xs text-neon tabular-nums hidden sm:block">{clock} UTC</span>
          <button
            onClick={() => setTab("inventory")}
            className={cx(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-mono border transition-all",
              lowStock.length ? "border-amber2/40 bg-amber2/10 text-amber2 hover:bg-amber2/20" : "border-mint/40 bg-mint/10 text-mint"
            )}
          >
            <IconAlert size={13} />
            {lowStock.length ? `${lowStock.length} low-stock alert${lowStock.length === 1 ? "" : "s"}` : "Stock nominal"}
          </button>
        </div>
      </div>

      {/* ---------- tabs ---------- */}
      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all",
              tab === t.id ? "bg-gradient-to-r from-neon to-viol text-void shadow-[0_0_22px_-8px_var(--neon-60)]" : "glass text-mist hover:text-white"
            )}
          >
            {t.icon} {t.label}
            {t.id === "inventory" && lowStock.length > 0 && tab !== "inventory" && (
              <span className="ml-0.5 w-5 h-5 rounded-full bg-amber2 text-void text-[10px] font-bold flex items-center justify-center">{lowStock.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW ================= */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI band — asymmetric */}
          <div className="grid grid-cols-2 lg:grid-cols-[1.55fr_1fr_1fr_1fr] gap-4">
            <Reveal className="col-span-2 lg:col-span-1">
              <div className="glass glow-hover rounded-2xl p-5 h-full relative overflow-hidden">
                <div className="absolute -right-10 -top-14 w-44 h-44 rounded-full bg-neon/10 blur-3xl" />
                <div className="relative flex items-start justify-between">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-mist">Gross revenue</p>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border text-mint border-mint/30 bg-mint/8">+18.4%</span>
                </div>
                <p className="relative font-display text-[2.6rem] leading-none font-bold text-white mt-3">
                  <Counter to={Math.round(revenue + 184_500)} prefix="$" />
                </p>
                <p className="relative text-[10px] font-mono text-mist mt-1.5">{unitsSold} units moved · vs last cycle</p>
                <div className="relative mt-3"><Sparkline data={seededSeries(7, 14, 46, 30)} id="spark-rev" /></div>
              </div>
            </Reveal>
            {kpis.map((k, i) => (
              <Reveal key={k.l} delay={0.08 + i * 0.07} className={i === 0 ? "col-span-2 lg:col-span-1" : ""}>
                <div className="glass glow-hover rounded-2xl p-5 h-full">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-mist mb-2.5">{k.l}</p>
                  <p className="font-display text-3xl font-bold text-white"><Counter to={k.v} prefix={k.pre ?? ""} /></p>
                  <span className={cx("inline-block mt-2.5 text-[11px] font-mono px-2 py-0.5 rounded-full border", k.up ? "text-mint border-mint/30 bg-mint/8" : "text-rose2 border-rose2/30 bg-rose2/8")}>
                    {k.d}
                  </span>
                  <div className="mt-2.5"><Sparkline data={k.spark} id={`spark-${i}`} /></div>
                </div>
              </Reveal>
            ))}
          </div>

          {/* chart + donut */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <h3 className="font-display font-bold text-white">Revenue telemetry</h3>
                <div className="flex glass rounded-full p-1">
                  {([7, 30, 90] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setRange(r)}
                      className={cx(
                        "px-3.5 py-1.5 rounded-full text-[11px] font-mono tracking-wider transition-all",
                        range === r ? "bg-gradient-to-r from-neon to-viol text-void font-bold" : "text-mist hover:text-white"
                      )}
                    >
                      {r}D
                    </button>
                  ))}
                </div>
              </div>
              <SalesChart key={range} data={chart.data} labels={chart.labels} tickEvery={chart.tickEvery} />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-5">Order flow</h3>
              <div className="flex flex-col items-center gap-5">
                <Donut segs={donutSegs} total={orders.length} />
                <div className="w-full space-y-2">
                  {donutSegs.map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: s.color }} />
                      <span className="text-fog flex-1">{s.label}</span>
                      <span className="font-mono text-mist">{s.value}</span>
                      <span className="font-mono text-mist/50 w-10 text-right">{orders.length ? Math.round((s.value / orders.length) * 100) : 0}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* top movers + divisions */}
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4">Top movers</h3>
              {topMovers.length === 0 ? (
                <p className="text-sm text-mist">No sales signal yet — movers rank here once orders land.</p>
              ) : (
                <div className="space-y-3.5">
                  {topMovers.map((m, i) => (
                    <div key={m.name} className="flex items-center gap-3.5">
                      <span className={cx(
                        "w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[11px] font-bold shrink-0",
                        i === 0 ? "bg-gradient-to-br from-neon to-viol text-void" : "bg-white/6 text-mist border border-white/10"
                      )}>
                        {i + 1}
                      </span>
                      <img src={m.image} alt="" className="w-10 h-10 rounded-lg object-cover border hairline shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline gap-2 mb-1">
                          <p className="text-sm text-white font-medium truncate">{m.name}</p>
                          <p className="font-mono text-xs text-neon shrink-0">{fmt(m.revenue)}</p>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 flex-1 bg-white/6 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${(m.revenue / maxMover) * 100}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 0.9, delay: i * 0.07 }}
                              className="h-full rounded-full bg-gradient-to-r from-neon to-viol"
                            />
                          </div>
                          <span className="text-[10px] font-mono text-mist shrink-0">{m.units}u</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-5">Revenue by division</h3>
              <div className="space-y-4">
                {catUnits.map((c, i) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-fog">{c.name}</span>
                      <span className="font-mono text-mist">{c.rev > 0 ? fmt(c.rev) : `${c.n} SKUs`}</span>
                    </div>
                    <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(5, (c.rev / maxCat) * 100)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, delay: i * 0.08 }}
                        className="h-full rounded-full bg-gradient-to-r from-neon to-viol"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* activity + latest orders */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-neon anim-pulse-dot" /> Live activity
              </h3>
              <div className="space-y-1">
                {activity.map((a, i) => (
                  <div key={a.orderId + a.status + a.at} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                    <span className={cx(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border",
                      a.status === "delivered" ? "text-mint border-mint/25 bg-mint/8" : a.status === "shipped" ? "text-neon border-neon/25 bg-neon/8" : a.status === "processing" ? "text-amber2 border-amber2/25 bg-amber2/8" : "text-viol border-viol/25 bg-viol/8"
                    )}>
                      {actIcon(a.status)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-fog leading-snug">
                        <span className="font-mono text-white">{a.orderId}</span>{" "}
                        <span className="text-mist">{a.note.toLowerCase()}</span>
                      </p>
                      <p className="text-[10px] font-mono text-mist/70 mt-0.5">{a.who}</p>
                    </div>
                    <span className={cx("text-[10px] font-mono shrink-0", i === 0 ? "text-neon" : "text-mist/60")}>{timeAgo(a.at)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-bold text-white">Latest orders</h3>
                <button onClick={() => setTab("orders")} className="text-[11px] font-mono uppercase tracking-wider text-neon hover:text-white transition-colors flex items-center gap-1">
                  Manage <IconChevron size={11} />
                </button>
              </div>
              {orders.length === 0 ? (
                <p className="text-sm text-mist">No orders in this session yet — place one from the storefront to see it land here.</p>
              ) : (
                <div className="space-y-2.5">
                  {orders.slice(0, 5).map((o) => (
                    <button key={o.id} onClick={() => { setTab("orders"); setExpandedOrder(o.id); }} className="w-full flex items-center gap-3 bg-white/[0.03] hover:bg-white/[0.06] rounded-xl p-3 transition-colors text-left">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white">{o.id}</p>
                        <p className="text-[10px] text-mist font-mono">{o.userEmail} · {dateFmt(o.createdAt)}</p>
                      </div>
                      <span className={cx("px-2.5 py-1 rounded-full text-[10px] font-mono border", STATUS_META[o.status].tone)}>{STATUS_META[o.status].label}</span>
                      <span className="font-mono text-sm text-neon">{fmt(o.total)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= INVENTORY ================= */}
      {tab === "inventory" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "SKUs tracked", v: products.length },
              { l: "Units on hand", v: totalUnits },
              { l: "Stock value", v: Math.round(stockValue), pre: "$" },
              { l: "Flagged low", v: lowStock.length, warn: lowStock.length > 0 },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 0.06}>
                <div className="glass rounded-2xl p-5">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-mist mb-2">{s.l}</p>
                  <p className={cx("font-display text-3xl font-bold", s.warn ? "text-amber2" : "text-white")}>
                    <Counter to={s.v} prefix={s.pre ?? ""} />
                  </p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="glass rounded-2xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
              <h3 className="font-display font-bold text-white">Stock levels</h3>
              <label className="flex items-center gap-3 text-xs text-mist">
                <span className="font-mono uppercase tracking-wider text-[10px]">Alert threshold</span>
                <input
                  type="range" min={1} max={15} value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-36"
                  style={{ accentColor: "var(--neon)" }}
                  aria-label="Low stock threshold"
                />
                <span className="font-mono text-neon w-7 text-right tabular-nums">{threshold}</span>
              </label>
            </div>
            <div className="space-y-2.5">
              {[...products].sort((a, b) => a.stock - b.stock).map((p) => {
                const flagged = p.stock <= threshold;
                return (
                  <div key={p.id} className={cx("flex flex-wrap sm:flex-nowrap items-center gap-3.5 rounded-xl p-3.5 border transition-colors", flagged ? "border-amber2/25 bg-amber2/[0.05]" : "border-transparent bg-white/[0.03]")}>
                    <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover border hairline shrink-0" />
                    <div className="flex-1 min-w-[140px]">
                      <p className="text-sm text-white font-medium truncate">{p.name}</p>
                      <p className="text-[10px] font-mono text-mist">{p.category} · {fmt(p.price)} · {fmt(p.price * p.stock)} on shelf</p>
                    </div>
                    <div className="w-40 hidden md:block"><StockMeter stock={p.stock} /></div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setStock(p.id, Math.max(0, p.stock - 1))} aria-label="Decrease stock" className="w-7 h-7 rounded-md border border-white/12 text-mist hover:text-neon flex items-center justify-center transition-colors"><IconMinus size={12} /></button>
                      <span className={cx("w-9 text-center font-mono text-sm", flagged ? "text-amber2" : "text-white")}>{p.stock}</span>
                      <button onClick={() => setStock(p.id, p.stock + 1)} aria-label="Increase stock" className="w-7 h-7 rounded-md border border-white/12 text-mist hover:text-neon flex items-center justify-center transition-colors"><IconPlus size={12} /></button>
                      <button onClick={() => { setStock(p.id, p.stock + 25); toast("success", "Restocked", `${p.name} +25 units.`); }} className="ml-1 px-2.5 h-7 rounded-md border border-neon/40 text-neon text-[10px] font-mono hover:bg-neon/10 transition-colors">+25</button>
                      <button onClick={() => { setEditProduct(p); setPfErr({}); }} aria-label="Edit product" className="w-7 h-7 rounded-md border border-white/12 text-mist hover:text-viol flex items-center justify-center transition-colors"><IconEdit size={12} /></button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {tab === "products" && (
        <div>
          <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
            <div className="flex items-center gap-2.5 glass rounded-full px-4 h-10 w-full sm:w-72">
              <IconSearch size={14} className="text-mist" />
              <input value={pq} onChange={(e) => setPq(e.target.value)} placeholder="Filter units…" className="bg-transparent outline-none text-sm w-full placeholder:text-mist/50" />
            </div>
            <div className="flex items-center gap-3">
              <p className="text-sm text-mist whitespace-nowrap">{visibleProducts.length} of {products.length}</p>
              <NeonButton onClick={() => { setEditProduct(blankProduct()); setPfErr({}); }}>
                <IconPlus size={14} /> New unit
              </NeonButton>
            </div>
          </div>
          <div className="glass rounded-2xl overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="text-left text-[10px] font-mono uppercase tracking-[0.18em] text-mist border-b hairline">
                  <th className="px-5 py-3.5">Unit</th>
                  <th className="px-3 py-3.5">Division</th>
                  <th className="px-3 py-3.5">Price</th>
                  <th className="px-3 py-3.5">Stock</th>
                  <th className="px-3 py-3.5">Rating</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {visibleProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover border hairline" />
                        <div>
                          <p className="text-white font-medium leading-tight">{p.name}</p>
                          <p className="text-[10px] font-mono text-mist mt-0.5">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3"><Tag tone="neon">{p.category}</Tag></td>
                    <td className="px-3 py-3 font-mono text-fog">{fmt(p.price)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setStock(p.id, Math.max(0, p.stock - 1))} aria-label="Decrease" className="w-6 h-6 rounded border border-white/12 text-mist hover:text-neon flex items-center justify-center"><IconMinus size={11} /></button>
                        <span className={cx("w-8 text-center font-mono", p.stock === 0 ? "text-rose2" : p.stock <= threshold ? "text-amber2" : "text-white")}>{p.stock}</span>
                        <button onClick={() => setStock(p.id, p.stock + 1)} aria-label="Increase" className="w-6 h-6 rounded border border-white/12 text-mist hover:text-neon flex items-center justify-center"><IconPlus size={11} /></button>
                      </div>
                    </td>
                    <td className="px-3 py-3 font-mono text-fog">{p.rating.toFixed(1)} <span className="text-mist text-xs">({p.ratingCount})</span></td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <Link to={`/product/${p.slug}`} aria-label="View" className="w-8 h-8 rounded-lg border border-white/12 text-mist hover:text-neon hover:border-neon/40 flex items-center justify-center transition-colors"><IconEye size={14} /></Link>
                        <button onClick={() => { setEditProduct(p); setPfErr({}); }} aria-label="Edit" className="w-8 h-8 rounded-lg border border-white/12 text-mist hover:text-viol hover:border-viol/40 flex items-center justify-center transition-colors"><IconEdit size={14} /></button>
                        <button onClick={() => setConfirmDelete(p)} aria-label="Delete" className="w-8 h-8 rounded-lg border border-white/12 text-mist hover:text-rose2 hover:border-rose2/40 flex items-center justify-center transition-colors"><IconTrash size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {visibleProducts.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-mist">No units match that filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ORDERS ================= */}
      {tab === "orders" && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex flex-wrap gap-2">
              {(["all", "processing", "shipped", "delivered", "cancelled"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cx(
                    "px-4 py-2 rounded-full text-xs font-mono uppercase tracking-wider border transition-all",
                    statusFilter === s ? "border-neon/60 text-neon bg-neon/10" : "border-white/10 text-mist hover:text-white"
                  )}
                >
                  {s} {s !== "all" && `(${orders.filter((o) => o.status === s).length})`}
                </button>
              ))}
            </div>
            <button
              onClick={exportOrdersCsv}
              disabled={visibleOrders.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-full glass text-xs font-mono uppercase tracking-wider text-neon hover:border-neon/50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <IconDownload size={14} /> Export CSV
            </button>
          </div>

          {visibleOrders.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <IconBox size={30} className="mx-auto text-mist mb-4" />
              <p className="font-display text-lg font-bold text-white">No orders on this frequency</p>
              <p className="text-sm text-mist mt-2">Orders placed at the storefront land here in real time.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-[0.18em] text-mist border-b hairline">
                    <th className="px-5 py-3.5 w-8"></th>
                    <th className="px-2 py-3.5">Order</th>
                    <th className="px-3 py-3.5">Operator</th>
                    <th className="px-3 py-3.5">Units</th>
                    <th className="px-3 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleOrders.map((o) => {
                    const open = expandedOrder === o.id;
                    return (
                      <OrderRow
                        key={o.id}
                        order={o}
                        open={open}
                        onToggle={() => setExpandedOrder(open ? null : o.id)}
                        onStatus={(s) => setOrderStatus(o.id, s)}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= USERS ================= */}
      {tab === "users" && (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-[0.18em] text-mist border-b hairline">
                <th className="px-5 py-3.5">Operator</th>
                <th className="px-3 py-3.5">Joined</th>
                <th className="px-3 py-3.5">Orders</th>
                <th className="px-3 py-3.5">Lifetime value</th>
                <th className="px-3 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const their = orders.filter((o) => o.userId === u.id && o.status !== "cancelled");
                const ltv = their.reduce((a, o) => a + o.total, 0);
                const self = u.id === user.id;
                return (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-neon/25 to-viol/25 border border-white/10 flex items-center justify-center font-display font-bold text-white text-xs">
                          {u.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                        </span>
                        <div>
                          <p className="text-white font-medium flex items-center gap-2">{u.name} {self && <Tag tone="neon">YOU</Tag>}</p>
                          <p className="text-[10px] font-mono text-mist">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 font-mono text-mist text-xs">{dateFmt(u.createdAt)}</td>
                    <td className="px-3 py-3.5 font-mono text-fog">{their.length}</td>
                    <td className="px-3 py-3.5">
                      <span className={cx("font-mono", ltv > 0 ? "text-neon" : "text-mist/50")}>{ltv > 0 ? fmt(ltv) : "—"}</span>
                    </td>
                    <td className="px-3 py-3.5"><Tag tone={u.role === "admin" ? "viol" : "mint"}>{u.role}</Tag></td>
                    <td className="px-5 py-3.5">
                      <div className="flex justify-end items-center gap-2">
                        <span className={cx("text-[10px] font-mono uppercase", u.active ? "text-mint" : "text-rose2")}>{u.active ? "Active" : "Suspended"}</span>
                        <span
                          onClick={() => {
                            if (!self) useStore.setState((s) => ({
                              users: s.users.map((x) => (x.id === u.id ? { ...x, active: !x.active } : x)),
                            }));
                          }}
                          role="switch"
                          aria-checked={u.active}
                          aria-label="Toggle active"
                          className={cx("w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer", u.active ? "bg-gradient-to-r from-neon to-viol" : "bg-white/10", self && "opacity-30 pointer-events-none")}
                        >
                          <span className={cx("block w-4 h-4 rounded-full bg-void transition-transform", u.active && "translate-x-4")} />
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ---------- product modal ---------- */}
      <Modal open={!!editProduct} onClose={() => setEditProduct(null)} wide>
        {editProduct && (
          <div>
            <h3 className="font-display text-2xl font-bold text-white mb-6">
              {products.some((p) => p.id === editProduct.id) ? "Edit unit" : "Deploy new unit"}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Field label="Unit name" error={pfErr.name}>
                  <input value={editProduct.name} onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })} className={inputCls(pfErr.name)} placeholder="HALO X2 Levitation Headphones" />
                </Field>
              </div>
              <Field label="Division">
                <select value={editProduct.category} onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })} className={cx(inputCls(), "cursor-pointer")}>
                  {CATEGORIES.map((c) => <option key={c.id} value={c.id} className="bg-panel">{c.name}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Price $" error={pfErr.price}>
                  <input type="number" value={editProduct.price} onChange={(e) => setEditProduct({ ...editProduct, price: Number(e.target.value) })} className={inputCls(pfErr.price)} />
                </Field>
                <Field label="Compare $">
                  <input type="number" value={editProduct.compareAt ?? ""} onChange={(e) => setEditProduct({ ...editProduct, compareAt: e.target.value ? Number(e.target.value) : undefined })} className={inputCls()} placeholder="—" />
                </Field>
                <Field label="Stock" error={pfErr.stock}>
                  <input type="number" value={editProduct.stock} onChange={(e) => setEditProduct({ ...editProduct, stock: Number(e.target.value) })} className={inputCls(pfErr.stock)} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Tagline" error={pfErr.tagline}>
                  <input value={editProduct.tagline} onChange={(e) => setEditProduct({ ...editProduct, tagline: e.target.value })} className={inputCls(pfErr.tagline)} placeholder="One line that sells it." />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Description">
                  <textarea rows={3} value={editProduct.description} onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })} className={cx(inputCls(), "resize-none")} placeholder="Full transmission…" />
                </Field>
              </div>
              <Field label="Tags (comma separated)">
                <input value={editProduct.tags.join(", ")} onChange={(e) => setEditProduct({ ...editProduct, tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean) })} className={inputCls()} placeholder="New, Limited" />
              </Field>
              <Field label="Featured">
                <button
                  onClick={() => setEditProduct({ ...editProduct, featured: !editProduct.featured })}
                  className={cx("w-full py-2.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-all", editProduct.featured ? "border-neon/60 text-neon bg-neon/10" : "border-white/10 text-mist")}
                >
                  {editProduct.featured ? "★ On the front page" : "Not featured"}
                </button>
              </Field>
              <div className="md:col-span-2">
                <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-mist mb-2">Product image</p>
                <div className="grid grid-cols-5 gap-2.5">
                  {PRODUCT_IMAGES.map((img) => (
                    <button
                      key={img}
                      onClick={() => setEditProduct({ ...editProduct, image: img })}
                      className={cx("relative aspect-square rounded-lg overflow-hidden border-2 transition-all", editProduct.image === img ? "border-neon shadow-[0_0_16px_-4px_var(--neon-60)]" : "border-white/10 opacity-60 hover:opacity-100")}
                      aria-label="Select image"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {editProduct.image === img && (
                        <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-neon text-void flex items-center justify-center"><IconCheck size={11} /></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-7">
              <NeonButton onClick={saveProduct} className="flex-1">
                {products.some((p) => p.id === editProduct.id) ? "Commit changes" : "Deploy unit"}
              </NeonButton>
              <NeonButton variant="ghost" onClick={() => setEditProduct(null)}>Abort</NeonButton>
            </div>
          </div>
        )}
      </Modal>

      {/* ---------- delete confirm ---------- */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)}>
        {confirmDelete && (
          <div className="text-center">
            <span className="w-14 h-14 mx-auto rounded-full bg-rose2/12 border border-rose2/40 flex items-center justify-center text-rose2 mb-4">
              <IconTrash size={22} />
            </span>
            <h3 className="font-display text-xl font-bold text-white">Decommission unit?</h3>
            <p className="text-sm text-mist mt-2">
              <span className="text-white font-medium">{confirmDelete.name}</span> will be wiped from the catalog, carts and wishlists. No rollback.
            </p>
            <div className="flex gap-3 mt-6">
              <NeonButton variant="ghost" onClick={() => setConfirmDelete(null)} className="flex-1">Keep it</NeonButton>
              <button
                onClick={() => { deleteProduct(confirmDelete.id); setConfirmDelete(null); }}
                className="flex-1 py-3 bg-rose2/15 border border-rose2/50 text-rose2 font-display font-semibold text-sm rounded-lg clip-notch hover:bg-rose2/25 transition-colors"
              >
                Decommission
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

/* ================= order row with expansion ================= */
function OrderRow({ order: o, open, onToggle, onStatus }: { order: Order; open: boolean; onToggle: () => void; onStatus: (s: OrderStatus) => void }) {
  const flowIdx = ORDER_FLOW.indexOf(o.status);
  return (
    <>
      <tr className="hover:bg-white/[0.03] transition-colors cursor-pointer" onClick={onToggle}>
        <td className="pl-5 py-3.5">
          <IconChevron size={14} className={cx("text-mist transition-transform duration-300", open && "rotate-90 text-neon")} />
        </td>
        <td className="px-2 py-3.5">
          <p className="font-mono text-white">{o.id}</p>
          <p className="text-[10px] font-mono text-mist mt-0.5">{dateFmt(o.createdAt)}</p>
        </td>
        <td className="px-3 py-3.5">
          <p className="text-fog">{o.address.fullName}</p>
          <p className="text-[10px] text-mist font-mono">{o.userEmail}</p>
        </td>
        <td className="px-3 py-3.5">
          <div className="flex -space-x-2.5">
            {o.items.slice(0, 4).map((it, i) => (
              <img key={i} src={it.image} alt="" className="w-9 h-9 rounded-md object-cover border-2 border-panel" />
            ))}
          </div>
        </td>
        <td className="px-3 py-3.5 font-mono text-neon">{fmt(o.total)}</td>
        <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
          <select
            value={o.status}
            onChange={(e) => onStatus(e.target.value as OrderStatus)}
            className={cx("bg-panel border rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider outline-none cursor-pointer", STATUS_META[o.status].tone)}
          >
            {(["processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
              <option key={s} value={s} className="bg-panel text-fog">{STATUS_META[s].label}</option>
            ))}
          </select>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={6} className="px-5 pb-5 pt-1">
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass rounded-xl p-5 grid md:grid-cols-3 gap-6">
              {/* items */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon mb-3">Manifest</p>
                <div className="space-y-2.5">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex items-center gap-2.5">
                      <img src={it.image} alt="" className="w-9 h-9 rounded-md object-cover border hairline" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-white font-medium truncate">{it.name}</p>
                        <p className="text-[10px] font-mono text-mist">{it.color} × {it.qty}</p>
                      </div>
                      <span className="font-mono text-xs text-fog">{fmt(it.price * it.qty)}</span>
                    </div>
                  ))}
                  <div className="border-t hairline pt-2 text-[11px] font-mono text-mist space-y-1">
                    <p className="flex justify-between"><span>Freight · {o.shippingMethod}</span><span>{o.shippingCost === 0 ? "FREE" : fmt(o.shippingCost)}</span></p>
                    {o.discount > 0 && <p className="flex justify-between text-mint"><span>Discount</span><span>-{fmt(o.discount)}</span></p>}
                    <p className="flex justify-between text-white"><span>Total</span><span className="text-neon">{fmt(o.total)}</span></p>
                  </div>
                </div>
              </div>

              {/* address + payment */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon mb-3">Drop point</p>
                <p className="text-sm text-white font-medium flex items-center gap-2"><IconPin size={13} className="text-mist" /> {o.address.fullName}</p>
                <p className="text-xs text-mist mt-1.5 leading-relaxed">
                  {o.address.line1}{o.address.line2 ? `, ${o.address.line2}` : ""}<br />
                  {o.address.city}, {o.address.region} {o.address.zip}<br />
                  {o.address.country}
                </p>
                <p className="flex items-center gap-2 text-xs text-mist mt-3"><IconCard size={13} /> •••• {o.last4} · Stripe vault</p>
              </div>

              {/* pipeline */}
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-neon mb-3">Pipeline</p>
                {o.status === "cancelled" ? (
                  <p className="text-xs text-rose2">Cancelled — refunded to •••• {o.last4}.</p>
                ) : (
                  <div className="flex items-center gap-1.5 mb-4">
                    {ORDER_FLOW.map((s, i) => {
                      const active = i <= flowIdx;
                      const next = i === flowIdx + 1;
                      return (
                        <div key={s} className="flex items-center gap-1.5 flex-1 last:flex-none">
                          <button
                            onClick={() => onStatus(s)}
                            className={cx(
                              "px-2.5 py-1.5 rounded-md text-[10px] font-mono uppercase tracking-wider border transition-all whitespace-nowrap",
                              active ? "border-neon/50 bg-neon/12 text-neon" : next ? "border-white/20 text-fog hover:border-neon/50 hover:text-neon" : "border-white/10 text-mist/50 hover:text-mist"
                            )}
                          >
                            {STATUS_META[s].label}
                          </button>
                          {i < ORDER_FLOW.length - 1 && <span className={cx("flex-1 h-px min-w-2", i < flowIdx ? "bg-neon/60" : "bg-white/10")} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="space-y-1.5">
                  {o.timeline.map((t, i) => (
                    <p key={i} className="flex items-center gap-2 text-[11px] text-mist">
                      <span className={cx("w-1.5 h-1.5 rounded-full shrink-0", i === o.timeline.length - 1 ? "bg-neon anim-pulse-dot" : "bg-white/20")} />
                      <span className="text-fog/80">{t.note}</span>
                      <span className="ml-auto font-mono text-[9px] text-mist/60 shrink-0">{timeAgo(t.at)}</span>
                    </p>
                  ))}
                </div>
                {o.status !== "cancelled" && o.status !== "delivered" && (
                  <button
                    onClick={() => onStatus("cancelled")}
                    className="mt-3.5 text-[10px] font-mono uppercase tracking-wider text-mist hover:text-rose2 transition-colors"
                  >
                    ✕ Cancel & refund
                  </button>
                )}
              </div>
            </motion.div>
          </td>
        </tr>
      )}
    </>
  );
}
