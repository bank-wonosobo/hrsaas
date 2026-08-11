import { ResponseDataArr } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import { SearchTimeOffBalance, TimeOffBalance } from "../schemas/time-off-balance-schema";
import { getTimeOffBalances } from "../services/time-off-balance-service";

export function useGetTimeOffBalances(search: SearchTimeOffBalance) {
  return useQuery<ResponseDataArr<TimeOffBalance>>({
    queryKey: ["time-off-balances", search],
    queryFn: () => getTimeOffBalances(search),
    enabled: !!search.employee_id,
    placeholderData: (prev) => prev,
  });
}
