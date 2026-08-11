import { Animated, Text, View } from "react-native";
import { CircleAlert, CircleCheck, CircleX, Info } from "lucide-react-native";

type Props = {
  message: string;
  type: "success" | "error" | "warning" | "info";
  translateY: Animated.Value;
};

export default function Toast({ message, type, translateY }: Props) {
  const colors = {
    success: "#16a34a",
    error: "#dc2626",
    warning: "#f59e0b",
    info: "#2563eb",
  };

  const Icon = {
    success: CircleCheck,
    error: CircleX,
    warning: CircleAlert,
    info: Info,
  }[type];

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
      }}
      className="absolute top-0 left-5 right-5 z-50"
    >
      <View
        style={{
          backgroundColor: colors[type],
        }}
        className="rounded-2xl px-4 py-4 flex-row items-center shadow-lg"
      >
        <Icon color="white" size={22} />

        <Text className="text-white ml-3 flex-1 font-medium">{message}</Text>
      </View>
    </Animated.View>
  );
}
