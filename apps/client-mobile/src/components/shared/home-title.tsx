import { useAuth } from "@/context/auth-context";
import { Text, View } from "react-native";
import { Avatar } from "../ui/avatar";

export default function HomeTitle() {
  const { user } = useAuth();
  return (
    <View className="mb-5 flex-row items-center justify-between">
      <View>
        <Text className="text-md font-poppins-light text-text">Hello</Text>
        <Text className="text-2xl text-gray-900 font-poppins-semibold">
          {user?.name}
        </Text>
      </View>
      <Avatar name={user?.name} size={45} src={user?.image_url} />
    </View>
  );
}
