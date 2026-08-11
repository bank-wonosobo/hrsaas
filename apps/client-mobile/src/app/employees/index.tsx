import EmployeeList from "@/features/employee/employee-list";
import { View } from "react-native";

export default function EmployeesPage() {
  return (
    <View className="flex-1 bg-gray-50">
      <EmployeeList />
    </View>
  );
}
