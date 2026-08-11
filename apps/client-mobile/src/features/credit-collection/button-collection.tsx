import Button from "@/components/ui/button";
import { Text, View } from "react-native";

interface Props {
  totalTunggakan: number;
  disabled?: boolean;
  onSubmit?: () => void;
}
export default function ButtonCollection({
  totalTunggakan,
  disabled = false,
  onSubmit,
}: Props) {
  return (
    <View className="w-full bg-white border-t-[0.5px] border-gray-200 absolute left-0 bottom-0 p-5">
      <View className="flex-row mb-3 ">
        {totalTunggakan < 0 ? (
          <>
            <Text>Tagihan sudah di bayar untuk bulan selanjutnya</Text>
          </>
        ) : (
          <>
            <Text className="font-poppins-regular">Total Tunggakan: </Text>
            <Text className="font-poppins-bold">
              Rp. {totalTunggakan.toLocaleString()}
            </Text>
          </>
        )}
      </View>
      <Button disabled={disabled} variant="secondary" onPress={onSubmit}>
        Mulai Penagihan
      </Button>
    </View>
  );
}
