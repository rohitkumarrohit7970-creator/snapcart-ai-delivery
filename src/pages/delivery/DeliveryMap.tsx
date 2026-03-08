import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navigation, MapPin, Loader2 } from "lucide-react";

// Fix default marker icons for leaflet + vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const deliveryIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-[200deg] brightness-125",
});

const customerIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  className: "hue-rotate-[120deg]",
});

// Auto-recenter map when position changes
function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
}

interface GeoPosition {
  lat: number;
  lng: number;
}

export default function DeliveryMap() {
  const { user } = useAuth();
  const [myPos, setMyPos] = useState<GeoPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Live GPS tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      setLoading(false);
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setMyPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Update delivery location in DB every 10 seconds
  useEffect(() => {
    if (!myPos || !user) return;
    const interval = setInterval(async () => {
      await supabase.from("delivery_locations").upsert(
        {
          delivery_boy_id: user.id,
          latitude: myPos.lat,
          longitude: myPos.lng,
          order_id: selectedOrder,
        },
        { onConflict: "delivery_boy_id" }
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [myPos, user, selectedOrder]);

  // Fetch accepted orders with addresses
  const { data: myOrders = [] } = useQuery({
    queryKey: ["delivery-map-orders", user?.id],
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

  // Fetch customer profiles
  const userIds = [...new Set(myOrders.map((o: any) => o.user_id))];
  const { data: customers = [] } = useQuery({
    queryKey: ["delivery-map-customers", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      if (error) return [];
      return data;
    },
  });

  // Fetch user addresses with coordinates for orders
  const { data: addresses = [] } = useQuery({
    queryKey: ["delivery-map-addresses", userIds],
    enabled: userIds.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_addresses")
        .select("*")
        .in("user_id", userIds)
        .eq("is_default", true);
      if (error) return [];
      return data;
    },
  });

  const getCustomer = (userId: string) => customers.find((c: any) => c.id === userId);
  const getAddress = (userId: string) => addresses.find((a: any) => a.user_id === userId);

  // Build destination markers from addresses with coordinates
  const orderMarkers = myOrders
    .map((order: any) => {
      const addr = getAddress(order.user_id);
      if (addr?.latitude && addr?.longitude) {
        return { order, lat: addr.latitude, lng: addr.longitude, address: addr };
      }
      return null;
    })
    .filter(Boolean) as { order: any; lat: number; lng: number; address: any }[];

  const selectedMarker = selectedOrder
    ? orderMarkers.find((m) => m.order.id === selectedOrder)
    : null;

  // Route line from my position to selected order
  const routeLine =
    myPos && selectedMarker
      ? [
          [myPos.lat, myPos.lng] as [number, number],
          [selectedMarker.lat, selectedMarker.lng] as [number, number],
        ]
      : null;

  const getDirectionsUrl = (lat: number, lng: number) =>
    `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Getting your location...</p>
        </div>
      </div>
    );
  }

  if (!myPos) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Card className="max-w-sm">
          <CardContent className="p-6 text-center">
            <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="font-semibold text-foreground">Location Required</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please enable location access in your browser to use the live map.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
        <Badge variant="secondary" className="gap-1">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          Live
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden border h-[500px]">
          <MapContainer
            center={[myPos.lat, myPos.lng]}
            zoom={14}
            className="h-full w-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <RecenterMap lat={myPos.lat} lng={myPos.lng} />

            {/* My position */}
            <Marker position={[myPos.lat, myPos.lng]} icon={deliveryIcon}>
              <Popup>
                <strong>You are here</strong>
              </Popup>
            </Marker>

            {/* Order destination markers */}
            {orderMarkers.map((m) => {
              const customer = getCustomer(m.order.user_id);
              return (
                <Marker
                  key={m.order.id}
                  position={[m.lat, m.lng]}
                  icon={customerIcon}
                  eventHandlers={{ click: () => setSelectedOrder(m.order.id) }}
                >
                  <Popup>
                    <div className="text-sm">
                      <strong>{customer?.full_name || "Customer"}</strong>
                      <br />
                      {m.address.full_address}
                      <br />
                      <span className="text-xs capitalize">{m.order.status.replace(/_/g, " ")}</span>
                    </div>
                  </Popup>
                </Marker>
              );
            })}

            {/* Route line */}
            {routeLine && (
              <Polyline positions={routeLine} pathOptions={{ color: "hsl(142, 76%, 36%)", weight: 4, dashArray: "10, 8" }} />
            )}
          </MapContainer>
        </div>

        {/* Order list sidebar */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Active Orders</h2>
          {myOrders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active orders. Accept orders from the dashboard.</p>
          ) : (
            myOrders.map((order: any) => {
              const customer = getCustomer(order.user_id);
              const addr = getAddress(order.user_id);
              const isSelected = selectedOrder === order.id;
              return (
                <Card
                  key={order.id}
                  className={`cursor-pointer transition-all snap-card-shadow ${
                    isSelected ? "border-primary ring-1 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedOrder(isSelected ? null : order.id)}
                >
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-card-foreground">
                        {customer?.full_name || "Customer"}
                      </p>
                      <Badge variant="secondary" className="text-[10px] capitalize">
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {order.address || addr?.full_address || "No address"}
                      </p>
                    </div>
                    <p className="text-xs font-bold text-foreground">₹{Number(order.total_amount)}</p>
                    {isSelected && addr?.latitude && addr?.longitude && (
                      <a
                        href={getDirectionsUrl(addr.latitude, addr.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button size="sm" className="w-full gap-1.5 mt-1">
                          <Navigation className="h-3.5 w-3.5" /> Get Directions
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
