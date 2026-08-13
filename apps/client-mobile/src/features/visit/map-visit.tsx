import { Coordinates } from "@/hooks/common/use-location";
import { Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface Props {
  coor: Coordinates;
  address: string;
}

export default function MapVisit({ coor, address }: Props) {
  return (
    <View className="bg-white p-4 rounded-xl gap-2">
      <Text className="font-poppins-medium">Lokasi Kunjungan</Text>
      <View className="w-full h-40 rounded-lg overflow-hidden">
        <MapView
          style={{ flex: 1 }}
          mapType="terrain"
          initialRegion={{
            latitude: coor.lat,
            longitude: coor.lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          <Marker coordinate={{ latitude: coor.lat, longitude: coor.lng }} />
        </MapView>
      </View>
      <Text className="font-poppins-regular text-xs text-gray-600">
        {address}
      </Text>
    </View>
  );
}
