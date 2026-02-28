import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, MapPin, Package, IndianRupee, TrendingUp } from "lucide-react";

const deliveryStats = [
  { label: "Today's Deliveries", value: "8", icon: Package },
  { label: "Earnings Today", value: "₹640", icon: IndianRupee },
  { label: "Total Deliveries", value: "342", icon: TrendingUp },
];

const assignedOrders = [
  { id: "ORD-1235", customer: "Priya M.", address: "42, MG Road, Sector 5", items: 4, amount: 890, status: "picked" },
  { id: "ORD-1238", customer: "Karan J.", address: "15, Laxmi Nagar, Block B", items: 2, amount: 320, status: "confirmed" },
  { id: "ORD-1239", customer: "Nisha R.", address: "78, Green Park, Main Road", items: 6, amount: 1450, status: "confirmed" },
];

export default function DeliveryDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Delivery Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome, Rajesh</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {deliveryStats.map((stat) => (
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

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Assigned Orders</h2>
        <div className="space-y-3">
          {assignedOrders.map((order) => (
            <Card key={order.id} className="snap-card-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-card-foreground">{order.id}</h3>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <Badge variant="secondary" className="capitalize">
                    {order.status.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin className="h-3.5 w-3.5" />
                  {order.address}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-card-foreground">₹{order.amount} • {order.items} items</span>
                  <div className="flex gap-2">
                    {order.status === "confirmed" && (
                      <>
                        <Button size="sm" variant="outline" className="text-destructive">
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                        <Button size="sm">
                          <Check className="h-3.5 w-3.5 mr-1" /> Accept
                        </Button>
                      </>
                    )}
                    {order.status === "picked" && (
                      <Button size="sm">
                        <Package className="h-3.5 w-3.5 mr-1" /> Out for Delivery
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
