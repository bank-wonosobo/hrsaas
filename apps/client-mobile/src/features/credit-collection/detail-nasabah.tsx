import { CreditCustomer } from "@/schema/credit-collection-schema";
import { Text, View } from "react-native";

interface Props {
  creditCutomer: CreditCustomer;
}

export default function DetailNasabah({ creditCutomer }: Props) {
  return (
    <View className="p-5 bg-white rounded-xl">
      <Text className="font-poppins-bold pb-3 border-b border-dashed border-gray-200">
        Nasabah
      </Text>
      <View className="gap-2 mt-4 w-full ">
        <View className="flex-row justify-between p-2 rounded bg-gray-50">
          <Text className="font-poppins-semibold text-sm">ID Nasabah</Text>
          <Text className="font-poppins-bold">{creditCutomer.nasabah_id}</Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="font-poppins-light text-xs">Nama</Text>
          <Text className="font-poppins-bold text-xs">
            {creditCutomer.nasabah_name}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">Alamat</Text>
          <Text className="flex-1 max-w-30 text-right font-poppins-medium text-xs">
            {creditCutomer.address}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="font-poppins-light text-xs">Tanggal Lahir</Text>
          <Text className="font-poppins-medium text-xs">
            {creditCutomer.place_of_birth}, {creditCutomer.date_of_birth}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">
            Nomer Telepon
          </Text>
          <Text className="flex-1 max-w-30 text-right font-poppins-medium text-xs">
            {creditCutomer.phone}
          </Text>
        </View>
        <View className="flex-row justify-between px-2 py-1">
          <Text className="flex-1 font-poppins-light text-xs">Email</Text>
          <Text className="flex-1 max-w-30 text-right font-poppins-medium text-xs">
            {creditCutomer.email === "" ? "-" : creditCutomer.email}
          </Text>
        </View>
      </View>
    </View>
  );
}
