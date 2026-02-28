import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { label: "Total Orders", value: "1,234", icon: ShoppingCart, change: "+12%" },
  { label: "Revenue", value: "₹4,56,890", icon: DollarSign, change: "+8%" },
  { label: "Active Users", value: "892", icon: Users, change: "+5%" },
  { label: "Products", value: "156", icon: Package, change: "+3" },
  { label: "Delivery Boys", value: "24", icon: TrendingUp, change: "+2" },
  { label: "Low Stock Alerts", value: "7", icon: AlertTriangle, change: "" },
];

const recentOrders = [
  { id: "ORD-1234", customer: "Amit S.", amount: 450, status: "delivered" },
  { id: "ORD-1235", customer: "Priya M.", amount: 890, status: "out_for_delivery" },
  { id: "ORD-1236", customer: "Rahul K.", amount: 320, status: "confirmed" },
  { id: "ORD-1237", customer: "Sneha D.", amount: 1200, status: "pending" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Welcome back, Admin</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="snap-card-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
              {stat.change && <p className="text-xs text-primary mt-1">{stat.change} from last week</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="snap-card-shadow">
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{order.id}</p>
                  <p className="text-xs text-muted-foreground">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-card-foreground">₹{order.amount}</p>
                  <p className="text-xs text-primary capitalize">{order.status.replace("_", " ")}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
