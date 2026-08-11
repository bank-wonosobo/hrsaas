import { TabList, Tabs, TabTrigger } from "@/components/ui/tabs";
import { useTimeOffApprovals } from "@/hooks/time-off-approval/use-time-off-approvals";
import { TimeOffApproval } from "@/schema/time-off-approval-schema";
import { Inbox } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import TimeOffApprovalItem from "./time-off-approval-item";

const PAGE_SIZE = 10;

type Category = "pending" | "approved" | "rejected";

const CATEGORY_STATUS: Record<Category, string> = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
};

const EMPTY_LABEL: Record<Category, string> = {
  pending: "Tidak ada pengajuan yang perlu ditindak",
  approved: "Belum ada cuti yang disetujui",
  rejected: "Belum ada cuti yang ditolak",
};

export default function TimeOffApprovalList() {
  const [category, setCategory] = useState<Category>("pending");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<TimeOffApproval[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, isFetching, isPlaceholderData, refetch } =
    useTimeOffApprovals({
      status: CATEGORY_STATUS[category],
      page,
      size: PAGE_SIZE,
    });

  useEffect(() => {
    setPage(1);
    setItems([]);
  }, [category]);

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

  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TimeOffApprovalItem approval={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      contentContainerClassName="p-4 pb-24"
      ListHeaderComponent={
        <View className="mb-2">
          <Tabs
            value={category}
            onValueChange={(v) => setCategory(v as Category)}
          >
            <TabList>
              <TabTrigger value="pending" title="Perlu Tindakan" />
              <TabTrigger value="approved" title="Disetujui" />
              <TabTrigger value="rejected" title="Ditolak" />
            </TabList>
          </Tabs>
          {isLoading && page === 1 && items.length === 0 && (
            <ActivityIndicator color="#3f9aae" style={{ marginTop: 16 }} />
          )}
        </View>
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
        !isLoading ? (
          <View className="items-center justify-center py-16 gap-2">
            <Inbox size={32} color="#9ca3af" />
            <Text className="font-poppins-medium text-sm text-gray-400">
              {EMPTY_LABEL[category]}
            </Text>
          </View>
        ) : null
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
