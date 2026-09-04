import { fetchLocationName } from "@/lib/utils/get-address";
import * as Location from "expo-location";
import { useEffect, useState } from "react";

export type Coordinates = { lat: number; lng: number };

type UseLocationResult = {
  coor: Coordinates | null;
  address: string;
  loading: boolean;
  error: string | null;
};

export function useLocation(): UseLocationResult {
  const [coor, setCoor] = useState<Coordinates | null>(null);
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setError(
            "BW Akses+ menggunakan lokasi Anda untuk memverifikasi lokasi saat melakukan absensi dan memastikan aktivitas dilakukan dari lokasi yang diizinkan.",
          );
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const nextCoor = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
        };

        setCoor(nextCoor);
        setAddress(await fetchLocationName(nextCoor.lat, nextCoor.lng));
      } catch {
        setError("Gagal mengambil lokasi terkini");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { coor, address, loading, error };
}
