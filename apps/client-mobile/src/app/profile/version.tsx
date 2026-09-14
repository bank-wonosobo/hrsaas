import { CheckCircle2, Info, LucideIcon, Package } from "lucide-react-native";
import Constants from "expo-constants";
import { ScrollView, Text, View } from "react-native";

const appName = Constants.expoConfig?.name ?? "BW Akses+";
const appVersion = Constants.expoConfig?.version ?? "-";

export default function VersionPage() {
  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      contentContainerClassName="p-4 pb-10"
    >
      <View className="bg-white rounded-3xl p-5 mb-4 border border-gray-100 shadow-sm shadow-black/5">
        <View className="flex-row items-center gap-4 mb-6">
          <View className="h-14 w-14 rounded-2xl bg-primary/10 items-center justify-center">
            <Info size={28} color="#3f9aae" />
          </View>
          <View>
            <Text className="text-primary font-poppins-medium text-xs">
              Informasi aplikasi
            </Text>
            <Text className="text-text font-poppins-semibold text-xl mt-1">
              Versi aplikasi
            </Text>
          </View>
        </View>

        <View className="rounded-2xl border border-gray-100 overflow-hidden">
          <InfoRow icon={Package} label="Nama aplikasi" value={appName} />
          <View className="h-px bg-gray-100" />
          <InfoRow icon={Info} label="Versi" value={`v${appVersion}`} badge />
          <View className="h-px bg-gray-100" />
          <InfoRow
            icon={CheckCircle2}
            iconColor="#10b981"
            label="Status"
            value="Aktif"
            valueClassName="text-emerald-600"
          />
        </View>
      </View>

      <Text className="text-center text-gray-400 font-poppins-regular text-xs leading-5 px-6">
        Gunakan informasi ini saat melaporkan kendala atau meminta bantuan teknis.
      </Text>
    </ScrollView>
  );
}

function InfoRow({
  icon: Icon,
  iconColor = "#9ca3af",
  label,
  value,
  badge = false,
  valueClassName = "text-text",
}: {
  icon: LucideIcon;
  iconColor?: string;
  label: string;
  value: string;
  badge?: boolean;
  valueClassName?: string;
}) {
  return (
    <View className="flex-row items-center justify-between gap-4 p-4">
      <View className="flex-row items-center gap-3">
        <Icon size={18} color={iconColor} />
        <Text className="text-gray-500 font-poppins-regular text-xs">{label}</Text>
      </View>
      <Text
        className={`${badge ? "bg-primary/10 px-3 py-1 rounded-full " : ""}font-poppins-medium text-xs ${valueClassName}`}
      >
        {value}
      </Text>
    </View>
  );
}
