import { Text, View } from "react-native";

export default function AttendanceAlert() {
  return (
    <View className="bg-primary p-5 w-full shadow-md rounded-2xl">
      <Text className="font-poppins-medium text-white text-md">
        Kamu berada di dalam jangkauan.
      </Text>
      <Text className="font-poppins-light text-white text-[11px]">
        Now you can press clock in in this area
      </Text>
    </View>
  );
}
