import { useState, useEffect } from "react";
import { Bell, Package, AlertTriangle, Tag, Truck, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";

interface AppNotification {
  id: string;
  type: "order_status" | "low_stock" | "offer" | "delivery_update";
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

const typeIcons: Record<string, React.ElementType> = {
  order_status: Package,
  low_stock: AlertTriangle,
  offer: Tag,
  delivery_update: Truck,
};

const typeColors: Record<string, string> = {
  order_status: "bg-blue-100 text-blue-600",
  low_stock: "bg-red-100 text-red-600",
  offer: "bg-green-100 text-green-600",
  delivery_update: "bg-purple-100 text-purple-600",
};

export function NotificationCenter() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const queryClient = useQueryClient();

  // Fetch user orders to generate notifications
  const { data: orders = [] } = useQuery({
    queryKey: ["user-orders-notif"],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("orders")
        .select("id, status, updated_at, total_amount")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(10);
      return data || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  // Generate notifications from orders
  useEffect(() => {
    if (!orders.length) return;
    const notifs: AppNotification[] = orders.map((o: any) => ({
      id: o.id,
      type: o.status === "out_for_delivery" ? "delivery_update" : "order_status",
      title: o.status === "delivered" ? "Order Delivered! 🎉" :
             o.status === "out_for_delivery" ? "Out for Delivery 🚴" :
             o.status === "confirmed" ? "Order Confirmed ✅" :
             "Order Update",
      message: `Order #${o.id.slice(0, 8)} — ₹${Number(o.total_amount).toLocaleString("en-IN")} — ${o.status.replace(/_/g, " ")}`,
      read: false,
      createdAt: new Date(o.updated_at),
    }));
    setNotifications(notifs);
  }, [orders]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between p-3 border-b">
          <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-sm">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-30" />
              No notifications yet
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = typeIcons[n.type] || Package;
              return (
                <div
                  key={n.id}
                  className={`flex gap-3 px-3 py-3 border-b last:border-0 transition-colors ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${typeColors[n.type]}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground">{n.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {formatDistanceToNow(n.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
