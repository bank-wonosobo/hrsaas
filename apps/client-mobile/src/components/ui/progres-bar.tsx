import { Text, View } from "react-native";

type ProgressBarProps = {
  progress: number; // 0 - 100
  showLabel?: boolean;
};

export default function ProgressBar({
  progress,
  showLabel = true,
}: ProgressBarProps) {
  const value = Math.min(100, Math.max(0, progress));

  return (
    <View className="w-full">
      {showLabel && (
        <View className="mb-2 flex-row justify-between">
          <Text className="text-sm font-medium text-gray-700">Progress</Text>
          <Text className="text-sm font-semibold text-primary">{value}%</Text>
        </View>
      )}

      <View className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${value}%` }}
        />
      </View>
    </View>
  );
}
