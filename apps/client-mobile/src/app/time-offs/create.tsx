import FormTimeOff from "@/features/time-off/form-time-off";
import { ScrollView } from "react-native";

export default function CreateTimeOff() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      keyboardShouldPersistTaps="handled"
    >
      <FormTimeOff />
    </ScrollView>
  );
}
