import {
  ListCreditCollectionParams,
  listCreditCollection,
} from "@/services/credit-collection/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useCreditCollectionList(params: ListCreditCollectionParams) {
  return useQuery({
    queryKey: ["credit-collection-visits", params],
    queryFn: () => listCreditCollection(params),
    placeholderData: keepPreviousData,
  });
}
