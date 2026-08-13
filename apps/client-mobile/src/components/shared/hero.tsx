import { CalendarDays, CheckCircle2, LogIn, LogOut } from "lucide-react-native";
import { Text, View } from "react-native";

export default function Hero() {
  return (
    <View className="w-full rounded-3xl mb-2 overflow-hidden bg-primary shadow-lg shadow-primary/40">
      {/* Decorative background blobs */}
      <View className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-white/10" />
      <View className="absolute -bottom-14 -left-8 h-32 w-32 rounded-full bg-white/10" />
      <View className="absolute top-8 right-16 h-3 w-3 rounded-full bg-white/30" />

      <View className="p-5">
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white/80 font-poppins-medium text-xs">
            Presensi Anda Hari Ini
          </Text>
          <View className="flex-row items-center gap-1 bg-white/20 px-2.5 py-1 rounded-full">
            <CheckCircle2 size={12} color="#fff" />
            <Text className="text-white font-poppins-semibold text-[10px]">
              Tepat Waktu
            </Text>
          </View>
        </View>

        {/* Top */}
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
              10.00
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
              17.00
            </Text>
          </View>
        </View>

        {/* Bottom */}
        <View className="flex-row items-center gap-2 mt-4">
          <CalendarDays color="#fff" size={16} />
          <Text className="text-white/80 font-poppins-regular text-xs">
            Senin, 12 Juni 2026
          </Text>
        </View>
      </View>
    </View>
  );
}
