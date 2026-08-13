import Button from "@/components/ui/button";
import TimeOffCard from "@/features/time-off/time-off-card";
import TimeOffList from "@/features/time-off/time-off-list";
import { useCurrentTimeOffBalance } from "@/hooks/time-off/use-current-balance";
import { useRouter } from "expo-router";
import { Plus } from "lucide-react-native";
import { View } from "react-native";

export default function TimeOff() {
  const { data: timeOffBalances, isLoading: loadingBalance } =
    useCurrentTimeOffBalance();
  const router = useRouter();

  return (
    <View className="flex-1 bg-gray-50">
      <TimeOffList
        ListHeaderComponent={
          <TimeOffCard balances={timeOffBalances} isLoading={loadingBalance} />
        }
      />
      <View className="absolute bottom-10 right-7">
        <Button
          variant="secondary"
          fullWidth={false}
          onPress={() => router.push("/time-offs/create")}
        >
          <Plus color="white" />
        </Button>
      </View>
    </View>
  );
}
