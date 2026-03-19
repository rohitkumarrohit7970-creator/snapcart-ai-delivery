import { useState, useEffect } from "react";
import { ShoppingCart, Search, User, MapPin, LogOut, LogIn, Navigation, ChevronDown, Plus } from "lucide-react";
import { VoiceSearchButton } from "@/components/user/VoiceSearchButton";
import { NotificationCenter } from "@/components/user/NotificationCenter";
import { Link, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/cart-store";
import { useAuth } from "@/hooks/useAuth";
import { useLocationStore } from "@/lib/location-store";
import { useAddresses } from "@/hooks/useAddresses";
import { useSearchStore } from "@/lib/search-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function Navbar() {
  const itemCount = useCartStore((s) => s.itemCount());
  const { user, profile, hasRole, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    address: detectedAddress,
    loading: locLoading,
    selectedAddressLabel,
    detectLocation,
    setSelectedAddress,
  } = useLocationStore();
  const { data: addresses = [] } = useAddresses();
  const [locOpen, setLocOpen] = useState(false);
  const { query: navSearch, setQuery: setNavSearch } = useSearchStore();

  // Auto-detect on mount if no address selected
  useEffect(() => {
    if (!detectedAddress && !selectedAddressLabel && user) {
      const defaultAddr = addresses.find((a) => a.is_default);
      if (defaultAddr) {
        setSelectedAddress(defaultAddr.id, defaultAddr.label);
      }
    }
  }, [addresses, user]);

  const displayLocation = selectedAddressLabel
    ? selectedAddressLabel
    : detectedAddress
    ? detectedAddress
    : "Set location";

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 border-b bg-card">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link to="/store" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg snap-green-gradient">
            <span className="text-lg font-bold text-primary-foreground">S</span>
          </div>
          <span className="text-xl font-bold text-foreground">SnapCart</span>
        </Link>

        <div className="hidden flex-1 max-w-md mx-4 md:flex items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for groceries..."
              value={navSearch}
              onChange={(e) => setNavSearch(e.target.value)}
              className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <VoiceSearchButton onResult={(text) => setNavSearch(text)} />
        </div>

        <div className="flex items-center gap-2">
          {/* Deliver To */}
          <Popover open={locOpen} onOpenChange={setLocOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="hidden sm:flex gap-1 text-muted-foreground max-w-[180px]">
                <MapPin className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-sm truncate">{locLoading ? "Detecting..." : displayLocation}</span>
                <ChevronDown className="h-3 w-3 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="p-3 border-b">
                <p className="text-sm font-semibold text-foreground">Deliver to</p>
              </div>

              {/* Detect location */}
              <button
                onClick={() => {
                  detectLocation();
                  setLocOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-secondary/50 transition-colors"
              >
                <Navigation className="h-4 w-4 text-primary" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Use current location</p>
                  <p className="text-xs text-muted-foreground">Auto-detect via GPS</p>
                </div>
              </button>

              {detectedAddress && !selectedAddressLabel && (
                <div className="px-3 py-2 bg-primary/5 border-y">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                    <p className="text-xs text-primary font-medium truncate">{detectedAddress}</p>
                  </div>
                </div>
              )}

              {/* Saved addresses */}
              {addresses.length > 0 && (
                <div className="border-t">
                  <p className="px-3 pt-2 pb-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                    Saved Addresses
                  </p>
                  {addresses.map((addr) => (
                    <button
                      key={addr.id}
                      onClick={() => {
                        setSelectedAddress(addr.id, addr.label);
                        setLocOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-secondary/50 transition-colors ${
                        addr.id === useLocationStore.getState().selectedAddressId ? "bg-secondary" : ""
                      }`}
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="font-medium text-foreground text-xs">{addr.label}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{addr.full_address}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Manage addresses */}
              <div className="border-t p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-primary"
                  onClick={() => {
                    setLocOpen(false);
                    navigate("/addresses");
                  }}
                >
                  <Plus className="h-4 w-4" /> Manage Addresses
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  <Badge variant="secondary" className="mt-1 text-[10px] capitalize">
                    {hasRole("admin") ? "Admin" : hasRole("delivery_boy") ? "Delivery Hero" : "User"}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/orders")}>My Orders</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/addresses")}>My Addresses</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/support")}>Support</DropdownMenuItem>
                {hasRole("admin") && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>Admin Panel</DropdownMenuItem>
                )}
                {hasRole("delivery_boy") && (
                  <DropdownMenuItem onClick={() => navigate("/delivery")}>Delivery Panel</DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login">
              <Button variant="ghost" size="sm" className="gap-1">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
            </Link>
          )}

          <NotificationCenter />

          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
