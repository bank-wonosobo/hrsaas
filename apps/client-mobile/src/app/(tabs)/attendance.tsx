import AttendanceCard from "@/features/attendance/attendance-card";
import AttendaceList from "@/features/attendance/attendance-list";
import { View } from "react-native";

export default function Attendances() {
  return (
    <View className="flex-1 bg-gray-50">
      <AttendaceList ListHeaderComponent={<AttendanceCard />} />
    </View>
  );
}
