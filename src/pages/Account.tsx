import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../store/store";
import type { Order } from "../lib/types";
import { cx, fmt, dateFmt, STATUS_META, ORDER_FLOW } from "../lib/utils";
import { Field, inputCls, Modal, NeonButton, Tag } from "../components/ui";
import { IconBolt, IconBox, IconCard, IconCheck, IconChevron, IconPin, IconPlus, IconTrash, IconUser, IconEdit } from "../components/icons";

const TABS = [
  { id: "orders", label: "Orders", icon: <IconBox size={15} /> },
  { id: "profile", label: "Profile", icon: <IconUser size={15} /> },
  { id: "addresses", label: "Addresses", icon: <IconPin size={15} /> },
] as const;

function TrackingTimeline({ order }: { order: Order }) {
  if (order.status === "cancelled") {
    return <p className="text-sm text-rose2">This order was cancelled and refunded to •••• {order.last4}.</p>;
  }
  const idx = ORDER_FLOW.indexOf(order.status);
  return (
    <div className="grid grid-cols-3 gap-2">
      {ORDER_FLOW.map((s, i) => {
        const entry = order.timeline.find((t) => t.status === s);
        const done = i <= idx;
        return (
          <div key={s} className="relative">
            <div className="flex items-center gap-2 mb-2">
              <span className={cx("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all", done ? "bg-gradient-to-r from-neon to-viol text-void" : "bg-white/8 text-mist")}>
                {done ? <IconCheck size={11} /> : i + 1}
              </span>
              {i < 2 && <span className={cx("flex-1 h-px", done && i < idx + 1 && i < idx ? "bg-neon/60" : "bg-white/10")} />}
            </div>
            <p className={cx("text-xs font-semibold", done ? "text-white" : "text-mist")}>{STATUS_META[s].label}</p>
            <p className="text-[10px] font-mono text-mist mt-0.5">{entry ? dateFmt(entry.at) : "pending"}</p>
            {entry && <p className="text-[10px] text-mist/70 mt-0.5">{entry.note}</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function Account() {
  const { user, orders, updateProfile, changePassword, saveAddress, deleteAddress, reorder, cancelOrder, creditBalances } = useStore();
  const toast = useStore((s) => s.toast);
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("orders");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [pw, setPw] = useState({ cur: "", next: "", confirm: "" });
  const [pwErr, setPwErr] = useState("");

  const [addrModal, setAddrModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [af, setAf] = useState({ label: "Home", fullName: "", line1: "", line2: "", city: "", region: "", zip: "", country: "" });
  const [afErr, setAfErr] = useState<Record<string, string>>({});

  if (!user) return <Navigate to="/auth?next=/account" replace />;

  const myOrders = orders.filter((o) => o.userId === user.id);
  const credits = creditBalances[user.id] ?? 0;

  const saveProfile = () => {
    if (name.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast("error", "Check your inputs", "Name and valid email required.");
      return;
    }
    updateProfile(name.trim(), email.trim());
  };

  const submitPw = () => {
    if (pw.next.length < 8) return setPwErr("New passphrase needs 8+ characters.");
    if (pw.next !== pw.confirm) return setPwErr("New passphrases don't match.");
    const err = changePassword(pw.cur, pw.next);
    if (err) return setPwErr(err);
    setPwErr("");
    setPw({ cur: "", next: "", confirm: "" });
  };

  const openAddr = (id?: string) => {
    if (id) {
      const a = user.addresses.find((x) => x.id === id)!;
      setAf({ label: a.label, fullName: a.fullName, line1: a.line1, line2: a.line2 ?? "", city: a.city, region: a.region, zip: a.zip, country: a.country });
      setEditing(id);
    } else {
      setAf({ label: "Home", fullName: user.name, line1: "", line2: "", city: "", region: "", zip: "", country: "" });
      setEditing(null);
    }
    setAfErr({});
    setAddrModal(true);
  };

  const submitAddr = () => {
    const e: Record<string, string> = {};
    if (af.fullName.trim().length < 2) e.fullName = "Required";
    if (af.line1.trim().length < 4) e.line1 = "Required";
    if (!af.city.trim()) e.city = "Required";
    if (!af.country.trim()) e.country = "Required";
    setAfErr(e);
    if (Object.keys(e).length) return;
    saveAddress({ ...(editing ? { id: editing } : {}), ...af });
    setAddrModal(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-8">
      <div className="glass rounded-2xl p-6 md:p-8 mb-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-viol/12 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-5">
          <span className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon/25 to-viol/25 border border-white/10 flex items-center justify-center font-display font-bold text-white text-xl">
            {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </span>
          <div className="flex-1 min-w-[200px]">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-neon mb-1">Operator dashboard</p>
            <h1 className="font-display text-3xl font-bold text-white">{user.name}</h1>
            <p className="text-xs text-mist font-mono mt-1">Joined {dateFmt(user.createdAt)} · {user.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-mist">Credits</p>
            <p className="font-mono text-2xl text-viol flex items-center gap-1.5 justify-end">
              <IconBolt size={16} className="text-viol" /> {credits}
            </p>
            <p className="text-[10px] text-mist/70 font-mono">= {fmt(credits)} at checkout</p>
          </div>
          <Tag tone={user.role === "admin" ? "viol" : "mint"}>{user.role === "admin" ? "ADMIN CLEARANCE" : "CIVILIAN"}</Tag>
        </div>
      </div>

      <div className="flex gap-2 mb-7 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-display font-semibold tracking-wide whitespace-nowrap transition-all",
              tab === t.id ? "bg-gradient-to-r from-neon to-viol text-void shadow-[0_0_22px_-8px_rgba(45,226,255,0.7)]" : "glass text-mist hover:text-white"
            )}
          >
            {t.icon} {t.label}
            {t.id === "orders" && myOrders.length > 0 && <span className="text-[10px] font-mono">({myOrders.length})</span>}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
          {/* -------- ORDERS -------- */}
          {tab === "orders" && (
            <div className="space-y-4">
              {myOrders.length === 0 && (
                <div className="glass rounded-2xl py-16 text-center">
                  <IconBox size={32} className="mx-auto text-mist mb-4" />
                  <p className="font-display text-xl font-bold text-white">No missions yet</p>
                  <p className="text-sm text-mist mt-2 mb-6">Your order history will materialize here after your first drop.</p>
                  <Link to="/shop"><NeonButton>Browse catalog</NeonButton></Link>
                </div>
              )}
              {myOrders.map((o) => {
                const open = expanded === o.id;
                const meta = STATUS_META[o.status];
                return (
                  <div key={o.id} className="glass glow-hover rounded-2xl overflow-hidden">
                    <button onClick={() => setExpanded(open ? null : o.id)} className="w-full flex flex-wrap items-center gap-4 p-5 text-left">
                      <div className="flex -space-x-3">
                        {o.items.slice(0, 3).map((it, i) => (
                          <img key={i} src={it.image} alt="" className="w-11 h-11 rounded-lg object-cover border-2 border-abyss" />
                        ))}
                      </div>
                      <div className="flex-1 min-w-[160px]">
                        <p className="font-mono text-sm text-white flex items-center gap-2">
                          {o.id}
                          {o.creditsEarned ? (
                            <span className="text-[10px] font-mono text-viol">+{o.creditsEarned}cr</span>
                          ) : null}
                          {o.creditsUsed ? (
                            <span className="text-[10px] font-mono text-mint">−{o.creditsUsed}cr</span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-mist font-mono mt-0.5">{dateFmt(o.createdAt)} · {o.items.reduce((a, i) => a + i.qty, 0)} units · {o.shippingMethod}</p>
                      </div>
                      <span className={cx("px-3 py-1 rounded-full text-[11px] font-mono border flex items-center gap-1.5", meta.tone)}>
                        <span className={cx("w-1.5 h-1.5 rounded-full", meta.dot)} /> {meta.label}
                      </span>
                      <span className="font-mono text-white">{fmt(o.total)}</span>
                      <IconChevron size={16} className={cx("text-mist transition-transform duration-300", open && "rotate-90 text-neon")} />
                    </button>
                    <motion.div initial={false} animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }} className="overflow-hidden">
                      <div className="border-t hairline p-5 space-y-5">
                        <TrackingTimeline order={o} />
                        <div className="grid md:grid-cols-2 gap-5">
                          <div className="space-y-2.5">
                            {o.items.map((it, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <img src={it.image} alt="" className="w-10 h-10 rounded-md object-cover border hairline" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs text-white font-medium truncate">{it.name}</p>
                                  <p className="text-[10px] font-mono text-mist">{it.color} × {it.qty}</p>
                                </div>
                                <span className="font-mono text-xs text-fog">{fmt(it.price * it.qty)}</span>
                              </div>
                            ))}
                          </div>
                          <div className="glass rounded-xl p-4 text-xs space-y-2 h-fit">
                            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon mb-1">Drop point</p>
                            <p className="text-white font-medium">{o.address.fullName}</p>
                            <p className="text-mist">{o.address.line1}, {o.address.city} {o.address.zip}</p>
                            <p className="text-mist">{o.address.country}</p>
                            <div className="border-t hairline pt-2 mt-2 flex items-center gap-2 text-mist">
                              <IconCard size={13} /> •••• {o.last4} · freight {o.shippingCost === 0 ? "free" : fmt(o.shippingCost)}
                              {o.discount > 0 && <span className="text-mint">· -{fmt(o.discount)}</span>}
                            </div>
                          </div>
                        </div>
                        {o.status !== "cancelled" && (
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t hairline pt-4">
                            {o.status === "processing" ? (
                              <button
                                onClick={() => cancelOrder(o.id)}
                                className="text-xs font-mono uppercase tracking-wider text-mist hover:text-rose2 transition-colors"
                              >
                                Cancel &amp; refund
                              </button>
                            ) : (
                              <span />
                            )}
                            <NeonButton variant="ghost" onClick={() => reorder(o.items)}>
                              <IconBox size={15} /> Reorder this manifest
                            </NeonButton>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          )}

          {/* -------- PROFILE -------- */}
          {tab === "profile" && (
            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-5">Identity</h3>
                <div className="space-y-4">
                  <Field label="Callsign"><input value={name} onChange={(e) => setName(e.target.value)} className={inputCls()} /></Field>
                  <Field label="Email uplink"><input value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls()} type="email" /></Field>
                  <NeonButton onClick={saveProfile}>Save changes</NeonButton>
                </div>
              </div>
              <div className="glass rounded-2xl p-6">
                <h3 className="font-display font-bold text-white mb-5">Passphrase</h3>
                <div className="space-y-4">
                  <Field label="Current"><input value={pw.cur} onChange={(e) => setPw({ ...pw, cur: e.target.value })} className={inputCls()} type="password" /></Field>
                  <Field label="New" hint="8+ chars"><input value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} className={inputCls()} type="password" /></Field>
                  <Field label="Confirm new"><input value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} className={inputCls()} type="password" /></Field>
                  {pwErr && <p className="text-rose2 text-xs">{pwErr}</p>}
                  <NeonButton variant="violet" onClick={submitPw}>Rotate passphrase</NeonButton>
                </div>
              </div>
            </div>
          )}

          {/* -------- ADDRESSES -------- */}
          {tab === "addresses" && (
            <div>
              <div className="flex justify-between items-center mb-5">
                <p className="text-sm text-mist">{user.addresses.length} drop point{user.addresses.length === 1 ? "" : "s"} on file</p>
                <NeonButton onClick={() => openAddr()}><IconPlus size={14} /> New address</NeonButton>
              </div>
              {user.addresses.length === 0 ? (
                <div className="glass rounded-2xl py-14 text-center">
                  <IconPin size={30} className="mx-auto text-mist mb-4" />
                  <p className="text-mist text-sm">No drop points registered. Add one to speed through checkout.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.addresses.map((a) => (
                    <div key={a.id} className="glass glow-hover rounded-xl p-5 relative">
                      <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-neon mb-2 flex items-center gap-1.5"><IconPin size={11} /> {a.label}</p>
                      <p className="text-sm text-white font-semibold">{a.fullName}</p>
                      <p className="text-xs text-mist mt-1.5 leading-relaxed">{a.line1}{a.line2 ? `, ${a.line2}` : ""}<br />{a.city}, {a.region} {a.zip}<br />{a.country}</p>
                      <div className="flex gap-2 mt-4">
                        <button onClick={() => openAddr(a.id)} className="flex-1 py-2 rounded-md border border-white/12 text-xs text-fog hover:border-neon/50 hover:text-neon transition-colors flex items-center justify-center gap-1.5">
                          <IconEdit size={12} /> Edit
                        </button>
                        <button onClick={() => deleteAddress(a.id)} aria-label="Delete address" className="px-3 py-2 rounded-md border border-white/12 text-mist hover:border-rose2/50 hover:text-rose2 transition-colors">
                          <IconTrash size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* address modal */}
      <Modal open={addrModal} onClose={() => setAddrModal(false)}>
        <h3 className="font-display text-xl font-bold text-white mb-5">{editing ? "Edit drop point" : "New drop point"}</h3>
        <div className="space-y-4">
          <div className="flex gap-2">
            {["Home", "Station", "Work"].map((l) => (
              <button key={l} onClick={() => setAf({ ...af, label: l })} className={cx("flex-1 py-2 rounded-md text-xs font-mono uppercase border transition-all", af.label === l ? "border-neon/60 text-neon bg-neon/10" : "border-white/10 text-mist")}>
                {l}
              </button>
            ))}
          </div>
          <Field label="Recipient" error={afErr.fullName}><input value={af.fullName} onChange={(e) => setAf({ ...af, fullName: e.target.value })} className={inputCls(afErr.fullName)} /></Field>
          <Field label="Street" error={afErr.line1}><input value={af.line1} onChange={(e) => setAf({ ...af, line1: e.target.value })} className={inputCls(afErr.line1)} /></Field>
          <Field label="Unit (optional)"><input value={af.line2} onChange={(e) => setAf({ ...af, line2: e.target.value })} className={inputCls()} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="City" error={afErr.city}><input value={af.city} onChange={(e) => setAf({ ...af, city: e.target.value })} className={inputCls(afErr.city)} /></Field>
            <Field label="Region"><input value={af.region} onChange={(e) => setAf({ ...af, region: e.target.value })} className={inputCls()} /></Field>
            <Field label="Postal code"><input value={af.zip} onChange={(e) => setAf({ ...af, zip: e.target.value })} className={inputCls()} /></Field>
            <Field label="Country" error={afErr.country}><input value={af.country} onChange={(e) => setAf({ ...af, country: e.target.value })} className={inputCls(afErr.country)} /></Field>
          </div>
          <NeonButton onClick={submitAddr} className="w-full">{editing ? "Save changes" : "Register drop point"}</NeonButton>
        </div>
      </Modal>
    </div>
  );
}
