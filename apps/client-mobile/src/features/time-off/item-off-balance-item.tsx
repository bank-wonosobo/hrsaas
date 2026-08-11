import ProgressBar from "@/components/ui/progres-bar";
import { TimeOffBalance } from "@/schema/time-off-schema";
import { Text, View } from "react-native";

interface Props {
  balance: TimeOffBalance;
}

export default function TimeOffBalanceItem({ balance }: Props) {
  return (
    <View className="gap-2 py-2 border-b border-gray-200">
      <View className="flex-row gap-3 justify-between">
        <View className="flex-row gap-2 items-center">
          <View className="p-1 px-2 bg-primary/70 rounded-xl">
            <Text className="text-xs font-poppins-medium text-white">
              {balance.time_off_type.category}
            </Text>
          </View>
          <Text className="font-poppins-regular text-xs">
            {balance.time_off_type.name}
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Text className="font-poppins-semibold text-green-700">
            {balance.remaining_days}
          </Text>
          <Text className="font-poppins-medium text-xs">hari tersisa</Text>
        </View>
      </View>
      <ProgressBar
        showLabel={false}
        progress={(balance.remaining_days / balance.entitled_days) * 100}
      />
      <View className="flex-row gap-4">
        <View className="flex-row gap-2">
          <Text className="font-poppins-semibold text-xs">Hak :</Text>
          <Text className="text-xs">{balance.entitled_days} hari</Text>
        </View>
        <View className="flex-row gap-2">
          <Text className="font-poppins-semibold text-xs">Terpakai :</Text>
          <Text className="text-xs">{balance.used_days} hari</Text>
        </View>
      </View>
    </View>
  );
}
