import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  CreditCollection,
  SearchCreditCollectionRequest,
} from "../schemas/credit-collection-schema";
import { searchCreditCollection } from "../services/search-credit-collection";

export function useSearchCreditCollection(
  search: SearchCreditCollectionRequest,
) {
  return useQuery<PaginatedData<CreditCollection>>({
    queryKey: ["credit-collections-admin", search],
    queryFn: () => searchCreditCollection(search),
    retry: 2,
    placeholderData: (previousData) => previousData,
  });
}
