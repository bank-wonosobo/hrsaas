import { ListTimeOffParams, listTimeOff } from "@/services/time-off/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useCurrentTimeOff(params: ListTimeOffParams) {
  return useQuery({
    queryKey: ["time-off-requests", "current", params],
    queryFn: () => listTimeOff(params),
    placeholderData: keepPreviousData,
  });
}
