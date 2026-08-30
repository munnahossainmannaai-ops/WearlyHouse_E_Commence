import { useState } from "react";
import { useNavigate, useSearchParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import { cx } from "../lib/utils";
import { Field, inputCls, NeonButton } from "../components/ui";
import { IconEye, IconGoogle, IconLogo, IconBolt } from "../components/icons";

export default function Auth() {
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">(params.get("mode") === "signup" ? "signup" : "login");
  const next = params.get("next") ?? "/account";
  const { login, signup, quickLogin, googleLogin, user } = useStore();
  const nav = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", pass: "", confirm: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={next} replace />;

  const submit = () => {
    const e: Record<string, string> = {};
    if (mode === "signup" && form.name.trim().length < 2) e.name = "Name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (form.pass.length < 8) e.pass = "Minimum 8 characters";
    if (mode === "signup" && form.confirm !== form.pass) e.confirm = "Passwords don't match";
    setErrors(e);
    if (Object.keys(e).length) return;

    setBusy(true);
    setTimeout(() => {
      const err = mode === "login" ? login(form.email, form.pass) : signup(form.name.trim(), form.email, form.pass);
      setBusy(false);
      if (err) setErrors({ form: err });
      else nav(next);
    }, 600);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 pt-16">
      {/* brand panel */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-12 border-r hairline bg-abyss/50">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-neon/10 blur-[110px]" />
        <div className="absolute bottom-0 -right-24 w-96 h-96 rounded-full bg-viol/12 blur-[120px]" />

        <div className="relative flex items-center gap-3">
          <IconLogo size={30} />
          <span className="font-display font-bold tracking-[0.16em] text-white">WEARLY<span className="text-neon">//</span>HOUSE</span>
        </div>

        <div className="relative">
          <div className="relative w-44 h-44 mb-10">
            <svg viewBox="0 0 100 100" className="absolute inset-0 anim-spin-slow text-neon/30">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 5" />
            </svg>
            <svg viewBox="0 0 100 100" className="absolute inset-4 anim-spin-slow text-viol/40" style={{ animationDirection: "reverse" }}>
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="0.8" strokeDasharray="1 7" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <IconBolt size={40} className="text-neon text-glow" />
            </div>
          </div>
          <h1 className="font-display text-4xl xl:text-5xl font-bold text-white leading-[1.05] max-w-sm">
            One key. Every drop, <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon to-viol">fitted to you.</span>
          </h1>
          <p className="text-mist mt-4 max-w-sm leading-relaxed">
            Track drops, sync your wishlist across stations, and clear checkout in a single pass.
          </p>
        </div>

        <p className="relative font-mono text-[10px] tracking-[0.3em] uppercase text-mist/50">
          Clearance level 1 · civilian access
        </p>
      </div>

      {/* form panel */}
      <div className="flex items-center justify-center px-4 py-14">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
          <div className="flex glass rounded-full p-1 mb-8">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setErrors({}); }}
                className={cx(
                  "flex-1 py-2.5 rounded-full text-sm font-display font-semibold tracking-wide transition-all duration-300",
                  mode === m ? "bg-gradient-to-r from-neon to-viol text-void" : "text-mist hover:text-white"
                )}
              >
                {m === "login" ? "Sign in" : "Register"}
              </button>
            ))}
          </div>

          <h2 className="font-display text-3xl font-bold text-white">
            {mode === "login" ? "Re-link your session" : "Request clearance"}
          </h2>
          <p className="text-sm text-mist mt-2 mb-7">
            {mode === "login" ? "Authenticate to sync your cargo and orders." : "Takes 20 seconds. No blood sample required."}
          </p>

          <button
            onClick={() => { googleLogin(); nav(next); }}
            className="w-full glass rounded-lg py-3 flex items-center justify-center gap-3 text-sm font-medium text-fog hover:border-white/30 hover:bg-white/[0.06] transition-all mb-5"
          >
            <IconGoogle size={17} className="text-neon" /> Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-white/10" />
            <span className="text-[10px] font-mono uppercase tracking-[0.25em] text-mist">or via uplink</span>
            <span className="flex-1 h-px bg-white/10" />
          </div>

          <div className="space-y-4">
            {mode === "signup" && (
              <Field label="Callsign" error={errors.name}>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls(errors.name)} placeholder="Kai Demo" />
              </Field>
            )}
            <Field label="Email uplink" error={errors.email}>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls(errors.email)} placeholder="you@station.io" type="email" />
            </Field>
            <Field label="Passphrase" error={errors.pass} hint="8+ chars">
              <div className="relative">
                <input
                  value={form.pass}
                  onChange={(e) => setForm({ ...form, pass: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                  className={cx(inputCls(errors.pass), "pr-11")}
                  placeholder="••••••••••"
                  type={showPass ? "text" : "password"}
                />
                <button onClick={() => setShowPass(!showPass)} aria-label="Toggle password visibility" className={cx("absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors", showPass ? "text-neon" : "text-mist")}>
                  <IconEye size={17} />
                </button>
              </div>
            </Field>
            {mode === "signup" && (
              <Field label="Confirm passphrase" error={errors.confirm}>
                <input value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={inputCls(errors.confirm)} placeholder="••••••••••" type="password" />
              </Field>
            )}

            {errors.form && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-rose2 text-sm glass rounded-lg border-rose2/40 px-4 py-2.5">
                {errors.form}
              </motion.p>
            )}

            <NeonButton onClick={submit} disabled={busy} className="w-full">
              {busy ? (
                <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }} className="w-4 h-4 border-2 border-void/30 border-t-void rounded-full" />
              ) : mode === "login" ? "Authenticate" : "Create account"}
            </NeonButton>
          </div>

          <div className="mt-7 glass rounded-xl p-4">
            <p className="text-[10px] font-mono uppercase tracking-[0.25em] text-mist mb-3">Demo clearances</p>
            <div className="flex gap-2.5">
              <button onClick={() => { quickLogin("demo@wearly.house"); nav(next); }} className="flex-1 py-2.5 rounded-lg border border-neon/35 text-neon text-xs font-mono hover:bg-neon/10 transition-colors">
                Customer
              </button>
              <button onClick={() => { quickLogin("admin@wearly.house"); nav("/admin"); }} className="flex-1 py-2.5 rounded-lg border border-viol/35 text-viol text-xs font-mono hover:bg-viol/10 transition-colors">
                Admin
              </button>
            </div>
            <p className="text-[10px] text-mist/70 mt-2.5 font-mono">admin@wearly.house · weekly-admin</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
