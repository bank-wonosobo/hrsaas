import { ListSanctionParams, listSanctions } from "@/services/sanction/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useSanctions(params: ListSanctionParams) {
  return useQuery({
    queryKey: ["employee-sanctions", "current", params],
    queryFn: () => listSanctions(params),
    placeholderData: keepPreviousData,
  });
}
