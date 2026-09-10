import { Salary } from "@/schema/salary-schema";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

interface Props {
  salary: Salary;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (dateMs: number) =>
  new Date(dateMs).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

export default function SalaryItem({ salary }: Props) {
  const [expanded, setExpanded] = useState(false);
  const details = [...(salary.items ?? []), ...(salary.adjustments ?? [])];

  return (
    <View className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm shadow-gray-200/50">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1">
          <Text className="font-poppins-semibold text-sm text-secondary">
            Slip Gaji
          </Text>
          <View className="mt-1 flex-row items-center gap-1.5">
            <Calendar size={13} color="#9ca3af" />
            <Text className="font-poppins-regular text-xs text-gray-400">
              {formatDate(salary.created_at)}
            </Text>
          </View>
        </View>
        <View className="items-end">
          <Text className="font-poppins-regular text-[11px] text-gray-400">
            Diterima
          </Text>
          <Text className="font-poppins-semibold text-base text-primary">
            {formatCurrency(salary.net_salary)}
          </Text>
        </View>
      </View>

      <View className="mt-4 gap-2 border-t border-gray-100 pt-3">
        <View className="flex-row justify-between">
          <Text className="font-poppins-regular text-xs text-gray-500">
            Pendapatan kotor
          </Text>
          <Text className="font-poppins-medium text-xs text-gray-700">
            {formatCurrency(salary.gross_salary)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="font-poppins-regular text-xs text-gray-500">
            Total pendapatan
          </Text>
          <Text className="font-poppins-medium text-xs text-gray-700">
            {formatCurrency(salary.total_earning)}
          </Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="font-poppins-regular text-xs text-gray-500">
            Total potongan
          </Text>
          <Text className="font-poppins-medium text-xs text-red-500">
            - {formatCurrency(salary.total_deduction)}
          </Text>
        </View>
      </View>

      {details.length > 0 && (
        <>
          <Pressable
            onPress={() => setExpanded((value) => !value)}
            className="mt-3 flex-row items-center justify-center gap-1 border-t border-dashed border-gray-200 pt-3"
          >
            <Text className="font-poppins-medium text-xs text-primary">
              {expanded ? "Sembunyikan rincian" : "Lihat rincian"}
            </Text>
            {expanded ? (
              <ChevronUp size={15} color="#3f9aae" />
            ) : (
              <ChevronDown size={15} color="#3f9aae" />
            )}
          </Pressable>
          {expanded && (
            <View className="mt-2 gap-2">
              {details.map((detail) => (
                <View key={detail.id} className="flex-row justify-between gap-3">
                  <Text className="flex-1 font-poppins-regular text-xs text-gray-500">
                    {detail.name}
                  </Text>
                  <Text
                    className={`font-poppins-medium text-xs ${detail.type === "DEDUCTION" ? "text-red-500" : "text-gray-700"}`}
                  >
                    {detail.type === "DEDUCTION" ? "- " : ""}
                    {formatCurrency(detail.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </>
      )}
    </View>
  );
}
