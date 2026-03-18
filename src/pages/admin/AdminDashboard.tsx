import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Package, Users, ShoppingCart, TrendingUp, AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { format, subDays, startOfDay } from "date-fns";

function useAdminStats() {
  return useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [ordersRes, productsRes, usersRes, lowStockRes] = await Promise.all([
        supabase.from("orders").select("id, total_amount, status, created_at"),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id, name, stock").lt("stock", 20).eq("is_active", true),
      ]);

      const orders = ordersRes.data || [];
      const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);

      // Orders by day (last 7 days)
      const dailyOrders: Record<string, { date: string; orders: number; revenue: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = format(subDays(new Date(), i), "MMM dd");
        dailyOrders[d] = { date: d, orders: 0, revenue: 0 };
      }
      orders.forEach((o) => {
        const d = format(new Date(o.created_at), "MMM dd");
        if (dailyOrders[d]) {
          dailyOrders[d].orders++;
          dailyOrders[d].revenue += Number(o.total_amount);
        }
      });

      // Status breakdown
      const statusCount: Record<string, number> = {};
      orders.forEach((o) => {
        statusCount[o.status] = (statusCount[o.status] || 0) + 1;
      });
      const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

      return {
        totalOrders: orders.length,
        totalRevenue,
        totalUsers: usersRes.count || 0,
        totalProducts: productsRes.count || 0,
        lowStock: lowStockRes.data || [],
        dailyData: Object.values(dailyOrders),
        statusData,
        recentOrders: orders
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 6),
      };
    },
  });
}

function useTopProducts() {
  return useQuery({
    queryKey: ["admin-top-products"],
    queryFn: async () => {
      const { data } = await supabase
        .from("order_items")
        .select("product_name, quantity");
      if (!data) return [];
      const map: Record<string, number> = {};
      data.forEach((item) => {
        map[item.product_name] = (map[item.product_name] || 0) + item.quantity;
      });
      return Object.entries(map)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, qty]) => ({ name: name.length > 15 ? name.slice(0, 15) + "…" : name, qty }));
    },
  });
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(142 71% 45%)", "hsl(38 92% 50%)", "hsl(0 72% 51%)", "hsl(262 83% 58%)"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useAdminStats();
  const { data: topProducts = [] } = useTopProducts();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-72 rounded-xl border bg-card animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Orders", value: stats?.totalOrders ?? 0, icon: ShoppingCart, color: "text-primary" },
    { label: "Revenue", value: `₹${(stats?.totalRevenue ?? 0).toLocaleString("en-IN")}`, icon: DollarSign, color: "text-green-500" },
    { label: "Active Users", value: stats?.totalUsers ?? 0, icon: Users, color: "text-blue-500" },
    { label: "Products", value: stats?.totalProducts ?? 0, icon: Package, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-sm">Real-time overview of your store</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="snap-card-shadow hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenue trend */}
        <Card className="snap-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Revenue (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={stats?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Orders by day */}
        <Card className="snap-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Orders (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={stats?.dailyData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid md:grid-cols-3 gap-4">
        {/* Top products */}
        <Card className="snap-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                <Bar dataKey="qty" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order status pie */}
        <Card className="snap-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Order Status</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stats?.statusData || []} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {(stats?.statusData || []).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Low stock alerts */}
        <Card className="snap-card-shadow">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base">Low Stock Alerts</CardTitle>
            <Badge variant="destructive" className="text-xs">{stats?.lowStock.length ?? 0}</Badge>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {(stats?.lowStock || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-6">All products well stocked ✅</p>
              )}
              {(stats?.lowStock || []).map((p: any) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-destructive/5 px-3 py-2">
                  <span className="text-sm text-foreground truncate max-w-[140px]">{p.name}</span>
                  <Badge variant="destructive" className="text-xs">{p.stock} left</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="snap-card-shadow">
        <CardHeader>
          <CardTitle className="text-base">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {(stats?.recentOrders || []).map((order: any) => (
              <div key={order.id} className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-card-foreground">{order.id.slice(0, 8)}…</p>
                  <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "MMM dd, h:mm a")}</p>
                </div>
                <div className="text-right flex items-center gap-3">
                  <Badge className={`text-xs capitalize ${statusColors[order.status] || "bg-secondary text-foreground"}`}>
                    {order.status.replace(/_/g, " ")}
                  </Badge>
                  <p className="text-sm font-semibold text-card-foreground">₹{Number(order.total_amount).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
            {(stats?.recentOrders || []).length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-6">No orders yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
