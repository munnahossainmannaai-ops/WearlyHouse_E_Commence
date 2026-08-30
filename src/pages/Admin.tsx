import { useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import type { OrderStatus, Product } from "../lib/types";
import { CATEGORIES, PRODUCT_IMAGES } from "../data/catalog";
import { cx, fmt, dateFmt, seededSeries, STATUS_META } from "../lib/utils";
import { Counter, Field, inputCls, Modal, NeonButton, Reveal, Tag } from "../components/ui";
import { IconAlert, IconBox, IconChart, IconEdit, IconPlus, IconTrash, IconUsers, IconEye, IconMinus, IconCheck } from "../components/icons";

const TABS = [
  { id: "overview", label: "Overview", icon: <IconChart size={15} /> },
  { id: "products", label: "Products", icon: <IconBox size={15} /> },
  { id: "orders", label: "Orders", icon: <IconBox size={15} /> },
  { id: "users", label: "Users", icon: <IconUsers size={15} /> },
] as const;

/* ---------- sales area chart ---------- */
const SalesChart = ({ data, labels }: { data: number[]; labels: string[] }) => {
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
        <motion.path d={area} fill="url(#salesFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} />
        <motion.path
          d={line} fill="none" stroke="url(#salesStroke)" strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.6, ease: "easeInOut" }}
          style={{ filter: "drop-shadow(0 0 6px var(--neon-60))" }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <rect
              x={p[0] - (W / data.length) / 2} y={0} width={W / data.length} height={H} fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
            <circle cx={p[0]} cy={p[1]} r={hover === i ? 5 : 3} strokeWidth="2" className="transition-all" style={{ fill: "var(--abyss)", stroke: hover === i ? "var(--neon)" : "var(--viol)" }} />
          </g>
        ))}
      </svg>
      <div className="flex justify-between mt-2 px-1">
        {labels.map((l, i) => (
          <span key={i} className={cx("text-[9px] font-mono", hover === i ? "text-neon" : "text-mist/60")}>{l}</span>
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

/* ---------- empty product form ---------- */
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
    { label: "Warranty", value: "2-year Nova coverage" },
    { label: "In the box", value: "Unit, dock, NovaLink cable" },
  ],
  createdAt: Date.now(),
});

export default function Admin() {
  const { user, users, products, orders, upsertProduct, deleteProduct, setStock, setOrderStatus } = useStore();
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [pfErr, setPfErr] = useState<Record<string, string>>({});
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const revenue = useMemo(() => orders.filter((o) => o.status !== "cancelled").reduce((a, o) => a + o.total, 0), [orders]);
  const lowStock = products.filter((p) => p.stock <= 5).sort((a, b) => a.stock - b.stock);

  const salesData = useMemo(() => {
    const base = seededSeries(42, 12, 26000, 14000);
    return base.map((v, i) => v + (i === 11 ? revenue * 0.6 : 0));
  }, [revenue]);
  const monthLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const catUnits = CATEGORIES.map((c) => ({
    name: c.name,
    n: products.filter((p) => p.category === c.id).length,
    rev: orders.reduce((a, o) => a + o.items.filter((i) => products.find((p) => p.id === i.productId)?.category === c.id).reduce((b, i) => b + i.price * i.qty, 0), 0),
  }));
  const maxCat = Math.max(...catUnits.map((c) => c.rev), 1);

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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-viol mb-2">Mission control</p>
          <h1 className="font-display text-4xl font-bold text-white">Admin Panel</h1>
        </div>
        <Tag tone="amber">{lowStock.length} low-stock alert{lowStock.length === 1 ? "" : "s"}</Tag>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-display font-semibold whitespace-nowrap transition-all",
              tab === t.id ? "bg-gradient-to-r from-neon to-viol text-void shadow-[0_0_22px_-8px_rgba(45,226,255,0.7)]" : "glass text-mist hover:text-white"
            )}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ================= OVERVIEW ================= */}
      {tab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { l: "Gross revenue", v: Math.round(revenue + 184_500), pre: "$", d: "+18.4%", up: true },
              { l: "Orders", v: orders.length + 412, d: "+9.1%", up: true },
              { l: "Operators", v: users.length + 1930, d: "+3.8%", up: true },
              { l: "Avg. order value", v: orders.length ? Math.round((revenue + 184_500) / (orders.length + 412)) : 448, pre: "$", d: "-1.2%", up: false },
            ].map((k, i) => (
              <Reveal key={k.l} delay={i * 0.07}>
                <div className="glass glow-hover rounded-2xl p-5 h-full">
                  <p className="text-[10px] font-mono uppercase tracking-[0.22em] text-mist mb-2.5">{k.l}</p>
                  <p className="font-display text-3xl font-bold text-white">
                    <Counter to={k.v} prefix={k.pre ?? ""} />
                  </p>
                  <span className={cx("inline-block mt-2.5 text-[11px] font-mono px-2 py-0.5 rounded-full border", k.up ? "text-mint border-mint/30 bg-mint/8" : "text-rose2 border-rose2/30 bg-rose2/8")}>
                    {k.d} vs last cycle
                  </span>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-display font-bold text-white">Revenue telemetry</h3>
                <span className="text-[10px] font-mono uppercase tracking-wider text-mist">FY 2049 · USD</span>
              </div>
              <SalesChart data={salesData} labels={monthLabels} />
            </div>

            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-5">Revenue by division</h3>
              <div className="space-y-4">
                {catUnits.map((c, i) => (
                  <div key={c.name}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-fog">{c.name}</span>
                      <span className="font-mono text-mist">{c.rev > 0 ? fmt(c.rev) : `${c.n} units`}</span>
                    </div>
                    <div className="h-2 bg-white/6 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(6, (c.rev / maxCat) * 100)}%` }}
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

          <div className="grid lg:grid-cols-2 gap-6">
            {/* low stock */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2.5">
                <IconAlert size={17} className="text-amber2" /> Low-stock alerts
              </h3>
              {lowStock.length === 0 ? (
                <p className="text-sm text-mint flex items-center gap-2"><IconCheck size={14} /> All inventory levels nominal.</p>
              ) : (
                <div className="space-y-2.5">
                  {lowStock.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                      <img src={p.image} alt="" className="w-11 h-11 rounded-lg object-cover border hairline" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{p.name}</p>
                        <p className="text-[10px] font-mono text-mist">{p.category} · {fmt(p.price)}</p>
                      </div>
                      <span className={cx("px-2.5 py-1 rounded-full text-[11px] font-mono border", p.stock === 0 ? "text-rose2 border-rose2/40 bg-rose2/10" : "text-amber2 border-amber2/40 bg-amber2/10")}>
                        {p.stock === 0 ? "OUT" : `${p.stock} left`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={() => setStock(p.id, Math.max(0, p.stock - 1))} aria-label="Decrease stock" className="w-7 h-7 rounded-md border border-white/12 text-mist hover:text-neon flex items-center justify-center transition-colors"><IconMinus size={12} /></button>
                        <button onClick={() => setStock(p.id, p.stock + 10)} className="px-2 h-7 rounded-md border border-neon/40 text-neon text-[10px] font-mono hover:bg-neon/10 transition-colors">+10</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* recent orders */}
            <div className="glass rounded-2xl p-6">
              <h3 className="font-display font-bold text-white mb-4">Latest orders</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-mist">No orders in this session yet — place one from the storefront to see it land here.</p>
              ) : (
                <div className="space-y-2.5">
                  {orders.slice(0, 5).map((o) => (
                    <div key={o.id} className="flex items-center gap-3 bg-white/[0.03] rounded-xl p-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-sm text-white">{o.id}</p>
                        <p className="text-[10px] text-mist font-mono">{o.userEmail} · {dateFmt(o.createdAt)}</p>
                      </div>
                      <span className={cx("px-2.5 py-1 rounded-full text-[10px] font-mono border", STATUS_META[o.status].tone)}>{STATUS_META[o.status].label}</span>
                      <span className="font-mono text-sm text-neon">{fmt(o.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= PRODUCTS ================= */}
      {tab === "products" && (
        <div>
          <div className="flex justify-between items-center mb-5">
            <p className="text-sm text-mist">{products.length} units in catalog</p>
            <NeonButton onClick={() => { setEditProduct(blankProduct()); setPfErr({}); }}>
              <IconPlus size={14} /> New unit
            </NeonButton>
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
                {products.map((p) => (
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
                        <span className={cx("w-8 text-center font-mono", p.stock <= 5 ? "text-amber2" : "text-white")}>{p.stock}</span>
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
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= ORDERS ================= */}
      {tab === "orders" && (
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
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

          {visibleOrders.length === 0 ? (
            <div className="glass rounded-2xl py-16 text-center">
              <IconBox size={30} className="mx-auto text-mist mb-4" />
              <p className="font-display text-lg font-bold text-white">No orders on this frequency</p>
              <p className="text-sm text-mist mt-2">Orders placed at the storefront land here in real time.</p>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-mono uppercase tracking-[0.18em] text-mist border-b hairline">
                    <th className="px-5 py-3.5">Order</th>
                    <th className="px-3 py-3.5">Operator</th>
                    <th className="px-3 py-3.5">Units</th>
                    <th className="px-3 py-3.5">Total</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visibleOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-white/[0.03] transition-colors">
                      <td className="px-5 py-3.5">
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
                      <td className="px-5 py-3.5">
                        <select
                          value={o.status}
                          onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                          className={cx("bg-panel border rounded-full px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider outline-none cursor-pointer", STATUS_META[o.status].tone)}
                        >
                          {(["processing", "shipped", "delivered", "cancelled"] as OrderStatus[]).map((s) => (
                            <option key={s} value={s} className="bg-panel text-fog">{STATUS_META[s].label}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= USERS ================= */}
      {tab === "users" && (
        <div className="glass rounded-2xl overflow-x-auto">
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-left text-[10px] font-mono uppercase tracking-[0.18em] text-mist border-b hairline">
                <th className="px-5 py-3.5">Operator</th>
                <th className="px-3 py-3.5">Joined</th>
                <th className="px-3 py-3.5">Orders</th>
                <th className="px-3 py-3.5">Role</th>
                <th className="px-5 py-3.5 text-right">Access</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => {
                const n = orders.filter((o) => o.userId === u.id).length;
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
                    <td className="px-3 py-3.5 font-mono text-fog">{n}</td>
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
                          className={cx("w-9 h-5 rounded-full p-0.5 transition-colors", u.active ? "bg-gradient-to-r from-neon to-viol" : "bg-white/10", self && "opacity-30 pointer-events-none")}
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
                      className={cx("relative aspect-square rounded-lg overflow-hidden border-2 transition-all", editProduct.image === img ? "border-neon shadow-[0_0_16px_-4px_rgba(45,226,255,0.6)]" : "border-white/10 opacity-60 hover:opacity-100")}
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
