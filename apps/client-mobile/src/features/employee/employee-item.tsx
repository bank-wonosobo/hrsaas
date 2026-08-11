import { getEmployeePosition, toWhatsAppNumber } from "@/lib/utils/employee";
import { Employee } from "@/features/employee/employee-schema";
import { Mail, MessageCircle, Phone } from "lucide-react-native";
import { Linking, Pressable, Text, View } from "react-native";

interface Props {
  employee: Employee;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function EmployeeItem({ employee }: Props) {
  const position = getEmployeePosition(employee);
  const email = employee.user?.email;

  return (
    <View className="bg-white rounded-2xl p-4 flex-row items-center gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Text className="font-poppins-bold text-primary text-sm">
          {getInitials(employee.fullname)}
        </Text>
      </View>

      <View className="flex-1">
        <Text
          numberOfLines={1}
          className="font-poppins-semibold text-secondary text-sm"
        >
          {employee.fullname}
        </Text>
        <Text
          numberOfLines={1}
          className="font-poppins-regular text-xs text-gray-400 mt-0.5"
        >
          {position ?? "-"}
        </Text>
      </View>

      <View className="flex-row items-center gap-2">
        {!!employee.phone && (
          <>
            <Pressable
              onPress={() => Linking.openURL(`tel:${employee.phone}`)}
              className="h-9 w-9 items-center justify-center rounded-full bg-primary/10 active:opacity-70"
            >
              <Phone size={15} color="#3f9aae" />
            </Pressable>
            <Pressable
              onPress={() =>
                Linking.openURL(
                  `https://wa.me/${toWhatsAppNumber(employee.phone)}`,
                )
              }
              className="h-9 w-9 items-center justify-center rounded-full bg-emerald-50 active:opacity-70"
            >
              <MessageCircle size={15} color="#059669" />
            </Pressable>
          </>
        )}
        {!!email && (
          <Pressable
            onPress={() => Linking.openURL(`mailto:${email}`)}
            className="h-9 w-9 items-center justify-center rounded-full bg-amber-50 active:opacity-70"
          >
            <Mail size={15} color="#d97706" />
          </Pressable>
        )}
      </View>
    </View>
  );
}
