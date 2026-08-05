"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Navigation, Edit, RefreshCw } from "lucide-react";
import useCartStore from "../../../store/cartStore";
import useToastStore from "../../../store/toastStore";
import OrderTypeSelector from "./OrderTypeSelector";
import api from "../../../api";
import { useLanguage } from "../../../context/LanguageContext";
import { t } from "../../../locales/i18n/getTranslation";
import type { CheckoutFormData } from "../../../lib/validations/checkoutSchemas";

const SOFIA_CENTER = { lat: 42.6977, lng: 23.3219 };
const SOFIA_BOUNDS: [[number, number], [number, number]] = [
  [42.6, 23.2],
  [42.8, 23.5],
];
const SOFIA_LIMITS = {
  minLat: 42.6,
  maxLat: 42.8,
  minLng: 23.2,
  maxLng: 23.5,
};

const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

interface LeafletMarker {
  setLatLng(latlng: [number, number]): void;
  addTo(map: LeafletMap): LeafletMarker;
}

interface LeafletMapClickEvent {
  latlng: { lat: number; lng: number };
}

interface LeafletMap {
  setView(latlng: [number, number], zoom: number): void;
  on(event: "click", handler: (event: LeafletMapClickEvent) => void): void;
  off(): void;
  remove(): void;
}

interface LeafletTileLayer {
  addTo(map: LeafletMap): LeafletTileLayer;
}

interface LeafletNamespace {
  map(
    el: HTMLElement,
    options: {
      center: [number, number];
      zoom: number;
      maxBounds: [[number, number], [number, number]];
      maxBoundsViscosity: number;
    }
  ): LeafletMap;
  tileLayer(urlTemplate: string, options: { attribution: string; maxZoom: number }): LeafletTileLayer;
  marker(latlng: [number, number], options: { draggable: boolean; title: string }): LeafletMarker;
}

declare global {
  interface Window {
    L?: LeafletNamespace;
  }
}

interface DeliveryQuote {
  quote_id?: string;
  fee_bgn?: number;
  currency?: string;
  eta_min?: number;
  [key: string]: unknown;
}

interface ShippingAddressSectionProps {
  formData: CheckoutFormData;
  setFormData: (updater: (prev: CheckoutFormData) => Partial<CheckoutFormData>) => void;
}

const isInsideSofia = (lat: number, lng: number) =>
  lat >= SOFIA_LIMITS.minLat &&
  lat <= SOFIA_LIMITS.maxLat &&
  lng >= SOFIA_LIMITS.minLng &&
  lng <= SOFIA_LIMITS.maxLng;

export default function ShippingAddressSection({ formData, setFormData }: ShippingAddressSectionProps) {
  const { orderType, setDeliveryCharge } = useCartStore();
  const { error: toastError, success: toastSuccess } = useToastStore();
  const { lang } = useLanguage();
  const isDelivery = orderType === "delivery";

  const initialLocation = useMemo(
    () => ({
      lat: Number(formData.latitude) || SOFIA_CENTER.lat,
      lng: Number(formData.longitude) || SOFIA_CENTER.lng,
    }),
    [formData.latitude, formData.longitude]
  );

  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [mapError, setMapError] = useState<string | null>(null);
  const [loading, setLoading] = useState({
    map: false,
    location: false,
    geocoding: false,
    quote: false,
  });

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<LeafletMarker | null>(null);
  const leafletPromiseRef = useRef<Promise<void> | null>(null);
  const lastValidLocationRef = useRef(initialLocation);
  const lastGeocodeCallRef = useRef(0);

  useEffect(() => {
    setSelectedLocation(initialLocation);
    lastValidLocationRef.current = initialLocation;
  }, [initialLocation]);

  const updateMarker = useCallback((lat: number, lng: number, { focus = true }: { focus?: boolean } = {}) => {
    if (typeof window === "undefined" || !window.L || !mapInstanceRef.current) return;

    if (!markerRef.current) {
      markerRef.current = window.L.marker([lat, lng], {
        draggable: false,
        title: "Delivery Location",
      }).addTo(mapInstanceRef.current);
    } else {
      markerRef.current.setLatLng([lat, lng]);
    }

    if (focus) {
      mapInstanceRef.current.setView([lat, lng], 15);
    }
  }, []);

  const fetchDeliveryQuote = useCallback(
    async ({ lat, lng, address }: { lat: number | null; lng: number | null; address: string | null }) => {
      if (!lat || !lng || !address) {
        // Reset delivery charge if invalid location
        setDeliveryCharge(0);
        return;
      }
      setLoading((prev) => ({ ...prev, quote: true }));
      setDeliveryQuote(null);
      // Reset delivery charge before fetching new quote
      setDeliveryCharge(0);

      try {
        const response = await api.delivery.getDeliveryQuote({ lat, lng, address });
        if (response?.success && response.data) {
          const quote = response.data as DeliveryQuote;
          setDeliveryQuote(quote);
          setDeliveryCharge(Number(quote.fee_bgn) || 0);
          setFormData((prev) => ({ ...prev, quote_id: quote.quote_id }));
          return;
        }
        throw new Error(response?.message || "Failed to get delivery quote");
      } catch (error) {
        const err = error as { response?: { data?: { reason?: string } }; data?: { reason?: string }; message?: string };
        const reason =
          err?.response?.data?.reason ||
          err?.data?.reason ||
          err?.message ||
          "Unable to get delivery quote";
        toastError(reason);
        // Reset delivery charge on error
        setDeliveryCharge(0);
      } finally {
        setLoading((prev) => ({ ...prev, quote: false }));
      }
    },
    [setDeliveryCharge, setFormData, toastError]
  );

  const reverseGeocodeAndQuote = useCallback(
    async (lat: number, lng: number) => {
      const now = Date.now();
      const diff = now - lastGeocodeCallRef.current;
      if (diff < 1000) {
        await new Promise((resolve) => setTimeout(resolve, 1000 - diff));
      }
      lastGeocodeCallRef.current = Date.now();

      setLoading((prev) => ({ ...prev, geocoding: true }));
      setShowManualInput(false);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { "User-Agent": "PeakLink/1.0" } }
        );
        if (!response.ok) throw new Error("Geocoding failed");
        const data = await response.json();
        if (!data?.address) throw new Error("Unable to detect address automatically");

        const addr = data.address;
        const detectedAddress =
          data.display_name ||
          [addr.road, addr.neighbourhood, addr.city || addr.town || addr.village]
            .filter(Boolean)
            .join(", ");

        setFormData((prev) => ({
          ...prev,
          address: detectedAddress,
          city: addr.city || addr.town || addr.village || addr.municipality || prev.city,
          state: addr.state || addr.region || prev.state,
          zipCode: addr.postcode || prev.zipCode,
          country: addr.country || prev.country,
          latitude: lat,
          longitude: lng,
        }));

        fetchDeliveryQuote({ lat, lng, address: detectedAddress });
        } catch (error) {
        setShowManualInput(true);
        toastError((error as Error)?.message || t(lang, "unable_detect_address_manual"));
      } finally {
        setLoading((prev) => ({ ...prev, geocoding: false }));
      }
    },
    [fetchDeliveryQuote, setFormData, toastError, lang]
  );

  const selectLocation = useCallback(
    (lat: number, lng: number, options: { focus?: boolean; geocode?: boolean } = {}) => {
      if (!isInsideSofia(lat, lng)) {
        const message = t(lang, "select_inside_sofia_zone");
        setMapError(message);
        toastError(message);
        const fallback = lastValidLocationRef.current || SOFIA_CENTER;
        updateMarker(fallback.lat, fallback.lng, { focus: true });
        return;
      }

      const normalized = { lat: Number(lat), lng: Number(lng) };
      setMapError(null);
      lastValidLocationRef.current = normalized;
      setSelectedLocation(normalized);
      updateMarker(normalized.lat, normalized.lng, options);

      setFormData((prev) => ({
        ...prev,
        latitude: normalized.lat,
        longitude: normalized.lng,
      }));

      // Only geocode when explicitly selecting (not on initial load)
      if (options.geocode !== false) {
        reverseGeocodeAndQuote(normalized.lat, normalized.lng);
      }
    },
    [setFormData, toastError, updateMarker, reverseGeocodeAndQuote, lang]
  );

  const loadLeafletAssets = useCallback((): Promise<void> => {
    if (typeof window === "undefined") return Promise.reject(new Error("No window"));
    if (window.L) return Promise.resolve();
    if (leafletPromiseRef.current) return leafletPromiseRef.current;

    leafletPromiseRef.current = new Promise((resolve, reject) => {
      if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
        const link = document.createElement("link");
        Object.assign(link, {
          rel: "stylesheet",
          href: LEAFLET_CSS,
          integrity: "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",
          crossOrigin: "",
        });
        document.head.appendChild(link);
      }

      const script = document.createElement("script");
      Object.assign(script, {
        src: LEAFLET_JS,
        integrity: "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=",
        crossOrigin: "",
      });
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Leaflet failed to load"));
      document.body.appendChild(script);
    });

    return leafletPromiseRef.current;
  }, []);

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.L || mapInstanceRef.current) return;

    const map = window.L.map(mapRef.current, {
      center: [selectedLocation.lat, selectedLocation.lng],
      zoom: 13,
      maxBounds: SOFIA_BOUNDS,
      maxBoundsViscosity: 1.0,
    });

    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      selectLocation(lat, lng);
    });

    mapInstanceRef.current = map;
    updateMarker(selectedLocation.lat, selectedLocation.lng, { focus: false });

    // Only geocode on initial load if we don't have an address yet
    if (!formData.address) {
      reverseGeocodeAndQuote(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectLocation, selectedLocation.lat, selectedLocation.lng, updateMarker, formData.address, reverseGeocodeAndQuote]);

  useEffect(() => {
    if (!isDelivery) return;
    let cancelled = false;

    setLoading((prev) => ({ ...prev, map: true }));

    loadLeafletAssets()
      .then(() => {
        if (cancelled) return;
        initializeMap();
        setLoading((prev) => ({ ...prev, map: false }));
      })
      .catch(() => {
        if (cancelled) return;
        setMapError(t(lang, "failed_load_map_retry"));
        setLoading((prev) => ({ ...prev, map: false }));
      });

    return () => {
      cancelled = true;
    };
  }, [isDelivery, loadLeafletAssets, initializeMap, lang]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off();
        mapInstanceRef.current.remove();
      }
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      toastError(t(lang, "geolocation_not_supported"));
      selectLocation(SOFIA_CENTER.lat, SOFIA_CENTER.lng);
      return;
    }

    setLoading((prev) => ({ ...prev, location: true }));
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (!isInsideSofia(latitude, longitude)) {
          toastError(t(lang, "outside_sofia_using_center"));
          selectLocation(SOFIA_CENTER.lat, SOFIA_CENTER.lng, { focus: true });
        } else {
          toastSuccess(t(lang, "location_detected"));
          selectLocation(latitude, longitude, { focus: true });
        }
        setLoading((prev) => ({ ...prev, location: false }));
      },
      (error) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: t(lang, "please_allow_location_access"),
          [error.POSITION_UNAVAILABLE]: t(lang, "location_unavailable"),
          [error.TIMEOUT]: t(lang, "location_timeout"),
        };
        toastError(messages[error.code] || t(lang, "unable_get_location"));
        setLoading((prev) => ({ ...prev, location: false }));
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [selectLocation, toastError, toastSuccess, lang]);

  const handleManualSubmit = useCallback(() => {
    if (!manualAddress.trim()) {
      toastError(t(lang, "please_enter_address"));
      return;
    }
    if (!selectedLocation) {
      toastError(t(lang, "please_select_location_first"));
      return;
    }

    setFormData((prev) => ({ ...prev, address: manualAddress.trim() }));
    fetchDeliveryQuote({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: manualAddress.trim(),
    });
    setShowManualInput(false);
    toastSuccess(t(lang, "address_saved_successfully"));
  }, [fetchDeliveryQuote, manualAddress, selectedLocation, setFormData, toastError, toastSuccess, lang]);

  if (!isDelivery) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 3 }}
            className="w-12 h-12 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center"
          >
            <MapPin className="w-6 h-6 text-white fill-white" />
          </motion.div>
          <h3 className="text-white text-2xl font-black uppercase">{t(lang, "pickup_information")}</h3>
        </div>
        <OrderTypeSelector />
        <div className="p-4 bg-theme3/20 border border-theme3/50 rounded-xl">
          <p className="text-white text-sm">
            {t(lang, "pickup_from_branch")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 3 }}
          className="w-12 h-12 shadow-2xl rounded-xl bg-theme3 flex items-center justify-center"
        >
          <MapPin className="w-6 h-6 text-white fill-white" />
        </motion.div>
        <h3 className="text-white text-2xl font-black uppercase">{t(lang, "delivery_address")}</h3>
      </div>

      <OrderTypeSelector />

      <div className="mb-4 flex items-center justify-between gap-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={getCurrentLocation}
          disabled={loading.location || loading.map}
          className="flex items-center gap-2 px-4 py-2 bg-theme3/20 border-2 border-theme3 rounded-xl text-theme3 font-semibold hover:bg-theme3/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading.location ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{t(lang, "getting_location")}</span>
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4" />
              <span>{t(lang, "use_current_location")}</span>
            </>
          )}
        </motion.button>

        <motion.button
          type="button"
          whileHover={{ scale: 1.02}}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setMapError(null);
            setLoading((prev) => ({ ...prev, map: true }));
            // Reset map instance
            if (mapInstanceRef.current) {
              try {
                mapInstanceRef.current.off();
                mapInstanceRef.current.remove();
              } catch (error) {
                console.warn("Error removing map:", error);
              }
              mapInstanceRef.current = null;
              markerRef.current = null;
              if (mapRef.current) {
                (mapRef.current as HTMLDivElement & { _leaflet_id?: number | null })._leaflet_id = null;
              }
            }
            // Reload Leaflet and reinitialize
            leafletPromiseRef.current = null;
            loadLeafletAssets()
              .then(() => {
                initializeMap();
                setLoading((prev) => ({ ...prev, map: false }));
                toastSuccess(t(lang, "map_reloaded_successfully"));
              })
              .catch(() => {
                setMapError(t(lang, "failed_reload_map"));
                setLoading((prev) => ({ ...prev, map: false }));
                toastError(t(lang, "failed_reload_map"));
              });
          }}
          disabled={loading.map}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 border-2 border-white/20 rounded-xl text-white font-semibold hover:bg-white/20 hover:border-white/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Reload Map"
        >
          {loading.map ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span className="hidden sm:inline">{t(lang, "reload_map")}</span>
        </motion.button>
      </div>

      <div className="mb-4">
        <div className="relative w-full h-[400px] rounded-xl overflow-hidden border-2 border-white/20">
          {loading.map ? (
            <div className="absolute inset-0 flex items-center justify-center bg-bgimg z-10">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-theme3 animate-spin mx-auto mb-2" />
                <p className="text-text">{t(lang, "loading_map")}</p>
              </div>
            </div>
          ) : mapError && !mapInstanceRef.current ? (
            <div
              className="absolute inset-0 flex items-center justify-center bg-bgimg p-4 cursor-pointer hover:bg-bgimg/80 transition-colors z-10"
              onClick={() => {
                setMapError(null);
                setLoading((prev) => ({ ...prev, map: true }));
                loadLeafletAssets()
                  .then(() => initializeMap())
                  .finally(() => setLoading((prev) => ({ ...prev, map: false })));
              }}
            >
              <div className="text-center max-w-md">
                <p className="text-red-400 mb-3 font-semibold">{mapError}</p>
                <p className="text-text text-sm mb-2">{t(lang, "click_to_reload_map")}</p>
                <button className="px-4 py-2 bg-theme3 text-white rounded-lg hover:bg-theme transition-colors">
                  {t(lang, "reload_map")}
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={mapRef}
              className="w-full h-full"
              onClick={() => {
                if (!mapInstanceRef.current) {
                  loadLeafletAssets().then(() => initializeMap());
                }
              }}
            />
          )}
        </div>
      </div>

      {showManualInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-xl"
        >
          <div className="flex items-start gap-3 mb-3">
            <Edit className="w-5 h-5 text-yellow-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-yellow-400 font-semibold mb-2">{t(lang, "enter_address_manually")}</p>
              <p className="text-text text-xs mb-3">
                {t(lang, "unable_detect_address")}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder={t(lang, "enter_full_address_placeholder")}
                  className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-text/50 focus:outline-none focus:border-theme3 focus:ring-2 focus:ring-theme3/20"
                  onKeyDown={(e) => e.key === "Enter" && handleManualSubmit()}
                />
                <button
                  onClick={handleManualSubmit}
                  className="px-4 py-2 bg-theme3 text-white rounded-lg hover:bg-theme transition-colors font-semibold"
                >
                  {t(lang, "save")}
                </button>
                <button
                  onClick={() => {
                    setShowManualInput(false);
                    setManualAddress("");
                  }}
                  className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                >
                  {t(lang, "cancel")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {formData.address && !showManualInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-white/5 border border-white/10 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-theme3 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-white text-sm font-semibold mb-1">{t(lang, "selected_address")}</p>
              <p className="text-white text-sm mb-2">{formData.address}</p>
              {(formData.city || formData.state || formData.zipCode || formData.country) && (
                <div className="flex flex-wrap gap-2 text-xs text-text">
                  {formData.city && <span>{formData.city}</span>}
                  {formData.state && <span>{formData.state}</span>}
                  {formData.zipCode && <span>{formData.zipCode}</span>}
                  {formData.country && <span>{formData.country}</span>}
                </div>
              )}
              {formData.latitude && formData.longitude && (
                <p className="text-text text-xs mt-2">
                  📍 {Number(formData.latitude).toFixed(6)}, {Number(formData.longitude).toFixed(6)}
                </p>
              )}
            </div>
            {loading.geocoding && <Loader2 className="w-4 h-4 text-theme3 animate-spin" />}
          </div>
        </motion.div>
      )}

      {loading.quote && (
        <div className="mb-4 p-3 bg-theme3/20 border border-theme3/50 rounded-xl">
          <div className="flex items-center gap-2 text-theme3">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">{t(lang, "calculating_delivery_fee")}</span>
          </div>
        </div>
      )}

      {deliveryQuote && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-theme3/20 border border-theme3/50 rounded-xl"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text text-sm font-semibold">{t(lang, "delivery_fee")}</span>
            <span className="text-theme3 font-bold text-lg">
              {deliveryQuote.fee_bgn} {deliveryQuote.currency || "BGN"}
            </span>
          </div>
          {deliveryQuote.eta_min && (
            <div className="flex items-center justify-between">
              <span className="text-text text-xs">{t(lang, "estimated_time")}</span>
              <span className="text-white text-xs font-semibold">
                {deliveryQuote.eta_min} {t(lang, "minutes")}
              </span>
            </div>
          )}
        </motion.div>
      )}

      {mapError && mapError.includes("outside") && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-red-400 font-semibold mb-1">{t(lang, "outside_delivery_area")}</p>
              <p className="text-text text-sm">
                {t(lang, "outside_service_area_message")}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="p-3 bg-white/5 border border-white/10 rounded-xl mb-4">
        <p className="text-text text-xs">
          💡 {t(lang, "map_instruction")}
        </p>
      </div>

      <input type="hidden" name="address" value={formData.address || ""} />
      <input type="hidden" name="city" value={formData.city || ""} />
      <input type="hidden" name="state" value={formData.state || ""} />
      <input type="hidden" name="zipCode" value={formData.zipCode || ""} />
      <input type="hidden" name="country" value={formData.country || ""} />
      <input type="hidden" name="latitude" value={formData.latitude || ""} />
      <input type="hidden" name="longitude" value={formData.longitude || ""} />
    </div>
  );
}
