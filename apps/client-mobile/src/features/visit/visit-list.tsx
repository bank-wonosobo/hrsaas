import { useCurrentVisits } from "@/hooks/visit/use-current-visits";
import { Visit } from "@/schema/visit-schema";
import { Inbox } from "lucide-react-native";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import VisitItem from "./visit-item";

export default function VisitList() {
  const now = new Date();
  const fifteenDaysAgo = new Date();
  fifteenDaysAgo.setDate(now.getDate() - 15);

  const { data, isLoading } = useCurrentVisits({
    start_date: fifteenDaysAgo.toISOString().split("T")[0],
    end_date: now.toISOString().split("T")[0],
    size: 100,
    sort_by: "newest",
  });

  if (isLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <View>
      <Text className="text-base font-poppins-semibold text-secondary mb-1">
        Daftar Kunjungan
      </Text>
      <Text className="text-xs font-poppins-regular text-gray-400 mb-3">
        Pantau agenda kunjungan client 15 hari terakhir
      </Text>
      <FlatList
        data={data ?? []}
        keyExtractor={(item: Visit) => item.id}
        renderItem={({ item }) => <VisitItem visit={item} />}
        ItemSeparatorComponent={() => <View className="h-2" />}
        scrollEnabled={false}
        ListEmptyComponent={
          <View className="items-center justify-center py-16 gap-2">
            <Inbox size={32} color="#9ca3af" />
            <Text className="font-poppins-medium text-sm text-gray-400">
              Belum ada data kunjungan
            </Text>
          </View>
        }
      />
    </View>
  );
}
