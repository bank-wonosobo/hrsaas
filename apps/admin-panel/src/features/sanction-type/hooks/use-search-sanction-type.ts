import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  SanctionType,
  SearchSanctionTypeRequest,
} from "../schemas/sanction-type-schema";
import { searchSanctionType } from "../services/search-sanction-type";

export function useSearchSanctionType(search: SearchSanctionTypeRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<SanctionType>>({
    queryKey: [
      "sanction-types",
      normalized.key,
      normalized.page,
      normalized.size,
    ],
    queryFn: async () => searchSanctionType(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
