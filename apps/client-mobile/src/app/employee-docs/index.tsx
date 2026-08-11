import EmployeeDocList from "@/features/employee-docs/employee-doc-list";
import { ScrollView, View } from "react-native";

export default function EmployeeDocsPage() {
  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1" contentContainerClassName="p-4 pb-24">
        <EmployeeDocList />
      </ScrollView>
    </View>
  );
}
