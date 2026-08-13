import CollectionCard from "@/features/credit-collection/collection-card";
import CollectionDetailModal from "@/features/credit-collection/collection-detail-modal";
import CollectionItem from "@/features/credit-collection/collection-item";
import { useCreditCollectionList } from "@/hooks/credit-collection/list";
import { CreditCollectionVisitRecord } from "@/schema/credit-collection-schema";
import { Inbox } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";

const PAGE_SIZE = 10;

export default function CollectionList() {
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<CreditCollectionVisitRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<CreditCollectionVisitRecord | null>(
    null,
  );

  const { data, isLoading, isFetching, isPlaceholderData, refetch } =
    useCreditCollectionList({
      page,
      size: PAGE_SIZE,
    });

  const totalSetoran = useMemo(
    () => items.reduce((sum, item) => sum + item.total_paid, 0),
    [items],
  );

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
    <>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CollectionItem
            creditCustomer={item}
            onPress={() => setSelected(item)}
          />
        )}
        contentContainerClassName="p-4 pb-24"
        ListHeaderComponent={
          items.length > 0 ? (
            <CollectionCard
              totalVisits={data?.paging.total_item ?? items.length}
              totalSetoran={totalSetoran}
            />
          ) : null
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
              Belum ada riwayat penagihan
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
      <CollectionDetailModal record={selected} onClose={() => setSelected(null)} />
    </>
  );
}
