import Badge from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Visit } from "@/schema/visit-schema";
import { useRouter } from "expo-router";
import { Calendar, Clock, LogOut, MapPin } from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  visit: Visit;
}

export default function VisitItem({ visit }: Props) {
  const router = useRouter();
  const detailIn = visit.details?.find((d) => d.visit_type === "IN");
  const detailOut = visit.details?.find((d) => d.visit_type === "OUT");
  const isOngoing = !!detailIn && !detailOut;

  const handleVisitOut = () => {
    router.push({
      pathname: "/visits/create",
      params: { visit_type: "OUT", client_name: visit.client_name },
    });
  };

  return (
    <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-2">
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-secondary text-sm"
          >
            {visit.client_name}
          </Text>
          <Text
            numberOfLines={1}
            className="font-poppins-regular text-[11px] text-gray-400 mt-0.5"
          >
            {detailIn?.note ?? "-"}
          </Text>
        </View>
        <Badge variant={isOngoing ? "warning" : "success"}>
          {isOngoing ? "Berjalan" : "Selesai"}
        </Badge>
      </View>

      <View className="gap-1.5 border-t border-dashed border-gray-200 pt-3">
        <View className="flex-row items-center gap-2">
          <MapPin size={13} color="#9ca3af" />
          <Text
            numberOfLines={1}
            className="flex-1 font-poppins-regular text-xs text-gray-500"
          >
            {detailIn?.address ?? "-"}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Clock size={13} color="#9ca3af" />
          <Text className="font-poppins-regular text-xs text-gray-500">
            {detailIn?.visit_at ?? "-"}{" "}
            {detailOut ? `→ ${detailOut.visit_at}` : "→ ..."}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Calendar size={13} color="#9ca3af" />
          <Text className="font-poppins-regular text-xs text-gray-500">
            {visit.date}
          </Text>
        </View>
      </View>

      {isOngoing && (
        <Button variant="outline" onPress={handleVisitOut}>
          <View className="flex-row items-center gap-2">
            <LogOut size={14} color="#3f9aae" />
            <Text className="font-poppins-medium text-xs text-primary">
              Visit Out
            </Text>
          </View>
        </Button>
      )}
    </View>
  );
}
