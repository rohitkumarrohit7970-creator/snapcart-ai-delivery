import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/user/Navbar";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/hooks/useAuth";
import { useLocationStore } from "@/lib/location-store";
import { useAddresses } from "@/hooks/useAddresses";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CreditCard, Banknote } from "lucide-react";
import { useState, useEffect } from "react";

type PaymentMethod = "online" | "cod";

const Cart = () => {
  const { items, updateQuantity, removeItem, total, clearCart } = useCartStore();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [placing, setPlacing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("online");
  const { address: detectedAddress, selectedAddressId } = useLocationStore();
  const { data: addresses = [] } = useAddresses();

  useEffect(() => {
    if (searchParams.get("payment") === "cancelled") {
      toast.error("Payment was cancelled. You can try again.");
    }
  }, [searchParams]);

  const getDeliveryAddress = (): string => {
    if (selectedAddressId) {
      const saved = addresses.find((a) => a.id === selectedAddressId);
      if (saved) {
        return [saved.flat_building, saved.full_address, saved.landmark, saved.city, saved.pincode]
          .filter(Boolean)
          .join(", ");
      }
    }
    if (detectedAddress) return detectedAddress;
    return "";
  };

  const createOrder = async (status: string) => {
    const deliveryAddress = getDeliveryAddress();
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({ user_id: user!.id, total_amount: total(), status, address: deliveryAddress })
      .select()
      .single();

    if (orderErr) throw orderErr;

    const orderItems = items.map((i) => ({
      order_id: order.id,
      product_id: i.product.id,
      product_name: i.product.name,
      quantity: i.quantity,
      price: i.product.price,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) throw itemsErr;

    return order;
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/login");
      return;
    }
    const deliveryAddress = getDeliveryAddress();
    if (!deliveryAddress) {
      toast.error("Please set a delivery address before placing the order");
      return;
    }
    setPlacing(true);
    try {
      if (paymentMethod === "cod") {
        await createOrder("pending");
        clearCart();
        toast.success("Order placed successfully! Pay on delivery.");
        navigate("/orders");
      } else {
        // Create order with pending_payment status, then redirect to Stripe
        const order = await createOrder("pending_payment");

        const stripeItems = items.map((i) => ({
          name: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
        }));

        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: { items: stripeItems, orderId: order.id },
        });

        if (error) throw new Error(error.message || "Payment initiation failed");
        if (data?.url) {
          clearCart();
          window.open(data.url, "_blank");
          toast.success("Stripe checkout opened in a new tab. Complete your payment there.");
          navigate("/orders");
        } else {
          throw new Error("No checkout URL received");
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order");
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container flex flex-col items-center justify-center py-24 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground mt-1">Add items to get started</p>
          <Link to="/store">
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

        {/* Payment Method Selection */}
        <div className="mt-6 rounded-xl border bg-card p-5 snap-card-shadow">
          <h3 className="text-sm font-semibold text-foreground mb-3">Payment Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setPaymentMethod("online")}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all snap-card-hover ${
                paymentMethod === "online"
                  ? "border-primary bg-secondary shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                paymentMethod === "online" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Pay Online</p>
                <p className="text-xs text-muted-foreground">Card, UPI, Wallet</p>
              </div>
            </button>

            <button
              onClick={() => setPaymentMethod("cod")}
              className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all snap-card-hover ${
                paymentMethod === "cod"
                  ? "border-primary bg-secondary shadow-sm"
                  : "border-border bg-card hover:border-muted-foreground/30"
              }`}
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ${
                paymentMethod === "cod" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                <Banknote className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Cash on Delivery</p>
                <p className="text-xs text-muted-foreground">Pay when delivered</p>
              </div>
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="mt-4 rounded-xl border bg-card p-5 snap-card-shadow">
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
          <Button className="w-full mt-4 gap-2" size="lg" onClick={handlePlaceOrder} disabled={placing}>
            {paymentMethod === "online" ? <CreditCard className="h-4 w-4" /> : <Banknote className="h-4 w-4" />}
            {placing
              ? "Processing..."
              : paymentMethod === "online"
              ? `Pay Online • ₹${total()}`
              : `Place COD Order • ₹${total()}`}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Cart;
