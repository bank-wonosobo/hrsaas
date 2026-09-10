import { useCurrentSalary } from "@/hooks/salary/use-current-salary";
import { Inbox } from "lucide-react-native";
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from "react-native";
import { useState } from "react";
import SalaryItem from "./salary-item";

export default function SalaryList() {
  const { data, isLoading, refetch } = useCurrentSalary();
  const [refreshing, setRefreshing] = useState(false);
  const items = data ?? [];

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center py-16">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SalaryItem salary={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerClassName="p-4 pb-24"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3f9aae"
        />
      }
      ListEmptyComponent={
        <View className="items-center justify-center gap-2 py-20">
          <Inbox size={32} color="#9ca3af" />
          <Text className="font-poppins-medium text-sm text-gray-400">
            Belum ada slip gaji
          </Text>
        </View>
      }
    />
  );
}
