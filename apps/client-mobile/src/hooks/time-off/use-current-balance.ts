import { TimeOffBalance } from "@/schema/time-off-schema";
import { getCurrentTimeOffBalance } from "@/services/time-off/current-balance";
import { useQuery } from "@tanstack/react-query";

export const useCurrentTimeOffBalance = () =>
  useQuery<TimeOffBalance[]>({
    queryKey: ["time-off-balances"],
    queryFn: async () => await getCurrentTimeOffBalance(),
  });
