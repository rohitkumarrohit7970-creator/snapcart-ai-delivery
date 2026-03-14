import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Zap, Truck, Clock, Leaf, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Zap,
    title: "Lightning Fast",
    desc: "Get groceries at your door in under 10 minutes",
    gradient: "from-amber-400 to-orange-500",
  },
  {
    icon: Leaf,
    title: "Farm Fresh",
    desc: "Sourced directly from local farms every morning",
    gradient: "from-emerald-400 to-green-600",
  },
  {
    icon: Truck,
    title: "Free Delivery",
    desc: "No delivery charges on orders above ₹199",
    gradient: "from-sky-400 to-blue-600",
  },
  {
    icon: Clock,
    title: "24/7 Available",
    desc: "Order anytime, we never close",
    gradient: "from-violet-400 to-purple-600",
  },
];

const floatingItems = [
  { emoji: "🥦", x: "10%", y: "20%", delay: 0, size: "text-4xl" },
  { emoji: "🍎", x: "85%", y: "15%", delay: 0.3, size: "text-3xl" },
  { emoji: "🥕", x: "75%", y: "70%", delay: 0.6, size: "text-4xl" },
  { emoji: "🍋", x: "15%", y: "75%", delay: 0.9, size: "text-3xl" },
  { emoji: "🥑", x: "50%", y: "85%", delay: 1.2, size: "text-3xl" },
  { emoji: "🍊", x: "90%", y: "45%", delay: 0.4, size: "text-2xl" },
  { emoji: "🫐", x: "5%", y: "50%", delay: 0.7, size: "text-2xl" },
  { emoji: "🌽", x: "40%", y: "10%", delay: 1, size: "text-3xl" },
];

export default function Welcome() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated gradient background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, hsl(145 63% 42% / 0.4), transparent)" }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, hsl(38 92% 50% / 0.4), transparent)" }}
          animate={{ scale: [1, 1.3, 1], x: [0, -40, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: "radial-gradient(circle, hsl(145 63% 42% / 0.3), transparent)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Floating grocery emojis */}
      {floatingItems.map((item, i) => (
        <motion.div
          key={i}
          className={`absolute ${item.size} pointer-events-none select-none`}
          style={{ left: item.x, top: item.y }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.6, 0.6, 0],
            scale: [0, 1, 1, 0.8],
            y: [0, -20, -20, -40],
            rotate: [0, 10, -10, 0],
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
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto"
            >
              {/* Logo */}
              <motion.div
                className="flex items-center justify-center gap-3 mb-6"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
              >
                <div className="relative">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl snap-green-gradient shadow-lg">
                    <ShoppingBag className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <motion.div
                    className="absolute -top-1 -right-1"
                    animate={{ rotate: [0, 20, -20, 0], scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="h-5 w-5 text-accent" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-6xl font-extrabold text-foreground tracking-tight mb-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Snap
                <span className="text-primary">Cart</span>
              </motion.h1>

              <motion.p
                className="text-lg sm:text-xl text-muted-foreground mb-3 max-w-md mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                Fresh groceries delivered to your doorstep
              </motion.p>

              <motion.p
                className="text-sm text-muted-foreground/70 mb-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Fast • Fresh • Affordable
              </motion.p>

              {/* Animated tagline bar */}
              <motion.div
                className="flex items-center justify-center gap-6 mb-12 flex-wrap"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 0.5 }}
              >
                {[
                  { icon: "⚡", text: "10 min delivery" },
                  { icon: "🌿", text: "100% Fresh" },
                  { icon: "💰", text: "Best Prices" },
                ].map((tag, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center gap-2 bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2 border border-border"
                    whileHover={{ scale: 1.05, y: -2 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <span className="text-lg">{tag.icon}</span>
                    <span className="text-sm font-medium text-secondary-foreground">{tag.text}</span>
                  </motion.div>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 0.5 }}
                className="flex flex-col items-center gap-4"
              >
                <Button
                  size="lg"
                  onClick={() => setStep(1)}
                  className="gap-2 px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-shadow snap-green-gradient border-0 text-primary-foreground"
                >
                  Get Started
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="h-5 w-5" />
                  </motion.span>
                </Button>
                <button
                  onClick={() => navigate("/welcome")}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors underline-offset-4 hover:underline"
                >
                  Already have an account? Sign in
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="features"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-3xl mx-auto w-full"
            >
              <motion.h2
                className="text-2xl sm:text-3xl font-bold text-foreground mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Why choose SnapCart?
              </motion.h2>
              <motion.p
                className="text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Everything you need, delivered with care
              </motion.p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                {features.map((feat, i) => (
                  <motion.div
                    key={i}
                    className="relative bg-card/80 backdrop-blur-sm rounded-2xl border border-border p-6 text-left snap-card-hover cursor-default"
                    initial={{ opacity: 0, y: 30, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
                    whileHover={{ y: -4 }}
                  >
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feat.gradient} mb-4 shadow-md`}
                    >
                      <feat.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground text-base mb-1">{feat.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="flex items-center justify-center gap-4"
              >
                <Button
                  variant="outline"
                  onClick={() => setStep(0)}
                  className="rounded-xl px-6"
                >
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={() => navigate("/welcome")}
                  className="gap-2 px-8 rounded-xl shadow-lg snap-green-gradient border-0 text-primary-foreground"
                >
                  Continue to Sign In
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step indicators */}
        <motion.div
          className="absolute bottom-8 flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          {[0, 1].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s)}
              className={`h-2 rounded-full transition-all duration-300 ${
                step === s ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
              }`}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
