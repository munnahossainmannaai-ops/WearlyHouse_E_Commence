import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { HashRouter, Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, MotionConfig, motion, useScroll, useSpring } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import CommandPalette from "./components/CommandPalette";
import { useStore } from "./store/store";
import { ToastHost, NeonButton } from "./components/ui";
import { IconArrow } from "./components/icons";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";

/* code-split: heavier / less-visited routes load on demand */
const Checkout = lazy(() => import("./pages/Checkout"));
const Track = lazy(() => import("./pages/Track"));
const Admin = lazy(() => import("./pages/Admin"));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}

function ProductRoute() {
  const { slug } = useParams();
  return <ProductPage key={slug} />;
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });
  return (
    <motion.div
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 z-[85] h-[2px] origin-left bg-gradient-to-r from-neon via-[#7dd8ff] to-viol shadow-[0_0_12px_rgba(45,226,255,0.7)]"
    />
  );
}

function CursorGlow() {
  const [enabled] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches
  );
  const x = useSpring(-700, { stiffness: 55, damping: 22 });
  const y = useSpring(-700, { stiffness: 55, damping: 22 });
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX - 280);
      y.set(e.clientY - 280);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [enabled, x, y]);
  if (!enabled) return null;
  return (
    <motion.div
      aria-hidden
      style={{ x, y }}
      className="fixed top-0 left-0 z-[2] w-[560px] h-[560px] rounded-full pointer-events-none mix-blend-screen"
    >
      <div
        className="w-full h-full rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(45,226,255,0.075) 0%, rgba(160,107,255,0.05) 38%, transparent 68%)",
        }}
      />
    </motion.div>
  );
}

function NotFound() {
  const nav = useNavigate();
  return (
    <div className="max-w-2xl mx-auto px-4 pt-40 pb-24 text-center">
      <p className="font-mono text-neon text-sm tracking-[0.35em] uppercase mb-4">404 // signal lost</p>
      <h1 className="font-display text-5xl font-bold text-white mb-4">This sector doesn't exist.</h1>
      <p className="text-mist mb-8">The coordinates you entered are outside mapped space.</p>
      <NeonButton onClick={() => nav("/")}>Return to base <IconArrow size={15} /></NeonButton>
    </div>
  );
}

function Shell() {
  const location = useLocation();
  const { pathname } = location;
  const bare = pathname === "/auth";
  const theme = useStore((s) => s.theme);
  const firstThemeApply = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "cleanroom") root.dataset.theme = "cleanroom";
    else delete root.dataset.theme;
    root.style.backgroundColor = theme === "cleanroom" ? "#edf0f6" : "#07070d";
    if (firstThemeApply.current) {
      firstThemeApply.current = false;
      return;
    }
    root.classList.add("theme-anim");
    const t = setTimeout(() => root.classList.remove("theme-anim"), 520);
    return () => clearTimeout(t);
  }, [theme]);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-void" />
        <div className="absolute top-[-20%] left-[10%] w-[40rem] h-[40rem] rounded-full bg-neon/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-25%] right-[5%] w-[42rem] h-[42rem] rounded-full bg-viol/[0.06] blur-[150px]" />
      </div>
      <div className="noise-layer" aria-hidden />
      <CursorGlow />
      <ScrollProgress />

      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <Suspense fallback={null}>
            <Routes location={location}>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Catalog />} />
              <Route path="/product/:slug" element={<ProductRoute />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/track" element={<Track />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>
      {!bare && <Footer />}
      <CartDrawer />
      <ToastHost />
      <CommandPalette />
    </div>
  );
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <HashRouter>
        <Shell />
      </HashRouter>
    </MotionConfig>
  );
}
