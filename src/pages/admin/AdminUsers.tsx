import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, ShoppingCart, Package } from "lucide-react";
import { useState } from "react";

export default function AdminUsers() {
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("*");
      return data || [];
    },
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["admin-users-orders"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data || [];
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["admin-users-order-items", orders.map((o: any) => o.id)],
    enabled: orders.length > 0,
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").in("order_id", orders.map((o: any) => o.id));
      return data || [];
    },
  });

  const roleMap = roles.reduce((acc: Record<string, string[]>, r: any) => {
    acc[r.user_id] = acc[r.user_id] || [];
    acc[r.user_id].push(r.role);
    return acc;
  }, {});

  const ordersByUser = orders.reduce((acc: Record<string, any[]>, o: any) => {
    acc[o.user_id] = acc[o.user_id] || [];
    acc[o.user_id].push(o);
    return acc;
  }, {});

  const itemsByOrder = orderItems.reduce((acc: Record<string, any[]>, item: any) => {
    acc[item.order_id] = acc[item.order_id] || [];
    acc[item.order_id].push(item);
    return acc;
  }, {});

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-800",
    delivery_boy: "bg-blue-100 text-blue-800",
    user: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground text-sm">{profiles.length} registered users</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : profiles.length === 0 ? (
        <Card className="snap-card-shadow">
          <CardContent className="py-12 text-center text-muted-foreground">
            <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile: any) => {
            const userRoles = roleMap[profile.id] || ["user"];
            const userOrders = ordersByUser[profile.id] || [];
            const isExpanded = expandedUser === profile.id;

            return (
              <Card key={profile.id} className="snap-card-shadow">
                <CardHeader className="pb-2">
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : profile.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{profile.full_name || "Unnamed"}</CardTitle>
                          <p className="text-xs text-muted-foreground">{profile.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {userRoles.map((role: string) => (
                          <Badge key={role} className={roleColors[role] || "bg-muted text-muted-foreground"} variant="secondary">
                            {role.replace(/_/g, " ")}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="gap-1">
                          <ShoppingCart className="h-3 w-3" /> {userOrders.length}
                        </Badge>
                      </div>
                    </div>
                  </button>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="text-xs text-muted-foreground mb-2">
                      Phone: {profile.phone || "N/A"} · Joined: {new Date(profile.created_at).toLocaleDateString()}
                    </div>

                    {userOrders.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-4 text-center">No orders placed</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto">
                        {userOrders.map((order: any) => {
                          const items = itemsByOrder[order.id] || [];
                          return (
                            <div key={order.id} className="rounded-lg border bg-secondary/30 p-3">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-semibold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px]">{order.status.replace(/_/g, " ")}</Badge>
                                  <span className="text-xs font-semibold text-foreground">₹{order.total_amount}</span>
                                </div>
                              </div>
                              {items.length > 0 && (
                                <div className="space-y-1">
                                  {items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs text-muted-foreground">
                                      <span className="flex items-center gap-1">
                                        <Package className="h-3 w-3" /> {item.product_name}
                                      </span>
                                      <span>x{item.quantity} · ₹{item.price}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
