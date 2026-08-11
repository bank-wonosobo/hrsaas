import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable } from "react-native";

export default function BackButton() {
  const router = useRouter();
  return (
    <Pressable
      className="p-1.5 bg-primary/20 rounded-full"
      onPress={() => router.back()}
    >
      <ArrowLeft size={22} color="#3f9aae" />
    </Pressable>
  );
}
