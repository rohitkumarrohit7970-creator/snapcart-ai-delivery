import { Link } from "react-router-dom";
import { Navbar } from "@/components/user/Navbar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["order_items", orders.map((o: any) => o.id)],
    enabled: orders.length > 0,
    queryFn: async () => {
      const ids = orders.map((o: any) => o.id);
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", ids);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl font-bold text-foreground mb-6">Your Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5 h-32 animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3" />
            <p className="text-lg font-medium">No orders yet</p>
            <p className="text-sm mt-1">Place your first order to see it here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order: any) => {
              const items = orderItems.filter((i: any) => i.order_id === order.id);
              return (
                <div key={order.id} className="rounded-xl border bg-card p-5 snap-card-shadow animate-fade-in">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-card-foreground">{order.id.slice(0, 8).toUpperCase()}</h3>
                      <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <Badge variant="secondary" className={statusColors[order.status] || ""}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product_name} × {item.quantity}
                        </span>
                        <span className="text-card-foreground font-medium">₹{Number(item.price) * item.quantity}</span>
                      </div>
                    ))}
                  </div>

                  <div className="border-t mt-3 pt-3 flex items-center justify-between">
                    <span className="text-sm font-bold text-foreground">Total: ₹{Number(order.total_amount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
