import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MapPin, Package, IndianRupee, TrendingUp, Navigation, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface DeliveryLocation {
  latitude: number;
  longitude: number;
}

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DeliveryDashboard() {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const [myLocation, setMyLocation] = useState<DeliveryLocation | null>(null);
  const [locLoading, setLocLoading] = useState(false);

  // Detect delivery hero's location
  const detectLocation = () => {
    if (!navigator.geolocation) return;
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMyLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setLocLoading(false);
      },
      () => setLocLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  useEffect(() => {
    detectLocation();
  }, []);

  // Fetch available (unassigned) orders
  const { data: availableOrders = [], isLoading: ordersLoading } = useQuery({
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

  // Fetch order items for all visible orders
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
        .select("id, full_name")
        .in("id", userIds);
      if (error) return [];
      return data;
    },
  });

  const getCustomerName = (userId: string) => {
    const c = customers.find((p: any) => p.id === userId);
    return c?.full_name || "Customer";
  };

  const getItemCount = (orderId: string) =>
    orderItems.filter((i: any) => i.order_id === orderId).reduce((s: number, i: any) => s + i.quantity, 0);

  // Accept order mutation
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

  // Update order status mutation
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

  // Sort available orders by distance if location is available
  const sortedAvailable = [...availableOrders].sort((a: any, b: any) => {
    if (!myLocation) return 0;
    // Parse lat/lon from address or use a default large distance
    // We'll use the address text for display; real distance needs geocoded addresses
    // For now, orders without coordinates sort to end
    return 0;
  });

  const todayDeliveries = myOrders.filter(
    (o: any) => new Date(o.created_at).toDateString() === new Date().toDateString()
  ).length;

  const stats = [
    { label: "Available Orders", value: String(availableOrders.length), icon: Package },
    { label: "My Active Orders", value: String(myOrders.length), icon: TrendingUp },
    { label: "Today's Pickups", value: String(todayDeliveries), icon: IndianRupee },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Delivery Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome, {profile?.full_name || "Delivery Hero"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={detectLocation} disabled={locLoading}>
          {locLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Navigation className="h-4 w-4 mr-1" />}
          {myLocation ? "Location Active" : "Enable Location"}
        </Button>
      </div>

      {myLocation && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          Your location: {myLocation.latitude.toFixed(4)}, {myLocation.longitude.toFixed(4)}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="snap-card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* My Active Orders */}
      {myOrders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3">My Active Orders</h2>
          <div className="space-y-3">
            {myOrders.map((order: any) => {
              const items = orderItems.filter((i: any) => i.order_id === order.id);
              return (
                <Card key={order.id} className="snap-card-shadow border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{order.id.slice(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">{getCustomerName(order.user_id)}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {order.address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.address}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                      {items.map((item: any) => (
                        <div key={item.id}>{item.product_name} × {item.quantity}</div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-card-foreground">
                        ₹{Number(order.total_amount)} • {getItemCount(order.id)} items
                      </span>
                      <div className="flex gap-2">
                        {order.status === "confirmed" && (
                          <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: "picked" })}>
                            <Package className="h-3.5 w-3.5 mr-1" /> Mark Picked
                          </Button>
                        )}
                        {order.status === "picked" && (
                          <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: "out_for_delivery" })}>
                            <Navigation className="h-3.5 w-3.5 mr-1" /> Out for Delivery
                          </Button>
                        )}
                        {order.status === "out_for_delivery" && (
                          <Button size="sm" onClick={() => updateStatus.mutate({ orderId: order.id, status: "delivered" })}>
                            <Check className="h-3.5 w-3.5 mr-1" /> Delivered
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Orders */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">
          Available Orders {!myLocation && <span className="text-xs font-normal text-muted-foreground">(Enable location to sort by distance)</span>}
        </h2>

        {ordersLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5 h-28 animate-pulse" />
            ))}
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
            {sortedAvailable.map((order: any) => {
              const items = orderItems.filter((i: any) => i.order_id === order.id);
              return (
                <Card key={order.id} className="snap-card-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-card-foreground">{order.id.slice(0, 8).toUpperCase()}</h3>
                        <p className="text-sm text-muted-foreground">{getCustomerName(order.user_id)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="capitalize">
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </div>

                    {order.address && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3.5 w-3.5" />
                        {order.address}
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground mb-3 space-y-0.5">
                      {items.map((item: any) => (
                        <div key={item.id}>{item.product_name} × {item.quantity}</div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-card-foreground">
                        ₹{Number(order.total_amount)} • {getItemCount(order.id)} items
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptOrder.mutate(order.id)}
                          disabled={acceptOrder.isPending}
                        >
                          <Check className="h-3.5 w-3.5 mr-1" /> Accept Order
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
