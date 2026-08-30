import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import { cx, fmt, dateFmt, STATUS_META, ORDER_FLOW } from "../lib/utils";
import { NeonButton, Tag } from "../components/ui";
import { IconCard, IconCheck, IconPin, IconSearch, IconTruck } from "../components/icons";

export default function Track() {
  const orders = useStore((s) => s.orders);
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("id") ?? "");
  const [searched, setSearched] = useState<string | null>(params.get("id"));

  const order = useMemo(
    () => orders.find((o) => o.id.toLowerCase() === (searched ?? "").trim().toLowerCase()),
    [orders, searched]
  );

  const run = (id: string) => {
    setQuery(id);
    setSearched(id);
  };

  const meta = order ? STATUS_META[order.status] : null;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 pt-28 pb-12">
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-3">Manifest locator</p>
      <h1 className="font-display text-4xl md:text-5xl font-bold text-white leading-[1.02]">
        Track your <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-viol">drop.</span>
      </h1>
      <p className="text-mist mt-3 max-w-lg">
        No account needed — enter the manifest ID from your confirmation and we'll pull the flight plan straight from the ledger.
      </p>

      {/* terminal input */}
      <div className="glass rounded-xl mt-8 p-4 flex items-center gap-3 focus-within:border-neon/50 transition-colors">
        <span className="font-mono text-neon text-sm select-none">&gt;_</span>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && run(query)}
          placeholder="WH-XXXXXXXX"
          className="flex-1 bg-transparent outline-none font-mono text-sm text-white placeholder:text-mist/40 uppercase tracking-wider"
        />
        <NeonButton onClick={() => run(query)} className="!px-5 !py-2.5">
          <IconSearch size={15} /> Locate
        </NeonButton>
      </div>

      {/* demo hints */}
      <div className="flex flex-wrap items-center gap-2 mt-4">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-mist">Try a live manifest:</span>
        {orders.slice(0, 3).map((o) => (
          <button
            key={o.id}
            onClick={() => run(o.id)}
            className="px-2.5 py-1 glass rounded-md text-[11px] font-mono text-neon hover:border-neon/50 hover:bg-neon/10 transition-colors"
          >
            {o.id}
          </button>
        ))}
      </div>

      {/* result */}
      {searched && (
        <div className="mt-10">
          {!order ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border-rose2/30 p-8 text-center">
              <p className="font-mono text-rose2 text-sm tracking-[0.25em] uppercase mb-3">No signal found</p>
              <p className="font-display text-xl font-bold text-white">No manifest matches “{searched}”.</p>
              <p className="text-sm text-mist mt-2">Double-check the ID on your confirmation, or ping the 8K uplink.</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div className="glass rounded-2xl p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                  <div>
                    <p className="font-mono text-lg text-white">{order.id}</p>
                    <p className="text-[11px] font-mono text-mist mt-0.5">Placed {dateFmt(order.createdAt)} · {order.items.reduce((a, i) => a + i.qty, 0)} units</p>
                  </div>
                  <span className={cx("px-3 py-1 rounded-full text-[11px] font-mono border flex items-center gap-1.5", meta!.tone)}>
                    <span className={cx("w-1.5 h-1.5 rounded-full", meta!.dot)} /> {meta!.label}
                  </span>
                </div>

                {/* timeline */}
                <div className="grid grid-cols-3 gap-2">
                  {ORDER_FLOW.map((s, i) => {
                    const entry = order.timeline.find((t) => t.status === s);
                    const idx = ORDER_FLOW.indexOf(order.status);
                    const done = order.status === "cancelled" ? false : i <= idx;
                    return (
                      <div key={s}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={cx("w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0", done ? "bg-gradient-to-r from-neon to-viol text-void" : "bg-white/8 text-mist")}>
                            {done ? <IconCheck size={11} /> : i + 1}
                          </span>
                          {i < 2 && <span className={cx("flex-1 h-px", done && i < idx ? "bg-neon/60" : "bg-white/10")} />}
                        </div>
                        <p className={cx("text-xs font-semibold", done ? "text-white" : "text-mist")}>{STATUS_META[s].label}</p>
                        <p className="text-[10px] font-mono text-mist mt-0.5">{entry ? dateFmt(entry.at) : "pending"}</p>
                      </div>
                    );
                  })}
                </div>
                {order.status === "cancelled" && <p className="text-sm text-rose2 mt-4">This order was cancelled and refunded to •••• {order.last4}.</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div className="glass rounded-2xl p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon mb-3">Cargo</p>
                  <div className="space-y-3">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <img src={it.image} alt="" className="w-11 h-11 rounded-lg object-cover border hairline" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-white font-medium truncate">{it.name}</p>
                          <p className="text-[10px] font-mono text-mist">{it.color} × {it.qty}</p>
                        </div>
                        <span className="font-mono text-xs text-fog">{fmt(it.price * it.qty)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t hairline mt-4 pt-3 flex justify-between text-sm">
                    <span className="text-mist">Total</span>
                    <span className="font-mono text-neon">{fmt(order.total)}</span>
                  </div>
                </div>

                <div className="glass rounded-2xl p-5 space-y-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon mb-2 flex items-center gap-1.5"><IconPin size={11} /> Drop point</p>
                    <p className="text-sm text-white font-medium">{order.address.city}, {order.address.country}</p>
                    <p className="text-[11px] text-mist mt-0.5">{order.address.region} {order.address.zip}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon mb-2 flex items-center gap-1.5"><IconTruck size={11} /> Freight lane</p>
                    <p className="text-sm text-white font-medium">{order.shippingMethod}</p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-neon mb-2 flex items-center gap-1.5"><IconCard size={11} /> Channel</p>
                    <p className="text-sm text-white font-medium">•••• {order.last4}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {!searched && (
        <div className="mt-10 glass rounded-2xl p-6 flex items-start gap-4">
          <Tag tone="neon">TIP</Tag>
          <p className="text-sm text-mist leading-relaxed">
            Your manifest ID looks like <span className="font-mono text-neon">WH-XXXXXXXX</span> and lives at the top of your order
            confirmation. Freight ETAs update the moment a package hands off to the orbital carrier.
          </p>
        </div>
      )}
    </div>
  );
}
