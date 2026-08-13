import { getTimeOffTypes } from "@/services/time-off/types";
import { useQuery } from "@tanstack/react-query";

export const useTimeOffTypes = () =>
  useQuery({
    queryKey: ["time-off-types"],
    queryFn: async () => (await getTimeOffTypes()).data,
  });
