import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { SearchVisitRequest, Visit } from "../schemas/visit-schema";
import { searchVisit } from "../services/search-visit";

export function useSearchVisit(search: SearchVisitRequest) {
  return useQuery<PaginatedData<Visit>>({
    queryKey: ["visits", search],
    queryFn: async () => searchVisit(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
