import { useEmployeeDocuments } from "@/hooks/employee-docs/use-employee-docs";
import { FileStack } from "lucide-react-native";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import EmployeeDocItem from "./employee-doc-item";

export default function EmployeeDocList() {
  const { data, isLoading } = useEmployeeDocuments({ page: 1, size: 50 });
  const items = data?.data ?? [];

  if (isLoading) {
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
      renderItem={({ item }) => <EmployeeDocItem document={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      scrollEnabled={false}
      ListEmptyComponent={
        <View className="items-center justify-center py-16 gap-2">
          <FileStack size={32} color="#9ca3af" />
          <Text className="font-poppins-medium text-sm text-gray-400">
            Belum ada dokumen karyawan
          </Text>
        </View>
      }
    />
  );
}
