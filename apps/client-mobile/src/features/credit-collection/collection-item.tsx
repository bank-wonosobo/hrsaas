import { CreditCollectionVisitRecord } from "@/schema/credit-collection-schema";
import clsx from "clsx";
import {
  CalendarDays,
  ChevronRight,
  MapPin,
  MessageSquareText,
  User,
  Wallet,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

interface Props {
  creditCustomer: CreditCollectionVisitRecord;
  onPress?: () => void;
}

export const COLLECTIBILITY_STYLE: Record<
  string,
  { label: string; badge: string; text: string }
> = {
  "1": { label: "Lancar", badge: "bg-green-100", text: "text-green-700" },
  "2": { label: "DPK", badge: "bg-yellow-100", text: "text-yellow-700" },
  "3": {
    label: "Kurang Lancar",
    badge: "bg-orange-100",
    text: "text-orange-700",
  },
  "4": { label: "Diragukan", badge: "bg-red-100", text: "text-red-700" },
  "5": { label: "Macet", badge: "bg-rose-100", text: "text-rose-700" },
};

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function formatVisitDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CollectionItem({ creditCustomer, onPress }: Props) {
  const { pinjaman } = creditCustomer;
  const collectibility = COLLECTIBILITY_STYLE[pinjaman.collectibility] ?? {
    label: pinjaman.collectibility,
    badge: "bg-gray-100",
    text: "text-gray-600",
  };
  const isOverdue = pinjaman.overdue_total > 0;

  return (
    <Pressable
      onPress={onPress}
      className="bg-white rounded-2xl p-4 mb-3 border border-gray-100 shadow-sm shadow-gray-200/50 active:scale-[98%] active:bg-gray-50"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1 pr-2">
          <View className="h-11 w-11 rounded-full bg-primary/10 items-center justify-center">
            <Text className="font-poppins-bold text-primary text-sm">
              {getInitials(pinjaman.nasabah_name)}
            </Text>
          </View>
          <View className="flex-1">
            <Text
              numberOfLines={1}
              className="font-poppins-bold text-sm text-secondary"
            >
              {pinjaman.nasabah_name}
            </Text>
            <Text className="font-poppins-regular text-xs text-gray-400">
              {pinjaman.no_pjm}
            </Text>
          </View>
        </View>
        <View className={clsx("px-2 py-1 rounded-full", collectibility.badge)}>
          <Text
            className={clsx(
              "font-poppins-semibold text-[10px]",
              collectibility.text,
            )}
          >
            {collectibility.label}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-1 mt-3">
        <MapPin size={12} color="#9ca3af" />
        <Text
          numberOfLines={1}
          className="font-poppins-regular text-xs text-gray-400 flex-1"
        >
          {pinjaman.address}
        </Text>
      </View>

      <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-dashed border-gray-200">
        <View>
          <Text className="font-poppins-regular text-[10px] text-gray-400">
            Total Tunggakan
          </Text>
          <Text
            className={clsx(
              "font-poppins-bold text-sm",
              isOverdue ? "text-red-500" : "text-green-600",
            )}
          >
            Rp {pinjaman.overdue_total.toLocaleString("id-ID")}
          </Text>
        </View>
        <View className="h-8 w-8 rounded-full bg-gray-50 items-center justify-center">
          <ChevronRight size={16} color="#3f9aae" />
        </View>
      </View>

      <View className="mt-3 pt-3 border-t border-dashed border-gray-200 gap-1.5">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <Wallet size={12} color="#9ca3af" />
            <Text className="font-poppins-regular text-[11px] text-gray-400">
              Setoran Kunjungan
            </Text>
          </View>
          <Text className="font-poppins-semibold text-xs text-secondary">
            Rp {creditCustomer.total_paid.toLocaleString("id-ID")}
          </Text>
        </View>

        {creditCustomer.commitment ? (
          <View className="flex-row items-start gap-1">
            <MessageSquareText size={12} color="#9ca3af" style={{ marginTop: 1 }} />
            <Text
              numberOfLines={2}
              className="font-poppins-regular text-[11px] text-gray-400 flex-1"
            >
              {creditCustomer.commitment}
            </Text>
          </View>
        ) : null}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-1">
            <CalendarDays size={12} color="#9ca3af" />
            <Text className="font-poppins-regular text-[11px] text-gray-400">
              {formatVisitDate(creditCustomer.created_at)}
            </Text>
          </View>
          {creditCustomer.employee_name ? (
            <View className="flex-row items-center gap-1">
              <User size={12} color="#9ca3af" />
              <Text
                numberOfLines={1}
                className="font-poppins-regular text-[11px] text-gray-400"
              >
                {creditCustomer.employee_name}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}
