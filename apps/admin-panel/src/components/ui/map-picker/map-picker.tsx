"use client";
import "leaflet/dist/leaflet.css";
import { Loader2, MapPin, Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const DEBOUNCE_MS = 500;
const DEFAULT_LAT = -6.2088;
const DEFAULT_LNG = 106.8456;

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface Props {
  defaultLat?: number;
  defaultLng?: number;
  onLocationChange: (lat: number, lng: number, address: string) => void;
}

export default function MapPicker({ defaultLat, defaultLng, onLocationChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const markerRef = useRef<unknown>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Close suggestions when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let destroyed = false;

    import("leaflet").then((mod) => {
      if (destroyed) return;
      const L = mod.default;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current!, {
        center: [defaultLat ?? DEFAULT_LAT, defaultLng ?? DEFAULT_LNG],
        zoom: defaultLat ? 15 : 12,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (defaultLat && defaultLng) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (markerRef as any).current = L.marker([defaultLat, defaultLng]).addTo(map);
      }

      // Click on map → reverse geocode
      map.on("click", async (e: { latlng: { lat: number; lng: number } }) => {
        const { lat, lng } = e.latlng;
        placeMarker(L, map, lat, lng);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "Accept-Language": "id" } },
          );
          const data = await res.json();
          onLocationChange(lat, lng, data.display_name ?? "");
        } catch {
          onLocationChange(lat, lng, "");
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapRef as any).current = map;
    });

    return () => {
      destroyed = true;
      if (mapRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapRef.current as any).remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced fetch suggestions (does NOT move map)
  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSearchError("");
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setSearchError("");

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=0`,
          { headers: { "Accept-Language": "id" } },
        );
        const results: NominatimResult[] = await res.json();

        if (!results.length) {
          setSearchError("Alamat tidak ditemukan");
          setSuggestions([]);
          setShowSuggestions(false);
        } else {
          setSuggestions(results);
          setShowSuggestions(true);
          setSearchError("");
        }
      } catch {
        setSearchError("Gagal mencari alamat.");
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Called when user picks a suggestion → move map
  const handleSelectSuggestion = async (item: NominatimResult) => {
    const latNum = parseFloat(item.lat);
    const lngNum = parseFloat(item.lon);

    setSearchQuery(item.display_name);
    setShowSuggestions(false);
    setSuggestions([]);

    const L = (await import("leaflet")).default;
    if (mapRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapRef.current as any).setView([latNum, lngNum], 16);
      placeMarker(L, mapRef.current, latNum, lngNum);
    }
    onLocationChange(latNum, lngNum, item.display_name);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const placeMarker = (L: any, map: any, lat: number, lng: number) => {
    if (markerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (markerRef.current as any).setLatLng([lat, lng]);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (markerRef as any).current = L.marker([lat, lng]).addTo(map);
    }
  };

  return (
    <div className="space-y-2">
      {/* Search with suggestions dropdown */}
      <div ref={wrapperRef} className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Ketik alamat untuk mencari..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(false);
            }}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="w-full text-sm border border-zinc-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:border-black"
          />
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            {isSearching
              ? <Loader2 size={14} className="animate-spin" />
              : <Search size={14} />
            }
          </span>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full z-1000 mt-1 rounded-xl border border-zinc-200 bg-white shadow-lg overflow-hidden">
            {suggestions.map((item, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className="flex items-start gap-2.5 w-full px-3 py-2.5 text-left text-sm hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0"
              >
                <MapPin size={14} className="text-zinc-400 shrink-0 mt-0.5" />
                <span className="text-zinc-700 leading-snug line-clamp-2">
                  {item.display_name}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {searchError && <p className="text-xs text-red-500">{searchError}</p>}

      {/* Map */}
      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-zinc-200"
        style={{ height: 320 }}
      />
      <p className="text-xs text-zinc-400">
        Pilih dari rekomendasi atau klik langsung pada peta
      </p>
    </div>
  );
}
