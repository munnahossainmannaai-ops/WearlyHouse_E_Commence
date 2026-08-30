import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useStore } from "../store/store";
import ProductCard from "../components/ProductCard";
import { NeonButton, SectionHead } from "../components/ui";
import { IconArrow, IconCart, IconHeart } from "../components/icons";

export default function Wishlist() {
  const { wishlist, products, addToCart } = useStore();
  const nav = useNavigate();
  const saved = products.filter((p) => wishlist.includes(p.id));

  if (saved.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-40 pb-24 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-24 h-24 mx-auto rounded-full border border-dashed border-rose2/30 flex items-center justify-center mb-6">
          <IconHeart size={36} className="text-rose2/60" />
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-white">Nothing flagged yet</h1>
        <p className="text-mist mt-3 max-w-sm mx-auto">Tap the heart on any unit to pin it here for later retrieval.</p>
        <NeonButton className="mt-8" onClick={() => nav("/shop")}>Find something worth pinning <IconArrow size={15} /></NeonButton>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 pt-24 pb-8">
      <SectionHead
        eyebrow="Pinned units"
        title={<>Your <span className="text-rose2">wishlist</span></>}
        right={
          <NeonButton
            variant="violet"
            onClick={() => saved.forEach((p) => addToCart(p.id, p.colors[0].name))}
          >
            <IconCart size={15} /> Load all into cargo
          </NeonButton>
        }
      />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {saved.map((p, i) => (
          <ProductCard key={p.id} product={p} index={i} />
        ))}
      </div>
    </div>
  );
}
