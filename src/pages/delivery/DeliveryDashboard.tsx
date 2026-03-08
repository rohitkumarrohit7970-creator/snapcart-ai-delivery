import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, MapPin, Package, Navigation, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function DeliveryDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();

  // Fetch available (unassigned) orders
  const { data: availableOrders = [], isLoading } = useQuery({
    queryKey: ["delivery-available-orders"],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .is("delivery_boy_id", null)
        .in("status", ["pending", "confirmed"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch my accepted orders
  const { data: myOrders = [] } = useQuery({
    queryKey: ["delivery-my-orders", user?.id],
    enabled: !!user,
    refetchInterval: 15000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("delivery_boy_id", user!.id)
        .in("status", ["confirmed", "picked", "out_for_delivery"])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch order items
  const allOrderIds = [...availableOrders, ...myOrders].map((o: any) => o.id);
  const { data: orderItems = [] } = useQuery({
    queryKey: ["delivery-order-items", allOrderIds],
    enabled: allOrderIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", allOrderIds);
      if (error) throw error;
      return data;
    },
  });

  // Fetch customer profiles
  const userIds = [...new Set([...availableOrders, ...myOrders].map((o: any) => o.user_id))];
  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-customers", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      if (error) return [];
      return data;
    },
  });

  const getCustomer = (userId: string) => customers.find((p: any) => p.id === userId);
  const getItemCount = (orderId: string) =>
    orderItems.filter((i: any) => i.order_id === orderId).reduce((s: number, i: any) => s + i.quantity, 0);

  const acceptOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ delivery_boy_id: user!.id, status: "confirmed" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Order accepted!");
      queryClient.invalidateQueries({ queryKey: ["delivery-available-orders"] });
      queryClient.invalidateQueries({ queryKey: ["delivery-my-orders"] });
    },
    onError: () => toast.error("Failed to accept order"),
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Status updated!");
      queryClient.invalidateQueries({ queryKey: ["delivery-my-orders"] });
    },
    onError: () => toast.error("Failed to update status"),
  });

  const statusColors: Record<string, string> = {
    pending: "bg-muted text-muted-foreground",
    confirmed: "bg-accent/10 text-accent-foreground",
    picked: "bg-primary/10 text-primary",
    out_for_delivery: "bg-primary/20 text-primary",
  };

  const renderOrderCard = (order: any, type: "available" | "active") => {
    const items = orderItems.filter((i: any) => i.order_id === order.id);
    const customer = getCustomer(order.user_id);

    return (
      <Card key={order.id} className={`snap-card-shadow ${type === "active" ? "border-primary/30" : ""}`}>
        <CardContent className="p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-muted-foreground">
                {new Date(order.created_at).toLocaleString("en-IN", {
                  day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                })}
              </p>
              <h3 className="font-semibold text-card-foreground mt-0.5">
                {customer?.full_name || "Customer"}
              </h3>
              {customer?.phone && (
                <p className="text-xs text-muted-foreground">{customer.phone}</p>
              )}
            </div>
            <Badge variant="secondary" className={`capitalize ${statusColors[order.status] || ""}`}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Address */}
          {order.address ? (
            <div className="flex items-start gap-2 rounded-lg bg-secondary/50 p-2.5">
              <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm text-foreground">{order.address}</p>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/5 p-2.5">
              <MapPin className="h-4 w-4 text-destructive shrink-0" />
              <p className="text-sm text-muted-foreground">No address provided</p>
            </div>
          )}

          {/* Items */}
          <div className="space-y-1">
            {items.map((item: any) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{item.product_name} × {item.quantity}</span>
                <span className="text-card-foreground font-medium">₹{Number(item.price) * item.quantity}</span>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-bold text-foreground">
              ₹{Number(order.total_amount)} • {getItemCount(order.id)} items
            </span>
            <div className="flex gap-2">
              {type === "available" && (
                <Button size="sm" onClick={() => acceptOrder.mutate(order.id)} disabled={acceptOrder.isPending}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Accept
                </Button>
              )}
              {type === "active" && order.status === "confirmed" && (
                <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: "picked" })}>
                  <Package className="h-3.5 w-3.5 mr-1" /> Picked
                </Button>
              )}
              {type === "active" && order.status === "picked" && (
                <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: "out_for_delivery" })}>
                  <Navigation className="h-3.5 w-3.5 mr-1" /> Out for Delivery
                </Button>
              )}
              {type === "active" && order.status === "out_for_delivery" && (
                <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: "delivered" })}>
                  <Check className="h-3.5 w-3.5 mr-1" /> Delivered
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Welcome, {profile?.full_name || "Delivery Hero"}
        </p>
      </div>

      {/* My Active Orders */}
      {myOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">My Active Orders</h2>
          <div className="space-y-3">
            {myOrders.map((order: any) => renderOrderCard(order, "active"))}
          </div>
        </div>
      )}

      {/* Available Orders */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Available Orders</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : availableOrders.length === 0 ? (
          <Card className="snap-card-shadow">
            <CardContent className="p-8 text-center">
              <Package className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">No available orders right now</p>
              <p className="text-xs text-muted-foreground mt-1">New orders will appear here automatically</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {availableOrders.map((order: any) => renderOrderCard(order, "available"))}
          </div>
        )}
      </div>
    </div>
  );
}
