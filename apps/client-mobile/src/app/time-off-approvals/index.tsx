import TimeOffApprovalList from "@/features/time-off-approval/time-off-approval-list";
import { View } from "react-native";

export default function TimeOffApprovals() {
  return (
    <View className="flex-1 bg-gray-50 px-4 pt-4">
      <TimeOffApprovalList />
    </View>
  );
}
