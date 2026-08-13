import Badge from "@/components/ui/badge";
import { useCurrentEmployee } from "@/hooks/user/use-current-employee";
import { Briefcase, Inbox } from "lucide-react-native";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

function formatDate(dateMs?: number | null) {
  if (!dateMs) return "-";
  return new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function ContractsPage() {
  const { data: employee, isLoading } = useCurrentEmployee();
  const contracts = employee?.contracts ?? [];

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <FlatList
      data={contracts}
      keyExtractor={(item) => item.id}
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-10"
      ItemSeparatorComponent={() => <View className="h-2" />}
      renderItem={({ item }) => (
        <View className="bg-white rounded-2xl p-4 gap-2 border border-gray-100 shadow-sm shadow-gray-200/50">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2 flex-1 pr-2">
              <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
                <Briefcase size={16} color="#3f9aae" />
              </View>
              <Text
                numberOfLines={1}
                className="font-poppins-semibold text-secondary text-xs flex-1"
              >
                {item.position?.name ?? "-"} · {item.division?.name ?? "-"}
              </Text>
            </View>
            <Badge variant={item.is_active ? "success" : "default"}>
              {item.is_active ? "Aktif" : "Berakhir"}
            </Badge>
          </View>
          <Text className="font-poppins-regular text-xs text-gray-500">
            {item.contract_type} · {formatDate(item.start_date)} -{" "}
            {item.end_date ? formatDate(item.end_date) : "Sekarang"}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <View className="items-center justify-center py-16 gap-2">
          <Inbox size={32} color="#9ca3af" />
          <Text className="font-poppins-medium text-sm text-gray-400">
            Belum ada riwayat kontrak
          </Text>
        </View>
      }
    />
  );
}
