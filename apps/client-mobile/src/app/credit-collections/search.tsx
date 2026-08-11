import ButtonCollection from "@/features/credit-collection/button-collection";
import DetailCredit from "@/features/credit-collection/detail-credit";
import DetailNasabah from "@/features/credit-collection/detail-nasabah";
import SearchCredit from "@/features/credit-collection/search-credit";
import { useSearchCredit } from "@/hooks/credit-collection/search-credit";
import { CreditCustomer } from "@/schema/credit-collection-schema";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

export default function CreditCollectionPage() {
  const router = useRouter();
  const [creditCustomerSelected, setCreditCustomerSelected] = useState<
    CreditCustomer | undefined
  >();
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>([]);

  const mutateSearchCredit = useSearchCredit();

  const handleSearch = async (param: string, key: string) => {
    const searchCreditCustomer = {
      kodecabang: "01",
      cif: "",
      nama: "",
      nik: "",
      nopjm: "",
      [param]: key,
    };

    const result = await mutateSearchCredit.mutateAsync(searchCreditCustomer);

    setCreditCustomers(result ?? []);
  };

  const handleSelect = (creditCustomer: CreditCustomer) => {
    setCreditCustomerSelected(creditCustomer);
    setCreditCustomers([]);
  };

  return (
    <View className="flex-1 pt-4 bg-gray-50">
      <SearchCredit
        isLoading={mutateSearchCredit.isPending}
        onSearch={handleSearch}
        creditCustomer={creditCustomers}
        onSelect={handleSelect}
      />
      <View className="px-4 mt-35">
        {creditCustomerSelected && (
          <ScrollView className="pt-5">
            <DetailNasabah creditCutomer={creditCustomerSelected} />
            <DetailCredit creditCutomer={creditCustomerSelected} />
          </ScrollView>
        )}
      </View>
      <ButtonCollection
        disabled={!creditCustomerSelected}
        totalTunggakan={creditCustomerSelected?.overdue_total ?? 0}
        onSubmit={() =>
          router.push({
            pathname: "/credit-collections/collection",
            params: {
              customerCredit: JSON.stringify(creditCustomerSelected),
            },
          })
        }
      />
    </View>
  );
}
