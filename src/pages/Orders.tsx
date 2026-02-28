import { Link } from "react-router-dom";
import { Navbar } from "@/components/user/Navbar";
import { Badge } from "@/components/ui/badge";
import { mockOrders } from "@/lib/mock-data";
import { ArrowLeft, Package } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-muted text-muted-foreground",
  confirmed: "bg-info/10 text-info",
  picked: "bg-accent/10 text-accent",
  out_for_delivery: "bg-primary/10 text-primary",
  delivered: "bg-primary/10 text-primary",
};

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  picked: "Picked Up",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

const Orders = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">Your Orders</h1>

        <div className="space-y-4">
          {mockOrders.map((order) => (
            <div key={order.id} className="rounded-xl border bg-card p-5 snap-card-shadow animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-card-foreground">{order.id}</h3>
                  <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                </div>
                <Badge variant="secondary" className={statusColors[order.status]}>
                  {statusLabels[order.status]}
                </Badge>
              </div>

              <div className="space-y-1.5">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.name} × {item.quantity}
                    </span>
                    <span className="text-card-foreground font-medium">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              <div className="border-t mt-3 pt-3 flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">Total: ₹{order.total}</span>
                {order.deliveryBoy && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Package className="h-3.5 w-3.5" /> {order.deliveryBoy}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Orders;
