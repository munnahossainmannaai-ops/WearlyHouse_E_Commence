import type { ReactElement } from "react";
import { motion } from "framer-motion";
import { useStore, type ThemeName } from "../store/store";
import { cx } from "../lib/utils";

/* protocol glyphs — hand-drawn, not an icon set */
const VoidGlyph = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const LuxGlyph = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 4.5 14 7l2.9-.6L16.3 9l2.7 1.4-2.7 1.4.6 2.6L14 13.8 12 16.5 10 13.8l-2.9.6.6-2.6L5 10.4 7.7 9l-.6-2.6L10 7z" />
    <path d="M12 1.5v1.4M12 21.1v1.4M2.9 10.4H1.5M22.5 10.4h-1.4" />
  </svg>
);

const OPTIONS: { id: ThemeName; label: string; glyph: (p: { size?: number }) => ReactElement }[] = [
  { id: "void", label: "Void", glyph: VoidGlyph },
  { id: "cleanroom", label: "Cleanroom", glyph: LuxGlyph },
];

export default function ThemeSwitch({ compact }: { compact?: boolean }) {
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);

  return (
    <div
      role="radiogroup"
      aria-label="Interface protocol"
      className={cx("inline-flex items-center glass rounded-full p-1 gap-0.5", compact ? "h-9" : "h-9")}
    >
      {OPTIONS.map((o) => {
        const active = theme === o.id;
        const Glyph = o.glyph;
        return (
          <button
            key={o.id}
            role="radio"
            aria-checked={active}
            title={`Protocol · ${o.label}`}
            onClick={() => setTheme(o.id)}
            className={cx(
              "relative flex items-center gap-1.5 rounded-full px-3 h-full text-[10px] font-mono uppercase tracking-[0.14em] transition-colors duration-300",
              active ? "text-void" : "text-mist hover:text-white"
            )}
          >
            {active && (
              <motion.span
                layoutId="protocol-pill"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-neon to-viol shadow-[0_0_16px_-4px_var(--neon-60)]"
              />
            )}
            <span className="relative flex items-center gap-1.5">
              <Glyph size={12} />
              {!compact && o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
