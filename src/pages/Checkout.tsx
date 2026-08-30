import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { cartSubtotal, useStore } from "../store/store";
import type { Address, Order } from "../lib/types";
import { SHIPPING_METHODS, PROMO_CODES } from "../data/catalog";
import { cx, fmt, uid } from "../lib/utils";
import { Field, inputCls, NeonButton } from "../components/ui";
import { IconArrow, IconCard, IconCheck, IconChevron, IconPin, IconStripe, IconTruck } from "../components/icons";

const STEPS = ["Address", "Shipping", "Payment"];

export default function Checkout() {
  const { cart, products, user, placeOrder, saveAddress } = useStore();
  const toast = useStore((s) => s.toast);
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<Order | null>(null);

  const [addr, setAddr] = useState({ fullName: user?.name ?? "", line1: "", line2: "", city: "", region: "", zip: "", country: "" });
  const [addrLabel, setAddrLabel] = useState("Home");
  const [saveIt, setSaveIt] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shipId, setShipId] = useState(SHIPPING_METHODS[1].id);
  const [card, setCard] = useState({ name: user?.name ?? "", number: "", exp: "", cvc: "" });
  const [paying, setPaying] = useState(false);
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = cartSubtotal(cart, products);
  const method = SHIPPING_METHODS.find((m) => m.id === shipId)!;
  const shipCost = subtotal >= 150 && method.cost > 0 ? 0 : method.cost;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  if (!user) return <Navigate to="/auth?next=/checkout" replace />;
  if (cart.length === 0 && !done) return <Navigate to="/shop" replace />;

  const validateAddress = () => {
    const e: Record<string, string> = {};
    if (addr.fullName.trim().length < 2) e.fullName = "Recipient required";
    if (addr.line1.trim().length < 4) e.line1 = "Street address required";
    if (!addr.city.trim()) e.city = "City required";
    if (!addr.region.trim()) e.region = "Region required";
    if (addr.zip.trim().length < 3) e.zip = "Invalid code";
    if (!addr.country.trim()) e.country = "Country required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validatePayment = () => {
    const e: Record<string, string> = {};
    if (card.name.trim().length < 2) e.name = "Name on card required";
    if (card.number.replace(/\s/g, "").length !== 16) e.number = "16 digits required";
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(card.exp)) e.exp = "MM/YY";
    if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3–4 digits";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (step === 0 && !validateAddress()) return;
    if (step === 1 && shipId) { /* always valid */ }
    setErrors({});
    setStep((s) => Math.min(2, s + 1));
  };

  const pay = () => {
    if (!validatePayment()) return;
    setPaying(true);
    setTimeout(() => {
      const address: Address = { id: uid(), label: addrLabel, ...addr };
      if (saveIt) saveAddress({ label: addrLabel, ...addr });
      const order = placeOrder({
        address,
        shippingMethod: method.name,
        shippingCost: shipCost,
        discount,
        last4: card.number.replace(/\s/g, "").slice(-4),
      });
      setDone(order);
      setPaying(false);
      toast("success", "Payment authorized", `Order ${order.id} confirmed.`);
    }, 1600);
  };

  /* ---------- success ---------- */
  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 pt-32 pb-24">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", damping: 16 }} className="w-20 h-20 mx-auto rounded-full bg-mint/15 border border-mint/40 flex items-center justify-center text-mint shadow-[0_0_50px_-10px_rgba(92,255,192,0.6)]">
          <IconCheck size={34} />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center mt-6">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-mint mb-3">Transmission complete</p>
          <h1 className="font-display text-4xl font-bold text-white">Order locked in.</h1>
          <p className="text-mist mt-3">
            <span className="font-mono text-neon">{done.id}</span> · {done.items.length} unit{done.items.length > 1 ? "s" : ""} ·{" "}
            <span className="font-mono text-white">{fmt(done.total)}</span> charged to •••• {done.last4}
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="glass rounded-2xl p-6 mt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-mist mb-4">Flight plan</p>
          <div className="space-y-4">
            {["Order received — payment authorized", "Processing — unit pre-flight check", "Shipping — handed to orbital carrier"].map((s, i) => (
              <div key={s} className="flex items-center gap-3.5">
                <span className={cx("w-3 h-3 rounded-full shrink-0", i === 0 ? "bg-mint anim-pulse-dot" : "bg-white/15")} />
                <span className={cx("text-sm", i === 0 ? "text-white" : "text-mist")}>{s}</span>
                {i === 0 && <span className="ml-auto text-[10px] font-mono text-mint">NOW</span>}
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 mt-7">
            <NeonButton onClick={() => nav("/account")} className="flex-1">Track order <IconArrow size={15} /></NeonButton>
            <NeonButton variant="ghost" onClick={() => nav("/shop")} className="flex-1">Keep scanning</NeonButton>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ---------- flow ---------- */
  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 pt-24 pb-8">
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-2">Secure uplink</p>
      <h1 className="font-display text-4xl font-bold text-white mb-8">Checkout</h1>

      {/* stepper */}
      <div className="flex items-center gap-0 mb-10 max-w-xl">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1 last:flex-none">
            <button onClick={() => i < step && setStep(i)} className={cx("flex items-center gap-2.5", i < step && "cursor-pointer")}>
              <span className={cx(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono transition-all duration-500",
                i < step ? "bg-mint/20 text-mint border border-mint/40" : i === step ? "bg-gradient-to-r from-neon to-viol text-void shadow-[0_0_18px_-4px_rgba(45,226,255,0.7)]" : "bg-white/5 text-mist border border-white/10"
              )}>
                {i < step ? <IconCheck size={13} /> : i + 1}
              </span>
              <span className={cx("text-xs font-mono uppercase tracking-wider hidden sm:block", i === step ? "text-white" : "text-mist")}>{s}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-3 relative overflow-hidden bg-white/10">
                <motion.div initial={false} animate={{ width: step > i ? "100%" : "0%" }} className="absolute inset-y-0 left-0 bg-gradient-to-r from-neon to-viol" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="space-y-5">
                  {user.addresses.length > 0 && (
                    <div>
                      <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist mb-3">Saved drop points</p>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {user.addresses.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => setAddr({ fullName: a.fullName, line1: a.line1, line2: a.line2 ?? "", city: a.city, region: a.region, zip: a.zip, country: a.country })}
                            className={cx(
                              "glass rounded-xl p-4 text-left transition-all hover:border-neon/40",
                              addr.line1 === a.line1 && addr.city === a.city ? "border-neon/60 shadow-[0_0_20px_-8px_rgba(45,226,255,0.5)]" : ""
                            )}
                          >
                            <p className="text-xs font-mono uppercase tracking-wider text-neon mb-1.5 flex items-center gap-1.5"><IconPin size={12} /> {a.label}</p>
                            <p className="text-sm text-white font-medium">{a.fullName}</p>
                            <p className="text-xs text-mist mt-1 leading-relaxed">{a.line1}, {a.city} {a.zip}, {a.country}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist">Delivery coordinates</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field label="Recipient" error={errors.fullName}>
                      <input value={addr.fullName} onChange={(e) => setAddr({ ...addr, fullName: e.target.value })} className={inputCls(errors.fullName)} placeholder="Kai Demo" />
                    </Field>
                    <Field label="Label">
                      <div className="flex gap-2">
                        {["Home", "Station", "Work"].map((l) => (
                          <button key={l} onClick={() => setAddrLabel(l)} className={cx("flex-1 py-2.5 rounded-md text-xs font-mono uppercase tracking-wider border transition-all", addrLabel === l ? "border-neon/60 text-neon bg-neon/10" : "border-white/10 text-mist hover:text-white")}>
                            {l}
                          </button>
                        ))}
                      </div>
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Street address" error={errors.line1}>
                        <input value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} className={inputCls(errors.line1)} placeholder="88 Meridian Row, Sector 7" />
                      </Field>
                    </div>
                    <Field label="Unit / apt (optional)">
                      <input value={addr.line2} onChange={(e) => setAddr({ ...addr, line2: e.target.value })} className={inputCls()} placeholder="Dock 4B" />
                    </Field>
                    <Field label="City" error={errors.city}>
                      <input value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} className={inputCls(errors.city)} placeholder="Neo Kyoto" />
                    </Field>
                    <Field label="Region" error={errors.region}>
                      <input value={addr.region} onChange={(e) => setAddr({ ...addr, region: e.target.value })} className={inputCls(errors.region)} placeholder="Kansai Grid" />
                    </Field>
                    <Field label="Postal code" error={errors.zip}>
                      <input value={addr.zip} onChange={(e) => setAddr({ ...addr, zip: e.target.value })} className={inputCls(errors.zip)} placeholder="520-0781" />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Country" error={errors.country}>
                        <input value={addr.country} onChange={(e) => setAddr({ ...addr, country: e.target.value })} className={inputCls(errors.country)} placeholder="Japan" />
                      </Field>
                    </div>
                  </div>
                  <label className="flex items-center gap-2.5 text-sm text-mist cursor-pointer select-none">
                    <button
                      onClick={() => setSaveIt(!saveIt)}
                      className={cx("w-5 h-5 rounded border flex items-center justify-center transition-all", saveIt ? "bg-gradient-to-r from-neon to-viol border-transparent text-void" : "border-white/20")}
                      aria-label="Toggle save address"
                    >
                      {saveIt && <IconCheck size={12} />}
                    </button>
                    Save this drop point to my account
                  </label>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-mist mb-1">Select freight lane</p>
                  {SHIPPING_METHODS.map((m) => {
                    const cost = subtotal >= 150 && m.cost > 0 ? 0 : m.cost;
                    const active = shipId === m.id;
                    return (
                      <motion.button
                        key={m.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShipId(m.id)}
                        className={cx(
                          "w-full glass rounded-xl p-5 flex items-center gap-4 text-left transition-all",
                          active ? "border-neon/60 shadow-[0_0_26px_-10px_rgba(45,226,255,0.55)]" : "hover:border-white/25"
                        )}
                      >
                        <span className={cx("w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0", active ? "border-neon" : "border-white/20")}>
                          {active && <span className="w-2.5 h-2.5 rounded-full bg-neon" />}
                        </span>
                        <span className="w-10 h-10 rounded-lg bg-white/5 border hairline flex items-center justify-center text-neon shrink-0">
                          <IconTruck size={18} />
                        </span>
                        <span className="flex-1">
                          <span className="block font-display font-semibold text-white">{m.name}</span>
                          <span className="block text-xs text-mist mt-0.5">{m.eta} · {m.note}</span>
                        </span>
                        <span className={cx("font-mono", cost === 0 ? "text-mint" : "text-white")}>{cost === 0 ? "FREE" : fmt(cost)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2.5 text-xs text-mist glass rounded-xl px-4 py-3 border-mint/25">
                    <IconStripe size={18} className="text-viol" />
                    Payments processed by <span className="text-white font-medium">Stripe</span> in test mode — no real charge will land.
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <Field label="Name on card" error={errors.name}>
                        <input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} className={inputCls(errors.name)} placeholder="KAI DEMO" />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Card number" error={errors.number} hint="test: any 16 digits">
                        <div className="relative">
                          <input
                            value={card.number}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                              setCard({ ...card, number: digits.replace(/(.{4})/g, "$1 ").trim() });
                            }}
                            inputMode="numeric"
                            className={cx(inputCls(errors.number), "pr-11 font-mono tracking-wider")}
                            placeholder="4242 4242 4242 4242"
                          />
                          <IconCard size={17} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mist" />
                        </div>
                      </Field>
                    </div>
                    <Field label="Expiry" error={errors.exp}>
                      <input
                        value={card.exp}
                        onChange={(e) => {
                          let v = e.target.value.replace(/[^\d]/g, "").slice(0, 4);
                          if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
                          setCard({ ...card, exp: v });
                        }}
                        inputMode="numeric"
                        className={cx(inputCls(errors.exp), "font-mono")}
                        placeholder="12/49"
                      />
                    </Field>
                    <Field label="CVC" error={errors.cvc}>
                      <input
                        value={card.cvc}
                        onChange={(e) => setCard({ ...card, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                        inputMode="numeric"
                        className={cx(inputCls(errors.cvc), "font-mono")}
                        placeholder="•••"
                        type="password"
                      />
                    </Field>
                  </div>

                  <div>
                    <Field label="Promo code (optional)">
                      <div className="flex gap-2">
                        <input
                          value={promo}
                          onChange={(e) => setPromo(e.target.value)}
                          className={cx(inputCls(), "uppercase")}
                          placeholder="NEON10"
                        />
                        <button
                          onClick={() => {
                            const c = promo.trim().toUpperCase();
                            if (PROMO_CODES[c]) {
                              setDiscount(Math.round(subtotal * PROMO_CODES[c]));
                              toast("success", `Code ${c} applied`);
                            } else toast("error", "Unknown code", "Try NEON10 or WEARLY25.");
                          }}
                          className="shrink-0 px-4 rounded-md border border-neon/40 text-neon text-xs font-mono uppercase hover:bg-neon/10 transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    </Field>
                    {discount > 0 && <p className="text-mint text-xs mt-1.5">-{fmt(discount)} locked in.</p>}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between mt-8">
            {step > 0 ? (
              <NeonButton variant="ghost" onClick={() => setStep(step - 1)}>
                <IconChevron size={15} className="rotate-180" /> Back
              </NeonButton>
            ) : (
              <Link to="/cart" className="text-sm text-mist hover:text-neon transition-colors self-center">← Back to cargo</Link>
            )}
            {step < 2 ? (
              <NeonButton onClick={next}>Continue <IconArrow size={15} /></NeonButton>
            ) : (
              <NeonButton onClick={pay} disabled={paying} className="min-w-[220px]">
                {paying ? (
                  <>
                    <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full" />
                    Authorizing…
                  </>
                ) : (
                  <>Pay {fmt(Math.max(0, subtotal - discount) + shipCost)}</>
                )}
              </NeonButton>
            )}
          </div>
        </div>

        {/* summary rail */}
        <aside className="h-fit lg:sticky lg:top-24 glass rounded-2xl p-6">
          <h3 className="font-display font-bold text-white mb-4">Manifest</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar pr-1">
            {cart.flatMap((c) => {
              const p = products.find((x) => x.id === c.productId);
              return p ? (
                <div key={c.productId + c.color} className="flex gap-3 items-center">
                  <div className="relative shrink-0">
                    <img src={p.image} alt="" className="w-12 h-12 object-cover rounded-lg border hairline" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-neon text-void text-[10px] font-bold flex items-center justify-center">{c.qty}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white font-medium truncate">{p.name}</p>
                    <p className="text-[10px] font-mono text-mist">{c.color}</p>
                  </div>
                  <span className="font-mono text-xs text-fog">{fmt(p.price * c.qty)}</span>
                </div>
              ) : [];
            })}
          </div>
          <div className="border-t hairline mt-4 pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><span className="text-mist">Units</span><span className="font-mono text-fog">{fmt(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-mist">Freight · {method.name.split(" ")[0]}</span><span className={cx("font-mono", shipCost === 0 ? "text-mint" : "text-fog")}>{shipCost === 0 ? "FREE" : fmt(shipCost)}</span></div>
            {discount > 0 && <div className="flex justify-between text-mint"><span>Discount</span><span className="font-mono">-{fmt(discount)}</span></div>}
            <div className="border-t hairline pt-3 flex justify-between items-baseline">
              <span className="text-white font-semibold">Total</span>
              <span className="font-mono text-xl text-neon">{fmt(Math.max(0, subtotal - discount) + shipCost)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
