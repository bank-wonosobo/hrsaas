import { OfficeLocation } from "@/schema/office-loc-schema";

type Location = {
  lat: number;
  lng: number;
  radius: number; // meter
  address: string;
};

type CurrentLocation = {
  lat: number;
  lng: number;
};

type CheckLocationResult = {
  isInside: boolean;
  location: OfficeLocation | null;
  distance: number | null;
};

export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // meter

  const toRad = (deg: number): number => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function checkLocation(
  current: CurrentLocation,
  locations: OfficeLocation[],
): CheckLocationResult {
  for (const location of locations) {
    const distance = getDistance(
      current.lat,
      current.lng,
      location.lat,
      location.lng,
    );

    if (distance <= location.radius_meters) {
      return {
        isInside: true,
        location,
        distance: Math.round(distance),
      };
    }
  }

  return {
    isInside: false,
    location: null,
    distance: null,
  };
}
