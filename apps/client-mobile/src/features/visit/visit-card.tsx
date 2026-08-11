import { useCurrentVisits } from "@/hooks/visit/use-current-visits";
import { Users } from "lucide-react-native";
import { Text, View } from "react-native";

export default function VisitCard() {
  const today = new Date().toISOString().split("T")[0];

  const { data } = useCurrentVisits({
    start_date: today,
    end_date: today,
    size: 100,
    sort_by: "newest",
  });

  const totalToday = data?.length ?? 0;

  return (
    <View className="w-full bg-primary rounded-3xl mb-2 overflow-hidden shadow-lg shadow-secondary/40">
      <View className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/10" />
      <View className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-primary/10" />

      <View className="p-5">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
            <Users size={18} color="#fff" />
          </View>
          <View>
            <Text className="text-white font-poppins-semibold text-base">
              Kunjungan Client
            </Text>
            <Text className="text-white/60 text-xs font-poppins-light">
              Ringkasan aktivitas hari ini
            </Text>
          </View>
        </View>

        <View className="bg-white/5 rounded-2xl py-3 items-center gap-1">
          <Text className="text-white text-2xl font-poppins-bold">
            {totalToday}
          </Text>
          <Text className="text-white/60 text-[11px] font-poppins-medium">
            Kunjungan Hari Ini
          </Text>
        </View>
      </View>
    </View>
  );
}
