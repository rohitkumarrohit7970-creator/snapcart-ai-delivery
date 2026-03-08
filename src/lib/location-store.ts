import { create } from "zustand";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  loading: boolean;
  error: string | null;
  selectedAddressId: string | null;
  selectedAddressLabel: string | null;
  detectLocation: () => void;
  setSelectedAddress: (id: string | null, label: string | null) => void;
  clear: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  address: null,
  loading: false,
  error: null,
  selectedAddressId: null,
  selectedAddressLabel: null,

  detectLocation: () => {
    if (!navigator.geolocation) {
      set({ error: "Geolocation not supported" });
      return;
    }
    set({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        // Reverse geocode using free Nominatim API
        try {
          const resp = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await resp.json();
          const addr =
            data.address?.road ||
            data.address?.suburb ||
            data.address?.city ||
            data.display_name?.split(",").slice(0, 2).join(",") ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          set({
            latitude,
            longitude,
            address: addr,
            loading: false,
            selectedAddressId: null,
            selectedAddressLabel: null,
          });
        } catch {
          set({
            latitude,
            longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            loading: false,
          });
        }
      },
      (err) => {
        set({ error: err.message, loading: false });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  },

  setSelectedAddress: (id, label) =>
    set({ selectedAddressId: id, selectedAddressLabel: label, address: null, latitude: null, longitude: null }),

  clear: () =>
    set({ latitude: null, longitude: null, address: null, selectedAddressId: null, selectedAddressLabel: null }),
}));
