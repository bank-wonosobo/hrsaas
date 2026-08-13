import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Division, SearchDivisionRequest } from "../schemas/division-schema";
import { searchDivision } from "../services/search-division";

export function useSearchDivision(search: SearchDivisionRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<Division>>({
    queryKey: ["divisions", normalized.key, normalized.page, normalized.size],
    queryFn: async () => searchDivision(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
