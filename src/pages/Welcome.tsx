import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";
import basketIcon from "@/assets/basket-icon.png";
import deliveryBikeIcon from "@/assets/delivery-bike-icon.png";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col items-center justify-center px-4">
      {/* Logo + Title */}
      <motion.div
        className="flex items-center gap-3 mb-4"
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl snap-green-gradient">
          <ShoppingBasket className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-primary tracking-tight">
          SnapCart
        </h1>
      </motion.div>

      {/* Subtitle */}
      <motion.p
        className="text-muted-foreground text-center max-w-md mb-10 text-base"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        Your one-stop destination for fresh groceries, organic produce, and daily essentials delivered right to your doorstep.
      </motion.p>

      {/* Icons */}
      <motion.div
        className="flex items-center justify-center gap-10 mb-12"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 100 }}
      >
        <img src={basketIcon} alt="Grocery basket" className="h-24 w-24 sm:h-28 sm:w-28 object-contain" />
        <img src={deliveryBikeIcon} alt="Delivery bike" className="h-24 w-24 sm:h-28 sm:w-28 object-contain" />
      </motion.div>

      {/* Next Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Button
          size="lg"
          onClick={() => navigate("/welcome")}
          className="gap-2 px-10 py-6 text-base rounded-xl shadow-lg snap-green-gradient border-0 text-primary-foreground"
        >
          Next
          <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </div>
  );
}
