import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { SearchShiftRequest, Shift } from "../schemas/shift-schema";
import { getShifts } from "../services/shift-service";

export function useSearchShift(search: SearchShiftRequest) {
  const normalized = {
    key: search.key ?? "",
    page: Number(search.page),
    size: Number(search.size),
  };
  return useQuery<PaginatedData<Shift>>({
    queryKey: ["shifts", normalized.key, normalized.page, normalized.size],
    queryFn: () => getShifts(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
