import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, MapPin, LogOut, Menu, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const navItems = [
  { label: "Dashboard", path: "/delivery", icon: LayoutDashboard },
  { label: "Orders", path: "/delivery/orders", icon: Package },
  { label: "Live Map", path: "/delivery/map", icon: MapPin },
];

export default function DeliveryLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Logged out successfully");
    navigate("/welcome");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside
        className={`sticky top-0 h-screen border-r bg-card flex flex-col transition-all duration-200 ${
          collapsed ? "w-16" : "w-56"
        }`}
      >
        <div className="flex items-center gap-2 p-4 border-b">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg snap-green-gradient shrink-0">
            <span className="text-sm font-bold text-primary-foreground">S</span>
          </div>
          {!collapsed && <span className="font-bold text-foreground">Delivery</span>}
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-2 border-t">
          <Link
            to="/welcome"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Back to Store</span>}
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 h-14 border-b bg-card flex items-center px-4 gap-3">
          <Button size="icon" variant="ghost" onClick={() => setCollapsed(!collapsed)}>
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="text-sm font-medium text-muted-foreground">Delivery Panel</h2>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
