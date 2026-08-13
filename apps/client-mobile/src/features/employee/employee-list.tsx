import { useEmployees } from "@/hooks/employee/use-employees";
import { Search, Users } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  TextInput,
  View,
} from "react-native";
import EmployeeItem from "./employee-item";

const PAGE_SIZE = 200;
const SEARCH_DEBOUNCE_MS = 400;

export default function EmployeeList() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(
      () => setDebouncedSearch(search.trim()),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timeout);
  }, [search]);

  const { data, isLoading, isFetching, refetch } = useEmployees({
    key: debouncedSearch || undefined,
    page: 1,
    size: PAGE_SIZE,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  return (
    <FlatList
      data={data?.data ?? []}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <EmployeeItem employee={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-10"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#3f9aae"
        />
      }
      ListHeaderComponent={
        <View className="flex-row items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 mb-3">
          <Search size={16} color="#9ca3af" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama karyawan..."
            placeholderTextColor="#9ca3af"
            className="flex-1 py-3 font-poppins-regular text-sm text-text"
          />
          {isFetching && !refreshing && (
            <ActivityIndicator size="small" color="#3f9aae" />
          )}
        </View>
      }
      ListEmptyComponent={
        isLoading ? (
          <View className="items-center justify-center py-16">
            <ActivityIndicator color="#3f9aae" />
          </View>
        ) : (
          <View className="items-center justify-center py-16 gap-2">
            <Users size={32} color="#9ca3af" />
            <Text className="font-poppins-medium text-sm text-gray-400">
              Karyawan tidak ditemukan
            </Text>
          </View>
        )
      }
    />
  );
}
