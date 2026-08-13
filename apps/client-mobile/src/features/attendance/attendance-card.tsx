import { Clock, Coffee, LogIn, LogOut } from "lucide-react-native";
import { Text, View } from "react-native";

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
            <View className="h-1.5 w-1.5 rounded-full bg-primary" />
            <Text className="text-primary font-poppins-semibold text-[10px]">
              Sedang Bekerja
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 mb-3">
          <StatTile
            icon={<LogIn size={12} color="#fff" />}
            label="Clock-in"
            value="07.19"
          />
          <StatTile
            icon={<LogOut size={12} color="#fff" />}
            label="Clock-out"
            value="--"
          />
        </View>
        <View className="flex-row gap-3">
          <StatTile
            icon={<Clock size={12} color="#fff" />}
            label="Jam Kerja"
            value="--"
          />
          <StatTile
            icon={<Coffee size={12} color="#fff" />}
            label="Istirahat"
            value="--"
          />
        </View>
      </View>
    </View>
  );
}
