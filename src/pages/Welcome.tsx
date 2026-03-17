import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBasket, Sparkles, Leaf, Zap, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import basketIcon from "@/assets/basket-icon.png";
import deliveryBikeIcon from "@/assets/delivery-bike-icon.png";

const floatingEmojis = [
  { emoji: "🥦", x: "5%", y: "12%", delay: 0, size: "text-4xl" },
  { emoji: "🍎", x: "90%", y: "8%", delay: 0.4, size: "text-3xl" },
  { emoji: "🥕", x: "85%", y: "72%", delay: 0.8, size: "text-4xl" },
  { emoji: "🍋", x: "8%", y: "80%", delay: 1.2, size: "text-3xl" },
  { emoji: "🫐", x: "3%", y: "45%", delay: 0.6, size: "text-2xl" },
  { emoji: "🌽", x: "94%", y: "42%", delay: 1, size: "text-2xl" },
  { emoji: "🍇", x: "50%", y: "5%", delay: 1.4, size: "text-2xl" },
  { emoji: "🥑", x: "45%", y: "90%", delay: 0.2, size: "text-2xl" },
];

const taglines = [
  { icon: <Zap className="h-3.5 w-3.5 text-accent" />, text: "10 min delivery" },
  { icon: <Leaf className="h-3.5 w-3.5 text-primary" />, text: "100% Fresh" },
  { icon: <Heart className="h-3.5 w-3.5 text-destructive" />, text: "Best Prices" },
];

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden bg-background flex flex-col items-center justify-center px-4">
      {/* Layered animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Top-left blob */}
        <motion.div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Bottom-right blob */}
        <motion.div
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.1]"
          style={{ background: "radial-gradient(circle, hsl(var(--accent)), transparent 70%)" }}
          animate={{ scale: [1, 1.4, 1], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Center glow */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)), transparent 60%)" }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Floating grocery emojis */}
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} pointer-events-none select-none`}
          style={{ left: item.x, top: item.y }}
          animate={{
            opacity: [0, 0.8, 0.8, 0],
            y: [0, -20, -20, -40],
            rotate: [0, 12, -12, 0],
            scale: [0.8, 1.1, 1.1, 0.8],
          }}
          transition={{
            duration: 6,
            delay: item.delay,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          }}
        >
          {item.emoji}
        </motion.div>
      ))}

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center max-w-md w-full">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-3 mb-3"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 140, damping: 12 }}
        >
          <div className="relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl snap-green-gradient shadow-xl">
              <ShoppingBasket className="h-8 w-8 text-primary-foreground" />
            </div>
            <motion.div
              className="absolute -top-1.5 -right-1.5"
              animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Sparkles className="h-5 w-5 text-accent" />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-6xl font-extrabold tracking-tight mb-2"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="text-foreground">Snap</span>
          <span className="text-primary">Cart</span>
        </motion.h1>

        {/* Animated underline */}
        <motion.div
          className="h-1 rounded-full snap-green-gradient mb-5"
          initial={{ width: 0 }}
          animate={{ width: 80 }}
          transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
        />

        {/* Subtitle */}
        <motion.p
          className="text-muted-foreground text-center max-w-xs mb-6 text-base leading-relaxed"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Fresh groceries, organic produce & daily essentials — delivered to your doorstep in minutes.
        </motion.p>

        {/* Tagline pills */}
        <motion.div
          className="flex items-center justify-center gap-2.5 mb-8 flex-wrap"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          {taglines.map((tag, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-1.5 bg-card/90 backdrop-blur-md rounded-full px-4 py-2 border border-border/60 shadow-sm"
              whileHover={{ scale: 1.08, y: -3 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {tag.icon}
              <span className="text-xs font-semibold text-secondary-foreground">{tag.text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Icon cards */}
        <motion.div
          className="flex items-center justify-center gap-6 mb-10 relative"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9, type: "spring", stiffness: 100 }}
        >
          {/* Glow ring */}
          <motion.div
            className="absolute inset-[-20px] rounded-3xl opacity-20 blur-2xl"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))" }}
            animate={{ opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="relative bg-card/70 backdrop-blur-lg rounded-3xl p-6 border border-border/50 shadow-lg"
            whileHover={{ y: -6, rotate: -4, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img src={basketIcon} alt="Grocery basket" className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-md" />
          </motion.div>
          <motion.div
            className="relative bg-card/70 backdrop-blur-lg rounded-3xl p-6 border border-border/50 shadow-lg"
            whileHover={{ y: -6, rotate: 4, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <img src={deliveryBikeIcon} alt="Delivery bike" className="h-20 w-20 sm:h-24 sm:w-24 object-contain drop-shadow-md" />
          </motion.div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.5 }}
          className="flex flex-col items-center gap-4 w-full"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={() => navigate("/welcome")}
              className="gap-2.5 px-12 py-7 text-base font-bold rounded-2xl shadow-xl hover:shadow-2xl transition-all snap-green-gradient border-0 text-primary-foreground"
            >
              Get Started
              <motion.span
                animate={{ x: [0, 6, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="h-5 w-5" />
              </motion.span>
            </Button>
          </motion.div>
          <motion.div
            className="flex items-center gap-2 text-xs text-muted-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <span className="inline-block w-8 h-px bg-border" />
            Fast • Fresh • Affordable
            <span className="inline-block w-8 h-px bg-border" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
