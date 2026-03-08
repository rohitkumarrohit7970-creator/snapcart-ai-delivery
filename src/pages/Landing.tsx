import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, Truck, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const roles = [
  {
    key: "user",
    label: "User",
    icon: ShoppingBag,
    desc: "Browse groceries, place orders & track deliveries",
    color: "bg-primary text-primary-foreground",
  },
  {
    key: "delivery_boy",
    label: "Delivery Hero",
    icon: Truck,
    desc: "Accept orders, deliver & earn on your schedule",
    color: "bg-accent text-accent-foreground",
  },
  {
    key: "admin",
    label: "Admin",
    icon: ShieldCheck,
    desc: "Manage products, orders, users & analytics",
    color: "bg-destructive text-destructive-foreground",
  },
] as const;

type RoleKey = (typeof roles)[number]["key"];

export default function Landing() {
  const [selectedRole, setSelectedRole] = useState<RoleKey>("user");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  // If already logged in, redirect based on role
  if (user) {
    const destination = hasRole("admin") ? "/admin" : hasRole("delivery_boy") ? "/delivery" : "/";
    navigate(destination, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (authMode === "register") {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, role: selectedRole } },
      });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      toast.success("Account created! You're now signed in.");

      // Redirect based on selected role
      const dest = selectedRole === "admin" ? "/admin" : selectedRole === "delivery_boy" ? "/delivery" : "/";
      navigate(dest);
      setLoading(false);
      return;
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        toast.error(error.message);
        setLoading(false);
        return;
      }

      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      const userRoles = rolesData?.map((r: any) => r.role) ?? [];

      toast.success("Welcome back!");

      if (selectedRole === "admin" && userRoles.includes("admin")) {
        navigate("/admin");
      } else if (selectedRole === "delivery_boy" && userRoles.includes("delivery_boy")) {
        navigate("/delivery");
      } else if (userRoles.includes("admin")) {
        navigate("/admin");
      } else if (userRoles.includes("delivery_boy")) {
        navigate("/delivery");
      } else {
        navigate("/");
      }

      setLoading(false);
      return;
    }
  };

  const activeRole = roles.find((r) => r.key === selectedRole)!;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl snap-green-gradient">
            <span className="text-2xl font-bold text-primary-foreground">S</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            SnapCart
          </h1>
        </div>
        <p className="text-muted-foreground text-center max-w-md mb-10">
          Fresh groceries delivered in minutes. Choose how you want to get started.
        </p>

        {/* Role selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
          {roles.map((role) => {
            const isActive = selectedRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => setSelectedRole(role.key)}
                className={`relative rounded-xl border-2 p-5 text-left transition-all snap-card-hover ${
                  isActive
                    ? "border-primary bg-secondary shadow-md"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <div
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-lg mb-3 ${role.color}`}
                >
                  <role.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{role.label}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.desc}</p>
                {isActive && (
                  <div className="absolute top-3 right-3 h-3 w-3 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Auth card */}
        <Card className="w-full max-w-sm snap-card-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-5">
              <div className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${activeRole.color}`}>
                <activeRole.icon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-foreground">
                Continue as {activeRole.label}
              </span>
            </div>

            <Tabs
              value={authMode}
              onValueChange={(v) => setAuthMode(v as "login" | "register")}
              className="w-full"
            >
              <TabsList className="w-full mb-4">
                <TabsTrigger value="login" className="flex-1">
                  Sign In
                </TabsTrigger>
                <TabsTrigger value="register" className="flex-1">
                  Sign Up
                </TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit} className="space-y-3">
                <TabsContent value="register" className="mt-0 space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required={authMode === "register"}
                    />
                  </div>
                </TabsContent>

                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full gap-2" disabled={loading}>
                  {loading ? "Please wait..." : authMode === "login" ? "Sign In" : "Create Account"}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground mt-6">
          By continuing, you agree to SnapCart's Terms of Service
        </p>
      </div>
    </div>
  );
}
