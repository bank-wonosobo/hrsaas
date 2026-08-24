import AnnouncementItem from "@/features/announcement/announcement-item";
import { useAnnouncements } from "@/hooks/announcement/use-announcements";
import { Announcement } from "@/schema/announcement-schema";
import { useRouter } from "expo-router";
import { Inbox } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

const PAGE_SIZE = 10;

export default function AnnouncementsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<Announcement[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isFetching, isPlaceholderData, refetch } =
    useAnnouncements({ page, size: PAGE_SIZE });

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
    if (isFetching || !data?.paging) return;
    if (page < (data.paging.total_page ?? 1)) {
      setPage((prev) => prev + 1);
    }
  };

  if (isLoading && page === 1 && items.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 py-16">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <AnnouncementItem
          announcement={item}
          onPress={() => router.push(`/announcements/${item.id}`)}
        />
      )}
      ItemSeparatorComponent={() => <View className="h-2" />}
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-10"
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
            Belum ada pengumuman
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
