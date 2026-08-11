import { formatTime } from "@/lib/utils/format-time";
import { ShifDay } from "@/schema/shift-schema";
import clsx from "clsx";
import { LogIn, LogOut } from "lucide-react-native";
import { Text, View } from "react-native";

interface Props {
  shiftDay?: ShifDay;
  attendanceType: "IN" | "OUT";
}
export default function AttendanceShift({
  shiftDay,
  attendanceType = "IN",
}: Props) {
  // Array objek untuk memisahkan data IN dan OUT secara dinamis
  const shiftTypes = [
    { label: "In", type: "IN", time: shiftDay?.check_in, Icon: LogIn },
    { label: "Out", type: "OUT", time: shiftDay?.check_out, Icon: LogOut },
  ];

  return (
    <View className="w-full flex-row gap-3 justify-center">
      {shiftTypes.map((item, index) => {
        // Ambil status apakah kartu ini merupakan tipe attendance yang aktif
        const isActive = attendanceType === item.type;
        const Icon = item.Icon;

        return (
          <View
            key={index}
            className={clsx(
              "p-4 flex-1 rounded-2xl items-center gap-2",
              // Efek shadow hanya muncul jika kartu tersebut aktif
              isActive
                ? "shadow-xl shadow-green-400/30 bg-green-400"
                : "bg-gray-100 border border-dashed border-gray-200",
            )}
          >
            {isActive ? (
              <View className="absolute top-2 right-2 bg-white/25 px-2 py-0.5 rounded-full">
                <Text className="font-poppins-semibold text-[9px] text-white">
                  SEKARANG
                </Text>
              </View>
            ) : null}

            <View
              className={clsx(
                "h-9 w-9 rounded-full items-center justify-center",
                isActive ? "bg-white/20" : "bg-white",
              )}
            >
              <Icon size={16} color={isActive ? "#fff" : "#9ca3af"} />
            </View>

            {/* Warna teks berubah menjadi abu-abu gelap jika kartu tidak aktif */}
            <Text
              className={clsx(
                "font-poppins-medium text-xs",
                isActive ? "text-white/90" : "text-gray-400",
              )}
            >
              Clock {item.label}
            </Text>

            <Text
              className={clsx(
                "font-poppins-bold text-xl",
                isActive ? "text-white" : "text-gray-700",
              )}
            >
              {item.time !== undefined ? formatTime(item.time) : "-"}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
