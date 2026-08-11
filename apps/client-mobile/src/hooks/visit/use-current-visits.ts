import { ListVisitParams, listVisits } from "@/services/visit/list";
import { useQuery } from "@tanstack/react-query";

export function useCurrentVisits(params: ListVisitParams) {
  return useQuery({
    queryKey: ["visits", "current", params],
    queryFn: () => listVisits(params),
  });
}
