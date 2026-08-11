export const fetchLocationName = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
      {
        headers: {
          "User-Agent": "ExpoApp/1.0 (rifai0850@gmail.com)",
        },
      }
    );

    if (!res.ok) throw new Error("Failed to fetch address");

    const data = await res.json();
    return (
      data.display_name || `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`
    );
  } catch {
    return `Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`;
  }
};
