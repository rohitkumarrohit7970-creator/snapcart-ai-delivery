import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, MapPin, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const statusFlow: Record<string, string> = {
  confirmed: "picked",
  picked: "out_for_delivery",
  out_for_delivery: "delivered",
};

const statusColors: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-800",
  picked: "bg-amber-100 text-amber-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
};

export default function DeliveryOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["delivery-all-orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("delivery_boy_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const userIds = [...new Set(orders.map((o: any) => o.user_id))];

  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-orders-customers", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      return data || [];
    },
  });

  const orderIds = orders.map((o: any) => o.id);
  const { data: orderItems = [] } = useQuery({
    queryKey: ["delivery-orders-items", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("*")
        .in("order_id", orderIds);
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delivery-all-orders"] });
      toast.success("Order status updated");
    },
    onError: () => toast.error("Failed to update status"),
  });

  const getCustomer = (userId: string) => customers.find((c: any) => c.id === userId);
  const getItems = (orderId: string) => orderItems.filter((i: any) => i.order_id === orderId);

  const activeOrders = orders.filter((o: any) => ["confirmed", "picked", "out_for_delivery"].includes(o.status));
  const completedOrders = orders.filter((o: any) => o.status === "delivered");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderOrder = (order: any) => {
    const customer = getCustomer(order.user_id);
    const items = getItems(order.id);
    const nextStatus = statusFlow[order.status];

    return (
      <Card key={order.id} className="overflow-hidden">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-card-foreground">
                {customer?.full_name || "Customer"}
              </p>
              {customer?.phone && (
                <p className="text-xs text-muted-foreground">{customer.phone}</p>
              )}
            </div>
            <Badge className={`text-xs capitalize ${statusColors[order.status] || "bg-muted text-muted-foreground"}`}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>

          <div className="flex items-start gap-2">
            <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground line-clamp-2">
              {order.address || "No address"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            {format(new Date(order.created_at), "dd MMM yyyy, hh:mm a")}
          </div>

          {items.length > 0 && (
            <div className="bg-secondary/50 rounded-lg p-2 space-y-1">
              {items.map((item: any) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                  <span className="text-muted-foreground">₹{Number(item.price) * item.quantity}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <p className="text-sm font-bold text-foreground">₹{Number(order.total_amount)}</p>
            {nextStatus && (
              <Button
                size="sm"
                onClick={() => updateStatus.mutate({ orderId: order.id, newStatus: nextStatus })}
                disabled={updateStatus.isPending}
              >
                <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
                Mark as {nextStatus.replace(/_/g, " ")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-foreground">My Orders</h1>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Package className="h-4 w-4 text-primary" />
          Active Orders ({activeOrders.length})
        </h2>
        {activeOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No active orders right now.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeOrders.map(renderOrder)}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          Completed Orders ({completedOrders.length})
        </h2>
        {completedOrders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No completed orders yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedOrders.map(renderOrder)}
          </div>
        )}
      </div>
    </div>
  );
}
