import Button from "@/components/ui/button";
import CollectionList from "@/features/credit-collection/collection-list";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { Text, View } from "react-native";

export default function Index() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-gray-50">
      <CollectionList />
      <View className="absolute bottom-10 right-7">
        <Button
          variant="secondary"
          fullWidth={false}
          onPress={() => router.push("/credit-collections/search")}
        >
          <View className="flex-row items-center gap-2">
            <Plus size={20} color="#fff" />
            <Text className="font-poppins-medium text-white">
              Mulai Penagihan
            </Text>
          </View>
        </Button>
      </View>
    </View>
  );
}
