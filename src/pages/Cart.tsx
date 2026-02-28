import { Link } from "react-router-dom";
import { Navbar } from "@/components/user/Navbar";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";

const Cart = () => {
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mt-1">Add items to get started</p>
          <Link to="/">
            <Button className="mt-6">Browse Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Continue Shopping
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">Your Cart</h1>

        <div className="space-y-3">
          {items.map(({ product, quantity }) => (
            <div key={product.id} className="flex items-center gap-4 rounded-xl border bg-card p-4 snap-card-shadow">
              <span className="text-3xl">{product.image}</span>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-card-foreground truncate">{product.name}</h3>
                <p className="text-xs text-muted-foreground">{product.unit}</p>
                <p className="text-sm font-bold text-foreground mt-0.5">₹{product.price * quantity}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center rounded-lg border bg-secondary/50">
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity - 1)}>
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold">{quantity}</span>
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => updateQuantity(product.id, quantity + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeItem(product.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border bg-card p-5 snap-card-shadow">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground font-medium">₹{total()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery Fee</span>
              <span className="text-primary font-medium">FREE</span>
            </div>
            <div className="border-t pt-2 flex justify-between text-base font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-foreground">₹{total()}</span>
            </div>
          </div>
          <Button className="w-full mt-4" size="lg">
            Place Order • ₹{total()}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Cart;
