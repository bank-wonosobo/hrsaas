import { CircleArrowDown } from "lucide-react-native";
import { Pressable, Text } from "react-native";

interface Props {
  onPress: () => void;
}

export default function AttendanceButton({ onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-40 h-40 bg-primary shadow-lg shadow-primary/50 active:scale-95 rounded-full flex items-center justify-center"
    >
      <CircleArrowDown size={40} color="white" />
      <Text className="font-poppins-medium text-lg text-white">Masuk</Text>
    </Pressable>
  );
}
