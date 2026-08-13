import { SearchCreditCustomer } from "@/schema/credit-collection-schema";
import { searchCredit } from "@/services/credit-collection/search-credit";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useSearchCredit() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (search: SearchCreditCustomer) => {
      const normalized = {
        cif: search.cif ?? "",
        nama: search.nama ?? "",
        nik: search.nik ?? "",
        nopjm: search.nopjm ?? "",
      };

      const result = await searchCredit(search);
      queryClient.invalidateQueries({
        queryKey: [
          "credit-customers",
          normalized.cif,
          normalized.nama,
          normalized.nopjm,
        ],
      });

      return result;
    },
    onError(err) {
      console.log(err.message, "error");
    },
  });
}
