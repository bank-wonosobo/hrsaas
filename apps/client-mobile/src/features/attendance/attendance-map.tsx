import Alert from "@/components/ui/alert";
import { Coordinates } from "@/hooks/common/use-location";
import { useCurrentOfficeLoc } from "@/hooks/office-loc/use-current";
import { checkLocation } from "@/lib/utils/distance-position";
import { MapPin } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Circle, Marker } from "react-native-maps";

interface Props {
  coor: Coordinates | null;
  loading: boolean;
  address: string;
}
export default function AttendanceMap({ coor, loading, address }: Props) {
  const { data: currentLocation } = useCurrentOfficeLoc();
  const [isInsideRadius, setIsInsideRadius] = useState(false);

  // ensure we call checkLocation with defined numeric coordinates
  useEffect(() => {
    if (!coor) return;

    const { isInside } = checkLocation(
      { lat: coor.lat, lng: coor.lng },
      currentLocation?.data ?? [],
    );
    setIsInsideRadius(isInside);
  }, [coor]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 animate-pulse">
        <ActivityIndicator color="#000" />
        <Text className="text-md font-poppins-regular">
          Tunggu Sebentar , sedang mencari lokasi anda...
        </Text>
      </View>
    );
  }

  if (!coor) return null;

  return (
    <>
      <View className="absolute flex-row justify-start items-center w-full top-0 mt-5 z-10 px-5">
        <View className="p-3 rounded-2xl bg-white flex-row gap-2 w-full shadow-md">
          <MapPin />
          <Text>{address}</Text>
        </View>
      </View>
      <View className="absolute flex-row justify-start items-center w-full bottom-0 mb-5 z-10 px-5">
        {isInsideRadius ? (
          <Alert variant="primary" title="Anda berada didalam jangkauan">
            Silahkan melakukan selfie untuk memulai presensi.
          </Alert>
        ) : (
          <Alert variant="warning" title="Anda diluar jangkauan">
            Jika melakukan presensi akan menunggu persetujuan admin.
          </Alert>
        )}
      </View>
      <MapView
        style={{ flex: 1 }}
        mapType="terrain"
        initialRegion={{
          latitude: coor.lat,
          longitude: coor.lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        {currentLocation?.data.map((item, i) => (
          <Circle
            key={i}
            center={{ latitude: item.lat, longitude: item.lng }}
            strokeWidth={1}
            strokeColor="#3f9aae"
            fillColor="rgba(63, 154, 174, 0.3)"
            radius={item.radius_meters}
          />
        ))}

        <Marker
          coordinate={{
            latitude: coor.lat,
            longitude: coor.lng,
          }}
        />
      </MapView>
    </>
  );
}
