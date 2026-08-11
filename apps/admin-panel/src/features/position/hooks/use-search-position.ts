import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { Position, SearchPositionRequest } from "../schemas/position-schema";
import { searchPosition } from "../services/search-position";

export function useSearchPosition(search: SearchPositionRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<Position>>({
    queryKey: ["positions", normalized.key, normalized.page, normalized.size],
    queryFn: async () => searchPosition(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
