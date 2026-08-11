import Button from "@/components/ui/button";
import VisitCard from "@/features/visit/visit-card";
import VisitList from "@/features/visit/visit-list";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { ScrollView, View } from "react-native";

export default function Visits() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24">
        <VisitCard />
        <View className="mt-4">
          <VisitList />
        </View>
      </ScrollView>
      <View className="absolute bottom-10 right-7">
        <Button
          variant="secondary"
          fullWidth={false}
          onPress={() => router.push("/visits/create")}
        >
          <Plus color="white" />
        </Button>
      </View>
    </View>
  );
}
