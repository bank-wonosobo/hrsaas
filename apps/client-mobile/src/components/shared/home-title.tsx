import { useAuth } from "@/context/auth-context";
import { Text, View } from "react-native";
import { Avatar } from "../ui/avatar";

export default function HomeTitle() {
  const { user } = useAuth();
  return (
    <View className="mb-5 flex-row items-center justify-between">
      <View className="min-w-0 flex-1 mr-3">
        <Text className="text-md font-poppins-light text-text">Hello</Text>
        <Text className="flex-shrink text-2xl text-gray-900 font-poppins-semibold">
          {user?.name}
        </Text>
      </View>
      <View className="shrink-0">
        <Avatar name={user?.name} size={45} src={user?.image_url} />
      </View>
    </View>
  );
}
