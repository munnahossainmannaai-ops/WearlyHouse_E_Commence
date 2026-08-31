import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import { useStore } from "../store/store";
import { cx } from "../lib/utils";
import { IconCheck, IconClose, IconAlert, IconBolt, IconMinus, IconPlus, IconStar } from "./icons";

/* ---------------- scroll reveal ---------------- */
export const Reveal = ({
  children,
  delay = 0,
  y = 26,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

/* ---------------- section heading ---------------- */
export const SectionHead = ({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: ReactNode;
  right?: ReactNode;
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
    <div>
      <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-neon mb-3 flex items-center gap-2">
        <span className="inline-block w-6 h-px bg-neon/70" />
        {eyebrow}
      </p>
      <h2 className="font-display text-3xl md:text-[2.6rem] font-bold leading-[1.05] text-white">{title}</h2>
    </div>
    {right}
  </div>
);

/* ---------------- stars ---------------- */
export const Stars = ({ value, size = 14 }: { value: number; size?: number }) => (
  <span className="relative inline-flex text-white/15" aria-label={`${value} out of 5 stars`}>
    <span className="flex gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => (
        <IconStar key={i} size={size} />
      ))}
    </span>
    <span className="absolute inset-0 overflow-hidden text-neon" style={{ width: `${(value / 5) * 100}%` }}>
      <span className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <IconStar key={i} size={size} filled />
        ))}
      </span>
    </span>
  </span>
);

/* ---------------- count-up ---------------- */
export const Counter = ({ to, prefix = "", suffix = "", className }: { to: number; prefix?: string; suffix?: string; className?: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const t0 = performance.now();
    const dur = 1400;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);
  return (
    <span ref={ref} className={className}>
      {prefix}
      {v.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

/* ---------------- scramble decode ---------------- */
const GLYPHS = "!<>-_\\/[]{}—=+*^?#01";
export const useScramble = (text: string, active = true) => {
  const [out, setOut] = useState(active ? "" : text);
  useEffect(() => {
    if (!active) return setOut(text);
    let frame = 0;
    let raf = 0;
    const total = Math.max(18, text.length * 2);
    const tick = () => {
      frame++;
      const progress = frame / total;
      const settled = Math.floor(progress * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (ch === " " || ch === "\n") s += ch;
        else if (i < settled) s += ch;
        else s += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      }
      setOut(s);
      if (frame < total) raf = requestAnimationFrame(tick);
      else setOut(text);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active]);
  return out;
};

/* ---------------- buttons ---------------- */
export const NeonButton = ({
  children,
  onClick,
  variant = "primary",
  className,
  type = "button",
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost" | "violet";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
}) => (
  <motion.button
    type={type}
    disabled={disabled}
    onClick={onClick}
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.97 }}
    className={cx(
      "relative inline-flex items-center justify-center gap-2 font-display font-semibold tracking-wide clip-notch px-6 py-3 text-sm transition-all duration-300",
      variant === "primary" &&
        "bg-gradient-to-r from-neon to-viol text-void shadow-[0_0_30px_-8px_rgba(45,226,255,0.7)] hover:shadow-[0_0_44px_-6px_rgba(160,107,255,0.85)]",
      variant === "violet" &&
        "bg-viol/15 text-viol border border-viol/40 hover:bg-viol/25 hover:shadow-[0_0_30px_-8px_rgba(160,107,255,0.6)]",
      variant === "ghost" &&
        "glass text-fog hover:text-white hover:border-neon/50 hover:shadow-[0_0_30px_-10px_rgba(45,226,255,0.5)]",
      disabled && "opacity-50 cursor-not-allowed",
      className
    )}
  >
    {children}
  </motion.button>
);

/* ---------------- quantity stepper ---------------- */
export const QtyStepper = ({
  qty,
  onChange,
  max = 99,
  small,
}: {
  qty: number;
  onChange: (q: number) => void;
  max?: number;
  small?: boolean;
}) => (
  <div className={cx("inline-flex items-center glass rounded-md overflow-hidden", small ? "h-8" : "h-10")}>
    <button
      aria-label="Decrease quantity"
      onClick={() => onChange(qty - 1)}
      className="px-2.5 h-full text-mist hover:text-neon hover:bg-white/5 transition-colors"
    >
      <IconMinus size={14} />
    </button>
    <span className={cx("text-center font-mono tabular-nums", small ? "w-7 text-xs" : "w-9 text-sm")}>{qty}</span>
    <button
      aria-label="Increase quantity"
      disabled={qty >= max}
      onClick={() => onChange(qty + 1)}
      className="px-2.5 h-full text-mist hover:text-neon hover:bg-white/5 transition-colors disabled:opacity-30"
    >
      <IconPlus size={14} />
    </button>
  </div>
);

/* ---------------- badge ---------------- */
export const Tag = ({ children, tone = "neon" }: { children: ReactNode; tone?: "neon" | "viol" | "mint" | "amber" }) => (
  <span
    className={cx(
      "inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono uppercase tracking-[0.14em] border clip-notch",
      tone === "neon" && "text-neon border-neon/35 bg-neon/10",
      tone === "viol" && "text-viol border-viol/35 bg-viol/10",
      tone === "mint" && "text-mint border-mint/35 bg-mint/10",
      tone === "amber" && "text-amber2 border-amber2/35 bg-amber2/10"
    )}
  >
    {children}
  </span>
);

/* ---------------- form field ---------------- */
export const Field = ({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <label className="block">
    <span className="flex items-baseline justify-between mb-1.5">
      <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mist">{label}</span>
      {hint && <span className="text-[10px] text-mist/60">{hint}</span>}
    </span>
    {children}
    <AnimatePresence>
      {error && (
        <motion.span
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="block text-rose2 text-xs mt-1"
        >
          {error}
        </motion.span>
      )}
    </AnimatePresence>
  </label>
);

export const inputCls = (error?: string) =>
  cx(
    "w-full bg-white/[0.04] border rounded-md px-3.5 py-2.5 text-sm text-white placeholder:text-mist/50 outline-none transition-all duration-300",
    error
      ? "border-rose2/60 focus:border-rose2 focus:shadow-[0_0_18px_-6px_rgba(255,92,138,0.5)]"
      : "border-white/10 focus:border-neon/60 focus:bg-white/[0.06] focus:shadow-[0_0_20px_-8px_rgba(45,226,255,0.55)]"
  );

/* ---------------- modal ---------------- */
export const Modal = ({
  open,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-void/80 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 18 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className={cx("relative glass rounded-xl w-full max-h-[88vh] overflow-y-auto p-6 md:p-8", wide ? "max-w-3xl" : "max-w-md")}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="absolute top-4 right-4 text-mist hover:text-neon transition-colors"
          >
            <IconClose size={18} />
          </button>
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ---------------- toast host ---------------- */
export const ToastHost = () => {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const icons = {
    success: <IconCheck size={14} />,
    error: <IconClose size={14} />,
    info: <IconBolt size={14} />,
  };
  const tones = {
    success: "text-mint border-mint/40 shadow-[0_0_24px_-8px_rgba(92,255,192,0.5)]",
    error: "text-rose2 border-rose2/40 shadow-[0_0_24px_-8px_rgba(255,92,138,0.5)]",
    info: "text-neon border-neon/40 shadow-[0_0_24px_-8px_rgba(45,226,255,0.5)]",
  };
  return (
    <div className="fixed top-20 right-4 z-[100] flex flex-col gap-2 w-[min(92vw,340px)]" aria-live="polite" role="status">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.button
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            onClick={() => dismiss(t.id)}
            className={cx("glass rounded-lg px-4 py-3 text-left flex gap-3 items-start border cursor-pointer", tones[t.kind])}
          >
            <span className="mt-0.5 shrink-0">{icons[t.kind]}</span>
            <span>
              <span className="block text-sm font-semibold text-white">{t.title}</span>
              {t.message && <span className="block text-xs text-mist mt-0.5">{t.message}</span>}
            </span>
          </motion.button>
        ))}
      </AnimatePresence>
    </div>
  );
};

/* ---------------- stock meter ---------------- */
export const StockMeter = ({ stock }: { stock: number }) => {
  const pct = Math.min(100, (stock / 30) * 100);
  const tone = stock <= 5 ? "bg-rose2" : stock <= 10 ? "bg-amber2" : "bg-mint";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 flex-1 bg-white/8 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={cx("h-full rounded-full", tone)}
        />
      </div>
      <span className={cx("text-[11px] font-mono", stock <= 5 ? "text-rose2" : stock <= 10 ? "text-amber2" : "text-mint")}>
        {stock <= 5 ? `${stock} left` : `${stock} in stock`}
      </span>
    </div>
  );
};

/* ---------------- reveal list variant helper ---------------- */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

export const AlertNote = ({ children }: { children: ReactNode }) => (
  <div className="flex items-start gap-2.5 glass rounded-lg border-amber2/30 px-4 py-3 text-sm text-amber2/90">
    <IconAlert size={16} className="mt-0.5 shrink-0" />
    <span>{children}</span>
  </div>
);
