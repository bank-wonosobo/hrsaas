import { TabContent, TabList, Tabs, TabTrigger } from "@/components/ui/tabs";
import { useSanctions } from "@/hooks/sanction/use-sanctions";
import { isSanctionActive } from "@/lib/utils/sanction";
import { EmployeeSanction } from "@/schema/sanction-schema";
import { Inbox } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import SanctionItem from "./sanction-item";

function SanctionGroup({
  items,
  emptyLabel,
}: {
  items: EmployeeSanction[];
  emptyLabel: string;
}) {
  return (
    <FlatList
      data={items}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <SanctionItem sanction={item} />}
      ItemSeparatorComponent={() => <View className="h-2" />}
      scrollEnabled={false}
      ListEmptyComponent={
        <View className="items-center justify-center py-16 gap-2">
          <Inbox size={32} color="#9ca3af" />
          <Text className="font-poppins-medium text-sm text-gray-400">
            {emptyLabel}
          </Text>
        </View>
      }
    />
  );
}

export default function SanctionList() {
  const { data, isLoading } = useSanctions({ page: 1, size: 50 });
  const [now] = useState(() => Date.now());
  const items = data?.data ?? [];
  const active = items.filter((item) => isSanctionActive(item, now));
  const finished = items.filter((item) => !isSanctionActive(item, now));

  if (isLoading) {
    return (
      <View className="items-center justify-center py-16">
        <ActivityIndicator color="#3f9aae" />
      </View>
    );
  }

  return (
    <Tabs defaultValue="all">
      <TabList>
        <TabTrigger value="all" title="Semua" />
        <TabTrigger value="active" title="Aktif" />
        <TabTrigger value="finished" title="Selesai" />
      </TabList>

      <TabContent value="all">
        <SanctionGroup items={items} emptyLabel="Belum ada riwayat sanksi" />
      </TabContent>
      <TabContent value="active">
        <SanctionGroup items={active} emptyLabel="Tidak ada sanksi aktif" />
      </TabContent>
      <TabContent value="finished">
        <SanctionGroup
          items={finished}
          emptyLabel="Belum ada sanksi yang selesai"
        />
      </TabContent>
    </Tabs>
  );
}
