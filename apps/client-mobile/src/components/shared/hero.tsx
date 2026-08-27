import Button from "@/components/ui/button";
import { useTodayAttendance } from "@/hooks/attendance/use-today-attendance";
import { formatTime } from "@/lib/utils/format-time";
import { Attendance } from "@/schema/attendance-schema";
import { useRouter } from "expo-router";
import { CalendarDays, CheckCircle2, LogIn, LogOut } from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";

function formatAttendanceDate(dateMs?: number) {
  return new Date(dateMs ?? Date.now()).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function getStatus(attendance: Attendance | null) {
  if (!attendance) return { label: "Belum Absen", iconColor: "#fff" };

  return attendance.status === "TERLAMBAT"
    ? { label: "Terlambat", iconColor: "#fef08a" }
    : {
        label:
          attendance.status === "HADIR" ? "Tepat Waktu" : attendance.status,
        iconColor: "#fff",
      };
}

export default function Hero() {
  const { data: attendance, isLoading } = useTodayAttendance();
  const status = getStatus(attendance ?? null);
  const router = useRouter();
  const attendanceType = attendance?.check_in_time
    ? attendance.check_out_time
      ? null
      : "check-out"
    : "check-in";
  const breakInCount =
    attendance?.logs?.filter((log) => log.type === "BREAK_IN").length ?? 0;
  const breakOutCount =
    attendance?.logs?.filter((log) => log.type === "BREAK_OUT").length ?? 0;
  const breakAttendanceType =
    attendanceType === "check-out"
      ? breakInCount > breakOutCount
        ? "break-out"
        : "break-in"
      : null;

  return (
    <View className="w-full rounded-3xl mb-2 overflow-hidden bg-primary shadow-lg shadow-primary/40">
      <View className="p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white/80 font-poppins-medium text-xs">
            Presensi Anda Hari Ini
          </Text>
          <View className="flex-row items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full">
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <CheckCircle2 size={12} color={status.iconColor} />
            )}
            <Text className="text-white font-poppins-semibold text-[10px]">
              {isLoading ? "Memuat..." : status.label}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center bg-white/10 rounded-2xl p-4">
          <View className="flex-1 gap-2">
            <View className="flex-row items-center gap-1.5">
              <View className="h-6 w-6 rounded-full bg-white/20 items-center justify-center">
                <LogIn size={12} color="#fff" />
              </View>
              <Text className="text-white/70 font-poppins-regular text-[11px]">
                Check-in
              </Text>
            </View>
            <Text className="text-white font-poppins-bold text-2xl">
              {attendance?.check_in_time
                ? formatTime(attendance.check_in_time)
                : "--"}
            </Text>
          </View>

          <View className="h-12 w-px bg-white/20 mx-3" />

          <View className="flex-1 gap-2 items-end">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-white/70 font-poppins-regular text-[11px]">
                Check-out
              </Text>
              <View className="h-6 w-6 rounded-full bg-white/20 items-center justify-center">
                <LogOut size={12} color="#fff" />
              </View>
            </View>
            <Text className="text-white font-poppins-bold text-2xl">
              {attendance?.check_out_time
                ? formatTime(attendance.check_out_time)
                : "--"}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2 mt-4">
          <CalendarDays color="#fff" size={16} />
          <Text className="text-white/80 font-poppins-regular text-xs">
            {formatAttendanceDate(attendance?.date)}
          </Text>
        </View>

        {attendanceType && (
          <View className="mt-4 gap-2">
            <Button
              variant="outline"
              className="bg-white"
              disabled={isLoading}
              onPress={() =>
                router.push({
                  pathname: "/attendances/area",
                  params: { type: attendanceType },
                })
              }
            >
              {attendanceType === "check-in" ? "Check-in" : "Check-out"}
            </Button>

            {breakAttendanceType && (
              <Button
                variant="secondary"
                disabled={isLoading}
                onPress={() =>
                  router.push({
                    pathname: "/attendances/area",
                    params: { type: breakAttendanceType },
                  })
                }
              >
                {breakAttendanceType === "break-in"
                  ? "Break-in"
                  : "Break-out"}
              </Button>
            )}
          </View>
        )}
      </View>
    </View>
  );
}
