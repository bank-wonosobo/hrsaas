import SalaryList from "@/features/salary/salary-list";
import { View } from "react-native";

export default function SalaryPage() {
  return (
    <View className="flex-1 bg-gray-50">
      <SalaryList />
    </View>
  );
}
