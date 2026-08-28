import { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

export interface Props {
  title: string;
  icon: LucideIcon;
  onPress: () => void;
}

export default function MenuItem({ title, icon: Icon, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="w-full items-center flex-1 mt-7 active:scale-95 active:opacity-70"
    >
      <View className="rounded-full bg-secondary/10 p-1.5">
        <View className="items-center justify-center rounded-full bg-secondary p-4 shadow-md shadow-secondary/30">
          <Icon size={22} color="#fff" strokeWidth={2.3} />
        </View>
      </View>
      <Text className="w-full mt-2 text-center text-xs text-text font-poppins-medium px-1">
        {title}
      </Text>
    </Pressable>
  );
}
