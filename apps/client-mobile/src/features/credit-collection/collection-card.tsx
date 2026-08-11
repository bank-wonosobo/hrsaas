import { ClipboardList, Wallet } from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  totalVisits: number;
  totalSetoran: number;
}

export default function CollectionCard({ totalVisits, totalSetoran }: Props) {
  return (
    <View className="bg-primary rounded-2xl p-4 mb-3 flex-row">
      <View className="flex-1 gap-1">
        <View className="h-8 w-8 rounded-full bg-white/20 items-center justify-center">
          <ClipboardList size={16} color="#fff" />
        </View>
        <Text className="font-poppins-regular text-[11px] text-white/70 mt-1">
          Total Kunjungan
        </Text>
        <Text className="font-poppins-bold text-lg text-white">
          {totalVisits.toLocaleString("id-ID")}
        </Text>
      </View>

      <View className="w-px bg-white/20 mx-3" />

      <View className="flex-1 gap-1">
        <View className="h-8 w-8 rounded-full bg-white/20 items-center justify-center">
          <Wallet size={16} color="#fff" />
        </View>
        <Text className="font-poppins-regular text-[11px] text-white/70 mt-1">
          Total Setoran
        </Text>
        <Text
          numberOfLines={1}
          className="font-poppins-bold text-lg text-white"
        >
          Rp {totalSetoran.toLocaleString("id-ID")}
        </Text>
      </View>
    </View>
  );
}
