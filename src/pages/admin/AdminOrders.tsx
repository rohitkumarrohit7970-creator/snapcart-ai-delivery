import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package, Truck, User, Calendar, IndianRupee } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  picked: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const userIds = [...new Set(orders.map((o) => o.user_id))];
  const deliveryIds = [...new Set(orders.filter((o) => o.delivery_boy_id).map((o) => o.delivery_boy_id!))];
  const allProfileIds = [...new Set([...userIds, ...deliveryIds])];

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-orders-profiles", allProfileIds],
    enabled: allProfileIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name, email, phone").in("id", allProfileIds);
      return data || [];
    },
  });

  const orderIds = orders.map((o) => o.id);
  const { data: orderItems = [] } = useQuery({
    queryKey: ["admin-orders-items", orderIds],
    enabled: orderIds.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").in("order_id", orderIds);
      return data || [];
    },
  });

  const profileMap = Object.fromEntries(profiles.map((p: any) => [p.id, p]));
  const itemsByOrder = orderItems.reduce((acc: Record<string, any[]>, item: any) => {
    acc[item.order_id] = acc[item.order_id] || [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground text-sm">{orders.length} total orders</p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="picked">Picked</SelectItem>
            <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="snap-card-shadow">
          <CardContent className="py-12 text-center text-muted-foreground">
            <Package className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No orders found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const customer = profileMap[order.user_id];
            const deliveryBoy = order.delivery_boy_id ? profileMap[order.delivery_boy_id] : null;
            const items = itemsByOrder[order.id] || [];

            return (
              <Card key={order.id} className="snap-card-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-semibold">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <Badge className={statusColors[order.status] || "bg-muted text-muted-foreground"}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">{customer?.full_name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">{customer?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">
                          {deliveryBoy ? deliveryBoy.full_name : "Not assigned"}
                        </p>
                        {deliveryBoy && <p className="text-xs text-muted-foreground">{deliveryBoy.phone || deliveryBoy.email}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    </div>
                  </div>

                  {order.address && (
                    <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg px-3 py-2">
                      📍 {order.address}
                    </p>
                  )}

                  {items.length > 0 && (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Item</TableHead>
                            <TableHead className="text-xs text-center">Qty</TableHead>
                            <TableHead className="text-xs text-right">Price</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell className="text-sm py-2">{item.product_name}</TableCell>
                              <TableCell className="text-sm py-2 text-center">{item.quantity}</TableCell>
                              <TableCell className="text-sm py-2 text-right">₹{item.price}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <p className="text-sm font-bold text-foreground flex items-center gap-1">
                      <IndianRupee className="h-3.5 w-3.5" /> {order.total_amount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
