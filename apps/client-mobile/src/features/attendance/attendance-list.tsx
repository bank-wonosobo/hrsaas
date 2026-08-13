import { useGetAttendances } from "@/hooks/attendance/use-get-attendances";
import { Attendance } from "@/schema/attendance-schema";
import { Inbox } from "lucide-react-native";
import { ReactNode, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import AttendanceItem from "./attendance-item";

const PAGE_SIZE = 10;

interface Props {
  ListHeaderComponent?: ReactNode;
}

export default function AttendaceList({ ListHeaderComponent }: Props) {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Attendance[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isFetching, isPlaceholderData, refetch } =
    useGetAttendances({
      page,
      size: PAGE_SIZE,
    });

  useEffect(() => {
    if (!data || isPlaceholderData) return;
    setItems((prev) => {
      if (page === 1) return data.data;
      const existingIds = new Set(prev.map((item) => item.id));
      const newItems = data.data.filter((item) => !existingIds.has(item.id));
      return [...prev, ...newItems];
    });
    setRefreshing(false);
  }, [data, page, isPlaceholderData]);

  const handleRefresh = () => {
    setRefreshing(true);
    if (page !== 1) {
      setPage(1);
    } else {
      refetch();
    }
  };

  const handleLoadMore = () => {
    if (isFetching || !data) return;
    if (page < data.paging.total_page) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading && page === 1 && items.length === 0) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <AttendanceItem attendance={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerClassName="p-4 pb-24"
      ListHeaderComponent={
        <>
          {ListHeaderComponent}
          <Text className="text-xl font-poppins-semibold mt-2 mb-3">
            Riwayat Kehadiran
          </Text>
        </>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3f9aae"
        />
      }
      onEndReachedThreshold={0.4}
      onEndReached={handleLoadMore}
      ListEmptyComponent={
        <View className="items-center justify-center py-20 gap-2">
          <Inbox size={32} color="#9ca3af" />
          <Text className="font-poppins-medium text-sm text-gray-400">
            Belum ada riwayat kehadiran
          </Text>
        </View>
      }
      ListFooterComponent={
        isFetching && page > 1 ? (
          <View className="py-4">
            <ActivityIndicator color="#3f9aae" />
          </View>
        ) : null
      }
    />
  );
}
