import type { OrderStatus } from "./types";

export const cx = (...parts: (string | false | null | undefined)[]) =>
  parts.filter(Boolean).join(" ");

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: n % 1 === 0 ? 0 : 2 });

export const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const hashPass = (s: string) => {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return `h${(h >>> 0).toString(36)}.${s.length}`;
};

export const dateFmt = (t: number) =>
  new Date(t).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export const timeAgo = (t: number) => {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
};

export const ORDER_FLOW: OrderStatus[] = ["processing", "shipped", "delivered"];

export const STATUS_META: Record<OrderStatus, { label: string; tone: string; dot: string }> = {
  processing: { label: "Processing", tone: "text-amber2 border-amber2/30 bg-amber2/10", dot: "bg-amber2" },
  shipped: { label: "Shipped", tone: "text-neon border-neon/30 bg-neon/10", dot: "bg-neon" },
  delivered: { label: "Delivered", tone: "text-mint border-mint/30 bg-mint/10", dot: "bg-mint" },
  cancelled: { label: "Cancelled", tone: "text-rose2 border-rose2/30 bg-rose2/10", dot: "bg-rose2" },
};

/** deterministic pseudo-random series for charts */
export const seededSeries = (seed: number, n: number, base: number, amp: number) => {
  let s = seed;
  const out: number[] = [];
  for (let i = 0; i < n; i++) {
    s = (s * 16807) % 2147483647;
    const wave = Math.sin(i / 2.1) * 0.35 + Math.sin(i / 5.3) * 0.25;
    out.push(Math.round(base + wave * amp + ((s % 1000) / 1000) * amp * 0.8));
  }
  return out;
};

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/**
 * Lenient subsequence match for typo-tolerant search.
 * Scores higher on consecutive runs and early matches; returns null for no match.
 */
export const fuzzyScore = (query: string, target: string): number | null => {
  const q = query.trim().toLowerCase();
  const t = target.toLowerCase();
  if (!q) return 0;
  if (t.includes(q)) return 100 + (t.length - q.length) * -0.5 + (q.length * 4);
  let ti = 0;
  let score = 0;
  let streak = 0;
  for (const ch of q) {
    if (ch === " ") continue;
    const idx = t.indexOf(ch, ti);
    if (idx === -1) return null;
    streak = idx === ti ? streak + 1 : 1;
    score += 10 + streak * 2 - Math.min(idx, 40) * 0.15;
    ti = idx + 1;
  }
  return score;
};

export const fuzzyMatch = (query: string, target: string): boolean =>
  fuzzyScore(query, target) !== null;
