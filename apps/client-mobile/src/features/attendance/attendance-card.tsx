import { useTodayAttendance } from "@/hooks/attendance/use-today-attendance";
import { formatTime } from "@/lib/utils/format-time";
import { Clock, Coffee, LogIn, LogOut } from "lucide-react-native";
import { ActivityIndicator, Text, View } from "react-native";

function formatDuration(minutes?: number) {
  if (!minutes) return "--";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours <= 0) return `${mins}m`;
  if (mins <= 0) return `${hours}j`;
  return `${hours}j ${mins}m`;
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-1 bg-white/5 rounded-2xl p-3 gap-2">
      <View className="flex-row items-center gap-1.5">
        <View className="h-6 w-6 rounded-full bg-white/10 items-center justify-center">
          {icon}
        </View>
        <Text className="font-poppins-regular text-white/60 text-[11px]">
          {label}
        </Text>
      </View>
      <Text className="font-poppins-bold text-white text-lg">{value}</Text>
    </View>
  );
}

export default function AttendanceCard() {
  const { data: attendance, isLoading } = useTodayAttendance();
  const status = !attendance
    ? "Belum Absen"
    : attendance.check_out_time
      ? "Selesai"
      : attendance.status === "TERLAMBAT"
        ? "Terlambat"
        : "Sedang Bekerja";

  return (
    <View className="bg-primary w-full rounded-3xl mb-2 overflow-hidden shadow-lg shadow-secondary/40">
      {/* Decorative background blobs */}
      <View className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/10" />
      <View className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-primary/10" />

      <View className="p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="font-poppins-semibold text-white text-sm">
            Kehadiran Hari Ini
          </Text>
          <View className="flex-row items-center gap-1.5 bg-primary/20 px-2.5 py-1 rounded-full">
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            )}
            <Text className="text-primary font-poppins-semibold text-[10px]">
              {isLoading ? "Memuat..." : status}
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-3">
          <StatTile
            icon={<LogIn size={12} color="#fff" />}
            label="Presensi Masuk"
            value={
              attendance?.check_in_time
                ? formatTime(attendance.check_in_time)
                : "--"
            }
          />
          <StatTile
            icon={<LogOut size={12} color="#fff" />}
            label="Presensi Keluar"
            value={
              attendance?.check_out_time
                ? formatTime(attendance.check_out_time)
                : "--"
            }
          />
        </View>
        <View className="flex-row gap-3">
          <StatTile
            icon={<Clock size={12} color="#fff" />}
            label="Jam Kerja"
            value={formatDuration(attendance?.total_work_minutes)}
          />
          <StatTile
            icon={<Coffee size={12} color="#fff" />}
            label="Istirahat"
            value={formatDuration(attendance?.total_break_minutes)}
          />
        </View>
      </View>
    </View>
  );
}
