import { Avatar } from "@/components/ui/avatar";
import { User } from "@/schema/user-schema";
import { CalendarDays } from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  user?: User;
}

export default function AttendanceProfile({ user }: Props) {
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <View className="p-4 gap-4 flex-row items-center bg-white border border-gray-100 rounded-2xl shadow-sm shadow-gray-200/50">
      <View className="rounded-full border-2 border-primary/20 p-0.5">
        <Avatar src={user?.image_url} name={user?.name} size={52} />
      </View>
      <View className="flex-1 gap-1">
        <Text className="font-poppins-semibold text-base text-secondary">
          {user?.name}
        </Text>
        {user?.roles?.[0]?.name ? (
          <View className="self-start bg-primary/10 px-2 py-0.5 rounded-full">
            <Text className="font-poppins-medium text-[11px] text-primary">
              {user.roles[0].name}
            </Text>
          </View>
        ) : null}
        <View className="flex-row items-center gap-1 mt-0.5">
          <CalendarDays size={12} color="#9ca3af" />
          <Text className="font-poppins-regular text-xs text-gray-400">
            {today}
          </Text>
        </View>
      </View>
    </View>
  );
}
