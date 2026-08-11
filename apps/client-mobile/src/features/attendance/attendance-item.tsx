import Badge from "@/components/ui/badge";
import { formatTime } from "@/lib/utils/format-time";
import { Attendance } from "@/schema/attendance-schema";
import {
  AlarmClock,
  CalendarCheck,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  attendance: Attendance;
}

type BadgeVariant = "success" | "warning" | "danger" | "default";

const STATUS_STYLE: Record<string, { label: string; badge: BadgeVariant }> = {
  HADIR: { label: "Tepat Waktu", badge: "success" },
  TERLAMBAT: { label: "Terlambat", badge: "warning" },
};

function formatDuration(minutes: number) {
  if (!minutes) return "--";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins}m`;
  if (mins <= 0) return `${hours}j`;
  return `${hours}j ${mins}m`;
}

function formatAttendanceDate(dateMs: number) {
  return new Date(dateMs).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function AttendanceItem({ attendance }: Props) {
  const status = STATUS_STYLE[attendance.status] ?? {
    label: attendance.status,
    badge: "default" as const,
  };

  return (
    <View className="bg-white rounded-2xl p-4 gap-3 border border-gray-100 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-2 flex-1 pr-2">
          <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center">
            <CalendarCheck size={16} color="#3f9aae" />
          </View>
          <Text
            numberOfLines={1}
            className="font-poppins-semibold text-secondary text-xs flex-1"
          >
            {formatAttendanceDate(attendance.date)}
          </Text>
        </View>
        <Badge variant={status.badge}>{status.label}</Badge>
      </View>

      <View className="flex-row justify-between border-t border-dashed border-gray-200 pt-3">
        <View className="items-start gap-1.5">
          <View className="flex-row items-center gap-1">
            <LogIn size={12} color="#9ca3af" />
            <Text className="font-poppins-regular text-[10px] text-gray-400">
              Clock-in
            </Text>
          </View>
          <Text className="font-poppins-bold text-text text-base">
            {attendance.check_in_time ? formatTime(attendance.check_in_time) : "--"}
          </Text>
        </View>

        <View className="items-start gap-1.5">
          <View className="flex-row items-center gap-1">
            <LogOut size={12} color="#9ca3af" />
            <Text className="font-poppins-regular text-[10px] text-gray-400">
              Clock-out
            </Text>
          </View>
          <Text className="font-poppins-bold text-text text-base">
            {attendance.check_out_time
              ? formatTime(attendance.check_out_time)
              : "--"}
          </Text>
        </View>

        <View className="items-start gap-1.5">
          <View className="flex-row items-center gap-1">
            <AlarmClock size={12} color="#9ca3af" />
            <Text className="font-poppins-regular text-[10px] text-gray-400">
              Jam Kerja
            </Text>
          </View>
          <Text className="font-poppins-bold text-text text-base">
            {formatDuration(attendance.total_work_minutes)}
          </Text>
        </View>

        <View className="items-start gap-1.5">
          <View className="flex-row items-center gap-1">
            <Timer size={12} color="#9ca3af" />
            <Text className="font-poppins-regular text-[10px] text-gray-400">
              Istirahat
            </Text>
          </View>
          <Text className="font-poppins-bold text-text text-base">
            {formatDuration(attendance.total_break_minutes)}
          </Text>
        </View>
      </View>
    </View>
  );
}
