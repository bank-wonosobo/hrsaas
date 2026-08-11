import { Coordinates } from "@/hooks/common/use-location";
import { Text, View } from "react-native";
import MapView, { Marker } from "react-native-maps";

interface Props {
  coor: Coordinates;
  address: string;
}

export default function MapCollection({ coor, address }: Props) {
  return (
    <View className=" bg-white p-3 rounded-xl">
      <Text className="mb-3 font-poppins-semibold">Lokasi Penagihan</Text>
      <View className="w-full h-40">
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
          <Marker
            coordinate={{
              latitude: coor.lat,
              longitude: coor.lng,
            }}
          />
        </MapView>
      </View>
      <Text className="font-poppins-regular mt-2">{address}</Text>
    </View>
  );
}
