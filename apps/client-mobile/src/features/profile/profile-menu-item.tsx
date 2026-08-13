import clsx from "clsx";
import { ChevronRight, LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface Props {
  icon: LucideIcon;
  label: string;
  iconColor?: string;
  labelClassName?: string;
  onPress?: () => void;
}

export default function ProfileMenuItem({
  icon: Icon,
  label,
  iconColor = "#3f9aae",
  labelClassName,
  onPress,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 py-3.5 active:opacity-70"
    >
      <View className="h-9 w-9 rounded-full bg-primary/10 items-center justify-center">
        <Icon size={18} color={iconColor} />
      </View>
      <Text
        className={clsx(
          "flex-1 font-poppins-medium text-sm text-text",
          labelClassName,
        )}
      >
        {label}
      </Text>
      <ChevronRight size={18} color="#d1d5db" />
    </Pressable>
  );
}
