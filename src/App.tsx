import { useEffect } from "react";
import { HashRouter, Routes, Route, useLocation, useNavigate, useParams } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import CartDrawer from "./components/CartDrawer";
import { ToastHost, NeonButton } from "./components/ui";
import { IconArrow } from "./components/icons";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import ProductPage from "./pages/Product";
import CartPage from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";
import Admin from "./pages/Admin";

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
  const { pathname } = useLocation();
  const bare = pathname === "/auth";
  return (
    <div className="min-h-screen flex flex-col relative">
      {/* ambient background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-void" />
        <div className="absolute top-[-20%] left-[10%] w-[40rem] h-[40rem] rounded-full bg-neon/[0.05] blur-[140px]" />
        <div className="absolute bottom-[-25%] right-[5%] w-[42rem] h-[42rem] rounded-full bg-viol/[0.06] blur-[150px]" />
      </div>
      <div className="noise-layer" aria-hidden />

      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Catalog />} />
          <Route path="/product/:slug" element={<ProductRoute />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!bare && <Footer />}
      <CartDrawer />
      <ToastHost />
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
