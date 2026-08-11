import { CreditCustomer } from "@/schema/credit-collection-schema";
import { Text, View } from "react-native";

interface Props {
  creditCutomer: CreditCustomer;
}

export default function DetailCredit({ creditCutomer }: Props) {
  return (
    <View className="p-5 bg-white rounded-xl mt-4 mb-52">
      <Text className="font-poppins-bold pb-3 border-b border-dashed border-gray-200">
        Pinjaman
      </Text>
      <View className="gap-2 mt-4 w-full border-b border-dashed pb-4 border-gray-200">
        <View className="flex-row justify-between p-2 rounded bg-gray-50 ">
          <Text className="font-poppins-semibold text-sm">Nomer Pinjaman</Text>
          <Text className="font-poppins-bold">{creditCutomer.no_pjm}</Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="font-poppins-light text-xs">Unit</Text>
          <Text className="font-poppins-medium text-xs">
            {creditCutomer.unit}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="font-poppins-light text-xs">Kolektabilitas</Text>
          <Text className="font-poppins-medium text-xs">
            {creditCutomer.collectibility}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">
            Jenis Pinjaman
          </Text>
          <Text className="flex-1 max-w-30 text-right font-poppins-medium text-xs">
            {creditCutomer.loan_type}
          </Text>
        </View>
      </View>
      <View className="gap-2 mt-4 w-full border-b border-dashed pb-4 border-gray-200">
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">Plafond</Text>
          <Text className="flex-1 max-w-30 text-right font-poppins-medium text-xs">
            Rp. {creditCutomer.loan_limit.toLocaleString()}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">
            Sisa Pinjaman
          </Text>
          <Text className="flex-1 max-w-30 text-right font-poppins-medium text-xs">
            Rp. {creditCutomer.outstanding_balance.toLocaleString()}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">
            Tunggakan Pokok
          </Text>
          <View className="flex-row flex-1 justify-end items-end">
            <Text className="max-w-30 text-right font-poppins-medium text-xs">
              Rp. {creditCutomer.overdue_principal.toLocaleString()}{" "}
            </Text>
            <Text className="max-w-30 text-right font-poppins-light text-gray-400 text-[10px]">
              / {creditCutomer.overdue_principal_days} hari
            </Text>
          </View>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">
            Tunggakan Bunga
          </Text>
          <View className="flex-row flex-1 justify-end items-end">
            <Text className="max-w-30 text-right font-poppins-medium text-xs">
              Rp. {creditCutomer.overdue_interest.toLocaleString()}{" "}
            </Text>
            <Text className="max-w-30 text-right font-poppins-light text-gray-400 text-[10px]">
              / {creditCutomer.overdue_interest_days} hari
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
