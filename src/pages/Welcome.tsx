import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBasket, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import basketIcon from "@/assets/basket-icon.png";
import deliveryBikeIcon from "@/assets/delivery-bike-icon.png";

const floatingEmojis = [
  { emoji: "🥦", x: "8%", y: "15%", delay: 0, size: "text-3xl" },
  { emoji: "🍎", x: "88%", y: "12%", delay: 0.4, size: "text-2xl" },
  { emoji: "🥕", x: "80%", y: "75%", delay: 0.8, size: "text-3xl" },
  { emoji: "🍋", x: "12%", y: "78%", delay: 1.2, size: "text-2xl" },
  { emoji: "🫐", x: "6%", y: "48%", delay: 0.6, size: "text-xl" },
  { emoji: "🌽", x: "92%", y: "45%", delay: 1, size: "text-xl" },
];

const taglines = [
  { icon: "⚡", text: "10 min delivery" },
  { icon: "🌿", text: "100% Fresh" },
  { icon: "💰", text: "Best Prices" },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-secondary/40 via-background to-secondary/60 flex flex-col items-center justify-center px-4">
      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(145 63% 42% / 0.5), transparent)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 20, 0], y: [0, -15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(38 92% 50% / 0.4), transparent)" }}
          animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 20, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-1/4 w-64 h-64 rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(145 63% 42% / 0.3), transparent)" }}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating grocery emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} pointer-events-none select-none`}
          style={{ left: item.x, top: item.y }}
          animate={{
            opacity: [0, 0.7, 0.7, 0],
            y: [0, -15, -15, -30],
            rotate: [0, 8, -8, 0],
          }}
          transition={{
            duration: 5,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Logo + Title */}
        <motion.div
          className="flex items-center gap-3 mb-2"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 160, damping: 14 }}
        >
          <div className="relative">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl snap-green-gradient shadow-lg">
              <ShoppingBasket className="h-7 w-7 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-4 w-4 text-accent" />
            </motion.div>
          </div>
        </motion.div>

        <motion.h1
          className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-foreground">Snap</span>
          <span className="text-primary">Cart</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground text-center max-w-sm mb-6 text-base leading-relaxed"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Your one-stop destination for fresh groceries, organic produce, and daily essentials delivered right to your doorstep.
        </motion.p>

        {/* Tagline pills */}
        <motion.div
          className="flex items-center justify-center gap-3 mb-8 flex-wrap"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {taglines.map((tag, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-full px-3.5 py-1.5 border border-border shadow-sm"
              whileHover={{ scale: 1.05, y: -2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-sm">{tag.icon}</span>
              <span className="text-xs font-medium text-secondary-foreground">{tag.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Icons with glow effect */}
        <motion.div
          className="flex items-center justify-center gap-8 mb-10 relative"
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
        >
          {/* Glow behind icons */}
          <div className="absolute inset-0 blur-3xl opacity-20 bg-gradient-to-r from-primary via-transparent to-accent rounded-full" />
          <motion.div
            className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-md"
            whileHover={{ y: -4, rotate: -3 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img src={basketIcon} alt="Grocery basket" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
          </motion.div>
          <motion.div
            className="relative bg-card/60 backdrop-blur-sm rounded-2xl p-5 border border-border shadow-md"
            whileHover={{ y: -4, rotate: 3 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img src={deliveryBikeIcon} alt="Delivery bike" className="h-20 w-20 sm:h-24 sm:w-24 object-contain" />
          </motion.div>
        </motion.div>

        {/* Next Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex flex-col items-center gap-3"
        >
          <Button
            size="lg"
            onClick={() => navigate("/welcome")}
            className="gap-2 px-10 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-shadow snap-green-gradient border-0 text-primary-foreground"
          >
            Next
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.span>
          </Button>
          <motion.p
            className="text-xs text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            Fast • Fresh • Affordable
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
