import { useState } from "react";
import { Navbar } from "@/components/user/Navbar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses, useAddAddress, useUpdateAddress, useDeleteAddress, type UserAddress } from "@/hooks/useAddresses";
import { useLocationStore } from "@/lib/location-store";
import { toast } from "sonner";
import {
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Home,
  Briefcase,
  Heart,
  Navigation,
  Check,
  ArrowLeft,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const labelIcons: Record<string, React.ReactNode> = {
  Home: <Home className="h-4 w-4" />,
  Work: <Briefcase className="h-4 w-4" />,
  Other: <Heart className="h-4 w-4" />,
};

const emptyForm = {
  label: "Home",
  full_address: "",
  flat_building: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
  latitude: null as number | null,
  longitude: null as number | null,
  is_default: false,
};

export default function Addresses() {
  const { user } = useAuth();
  const { data: addresses = [], isLoading } = useAddresses();
  const addAddress = useAddAddress();
  const updateAddress = useUpdateAddress();
  const deleteAddress = useDeleteAddress();
  const detectLocation = useLocationStore((s) => s.detectLocation);
  const locLoading = useLocationStore((s) => s.loading);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [detecting, setDetecting] = useState(false);

  const openNew = () => {
    setForm({ ...emptyForm, is_default: addresses.length === 0 });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (addr: UserAddress) => {
    setForm({
      label: addr.label,
      full_address: addr.full_address,
      flat_building: addr.flat_building || "",
      landmark: addr.landmark || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      latitude: addr.latitude,
      longitude: addr.longitude,
      is_default: addr.is_default,
    });
    setEditing(addr.id);
    setShowForm(true);
  };

  const handleDetect = () => {
    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await resp.json();
          const ad = data.address || {};
          setForm((f) => ({
            ...f,
            full_address: data.display_name || "",
            city: ad.city || ad.town || ad.village || "",
            state: ad.state || "",
            pincode: ad.postcode || "",
            latitude,
            longitude,
          }));
        } catch {
          setForm((f) => ({ ...f, latitude, longitude }));
        }
        setDetecting(false);
      },
      () => {
        toast.error("Could not detect location");
        setDetecting(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async () => {
    if (!form.full_address.trim()) {
      toast.error("Address is required");
      return;
    }
    try {
      if (editing) {
        await updateAddress.mutateAsync({ id: editing, ...form });
        toast.success("Address updated");
      } else {
        await addAddress.mutateAsync(form);
        toast.success("Address added");
      }
      setShowForm(false);
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteAddress.mutateAsync(id);
    toast.success("Address removed");
  };

  const handleSetDefault = async (id: string) => {
    await updateAddress.mutateAsync({ id, is_default: true });
    toast.success("Default address updated");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container max-w-2xl py-6">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Addresses</h1>
            <p className="text-sm text-muted-foreground">Manage your delivery addresses</p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add Address
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => <div key={i} className="h-24 rounded-xl border bg-card animate-pulse" />)}
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No saved addresses</p>
            <p className="text-sm mt-1">Add an address to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`rounded-xl border bg-card p-4 snap-card-shadow transition-all ${
                  addr.is_default ? "ring-2 ring-primary/30 border-primary/20" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                    {labelIcons[addr.label] || <MapPin className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{addr.label}</span>
                      {addr.is_default && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                          <Check className="h-3 w-3" /> Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{addr.full_address}</p>
                    {(addr.flat_building || addr.landmark) && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {[addr.flat_building, addr.landmark].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    {addr.pincode && (
                      <p className="text-xs text-muted-foreground">{[addr.city, addr.state, addr.pincode].filter(Boolean).join(", ")}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!addr.is_default && (
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleSetDefault(addr.id)} title="Set as default">
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => openEdit(addr)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => handleDelete(addr.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>Enter your delivery address details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {/* Detect location */}
            <Button variant="outline" className="w-full gap-2" onClick={handleDetect} disabled={detecting}>
              <Navigation className="h-4 w-4" />
              {detecting ? "Detecting..." : "Use Current Location"}
            </Button>

            {/* Label */}
            <div>
              <label className="text-sm font-medium text-foreground">Label</label>
              <div className="flex gap-2 mt-1.5">
                {["Home", "Work", "Other"].map((l) => (
                  <Button
                    key={l}
                    type="button"
                    size="sm"
                    variant={form.label === l ? "default" : "outline"}
                    onClick={() => setForm((f) => ({ ...f, label: l }))}
                    className="gap-1.5 flex-1"
                  >
                    {labelIcons[l]} {l}
                  </Button>
                ))}
              </div>
            </div>

            {/* Full address */}
            <div>
              <label className="text-sm font-medium text-foreground">Full Address *</label>
              <textarea
                value={form.full_address}
                onChange={(e) => setForm((f) => ({ ...f, full_address: e.target.value }))}
                placeholder="Street address, area..."
                rows={2}
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              />
            </div>

            {/* Flat/Building */}
            <div>
              <label className="text-sm font-medium text-foreground">Flat / Building / Floor</label>
              <input
                type="text"
                value={form.flat_building}
                onChange={(e) => setForm((f) => ({ ...f, flat_building: e.target.value }))}
                placeholder="e.g., Flat 201, Tower B"
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Landmark */}
            <div>
              <label className="text-sm font-medium text-foreground">Landmark</label>
              <input
                type="text"
                value={form.landmark}
                onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))}
                placeholder="Near..."
                className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">State</label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Pincode</label>
                <input
                  type="text"
                  value={form.pincode}
                  onChange={(e) => setForm((f) => ({ ...f, pincode: e.target.value }))}
                  className="mt-1.5 w-full rounded-lg border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Default toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_default}
                onChange={(e) => setForm((f) => ({ ...f, is_default: e.target.checked }))}
                className="rounded border-input"
              />
              <span className="text-sm text-foreground">Set as default address</span>
            </label>

            <Button
              onClick={handleSave}
              className="w-full"
              disabled={!form.full_address.trim() || addAddress.isPending || updateAddress.isPending}
            >
              {addAddress.isPending || updateAddress.isPending ? "Saving..." : editing ? "Update Address" : "Save Address"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
