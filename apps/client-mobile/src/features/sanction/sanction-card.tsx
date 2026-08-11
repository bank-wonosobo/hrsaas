import { isSanctionActive } from "@/lib/utils/sanction";
import { EmployeeSanction } from "@/schema/sanction-schema";
import { ShieldAlert } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

interface Props {
  sanctions: EmployeeSanction[] | undefined;
  isLoading: boolean;
}

export default function SanctionCard({ sanctions, isLoading }: Props) {
  const [now] = useState(() => Date.now());
  const activeCount =
    sanctions?.filter((sanction) => isSanctionActive(sanction, now)).length ??
    0;

  return (
    <View className="w-full bg-primary rounded-3xl mb-2 overflow-hidden shadow-lg shadow-secondary/40">
      <View className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/10" />
      <View className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-primary/10" />

      <View className="p-5">
        <View className="flex-row items-center gap-3 mb-4">
          <View className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
            <ShieldAlert size={18} color="#fff" />
          </View>
          <View>
            <Text className="text-white font-poppins-semibold text-base">
              Sanksi Karyawan
            </Text>
            <Text className="text-white/60 text-xs font-poppins-light">
              Riwayat peringatan dan sanksi
            </Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
        ) : (
          <View className="bg-white/5 rounded-2xl py-3 items-center gap-1">
            <Text className="text-white text-2xl font-poppins-bold">
              {activeCount}
            </Text>
            <Text className="text-white/60 text-[11px] font-poppins-medium">
              {activeCount > 0 ? "Sanksi Aktif" : "Tidak Ada Sanksi Aktif"}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
