import SanctionCard from "@/features/sanction/sanction-card";
import SanctionList from "@/features/sanction/sanction-list";
import { useSanctions } from "@/hooks/sanction/use-sanctions";
import { ScrollView, View } from "react-native";

export default function Sanctions() {
  const { data, isLoading } = useSanctions({ page: 1, size: 50 });

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24">
        <SanctionCard sanctions={data?.data} isLoading={isLoading} />
        <View className="mt-4">
          <SanctionList />
        </View>
      </ScrollView>
    </View>
  );
}
