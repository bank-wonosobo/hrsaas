import AppModal from "@/components/ui/modal";
import { TimeOffBalance } from "@/schema/time-off-schema";
import { CalendarRange, ChevronRight, Inbox } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import TimeOffBalanceItem from "./item-off-balance-item";

interface Props {
  balances: TimeOffBalance[] | undefined;
  isLoading: boolean;
}

function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 bg-white/5 rounded-2xl py-3 items-center gap-1">
      <Text className="text-white text-2xl font-poppins-bold">{value}</Text>
      <Text className="text-white/60 text-[11px] font-poppins-medium">
        {label}
      </Text>
    </View>
  );
}

export default function TimeOffCard({ balances, isLoading }: Props) {
  const totalRemaining =
    balances?.reduce((sum, b) => sum + b.remaining_days, 0) ?? 0;
  const totalEntitled =
    balances?.reduce((sum, b) => sum + b.entitled_days, 0) ?? 0;
  const totalUsed = balances?.reduce((sum, b) => sum + b.used_days, 0) ?? 0;
  const usedPercent =
    totalEntitled > 0
      ? Math.min(100, Math.round((totalUsed / totalEntitled) * 100))
      : 0;
  const [open, setOpen] = useState(false);

  return (
    <>
      <View className="w-full bg-primary rounded-3xl mb-2 overflow-hidden shadow-lg shadow-secondary/40">
        {/* Decorative background blobs */}
        <View className="absolute -top-12 -right-10 h-40 w-40 rounded-full bg-primary/10" />
        <View className="absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-primary/10" />

        <View className="p-5">
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-3">
              <View className="h-10 w-10 rounded-full bg-white/10 items-center justify-center">
                <CalendarRange size={18} color="#fff" />
              </View>
              <View>
                <Text className="text-white font-poppins-semibold text-base">
                  Saldo Cuti
                </Text>
                <Text className="text-white/60 text-xs font-poppins-light">
                  Periode {new Date().getFullYear()}
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => setOpen(!open)}
              className="bg-white/10 p-2 rounded-2xl active:bg-white/20"
            >
              <ChevronRight color="#fff" size={20} />
            </Pressable>
          </View>

          {isLoading ? (
            <ActivityIndicator color="#fff" style={{ marginTop: 8 }} />
          ) : (
            <>
              <View className="flex-row gap-3">
                <StatTile value={totalEntitled} label="Total Hak" />
                <StatTile value={totalUsed} label="Dipakai" />
                <StatTile value={totalRemaining} label="Tersisa" />
              </View>

              <View className="mt-4 gap-1.5">
                <View className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                  <View
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${usedPercent}%` }}
                  />
                </View>
                <Text className="text-white/50 text-[10px] font-poppins-regular">
                  {usedPercent}% cuti telah digunakan
                </Text>
              </View>
            </>
          )}

          <Pressable
            onPress={() => setOpen(!open)}
            className="flex-row items-center justify-center gap-1 mt-4"
          >
            <Text className="text-white/70 text-xs font-poppins-light">
              {balances?.length} jenis cuti, klik untuk detail cuti
            </Text>
            <ChevronRight color="#fff" size={12} />
          </Pressable>
        </View>
      </View>
      <AppModal
        title="Saldo Cuti"
        visible={open}
        animationType="fade"
        onClose={() => setOpen(!open)}
      >
        {balances?.length === 0 ? (
          <View
            style={{ flex: 1 }}
            className="items-center justify-center gap-2"
          >
            <Inbox size={32} color="#eee" />
            <Text className="font-poppins-regular text-xs text-gray-300 text-center">
              Tidak ada data saldo cuti, silahkan menghubungi admin untuk
              mendapatkan saldo cuti
            </Text>
          </View>
        ) : (
          balances?.map((item) => (
            <TimeOffBalanceItem key={item.id} balance={item} />
          ))
        )}
      </AppModal>
    </>
  );
}
