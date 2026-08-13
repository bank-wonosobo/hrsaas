import AttendanceButton from "@/features/attendance/attendance-button";
import AttendanceCard from "@/features/attendance/attendance-card";
import AttendaceList from "@/features/attendance/attendance-list";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function Attendances() {
  const router = useRouter();
  return (
    <View className="flex-1 bg-gray-50">
      <AttendaceList
        ListHeaderComponent={
          <>
            <View className="items-center h-60 justify-center">
              <AttendanceButton
                onPress={() => router.push("/attendances/area")}
              />
            </View>
            <AttendanceCard />
          </>
        }
      />
    </View>
  );
}
