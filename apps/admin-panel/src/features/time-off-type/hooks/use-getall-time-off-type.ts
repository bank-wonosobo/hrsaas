import { useQuery } from "@tanstack/react-query";
import { TimeOffType } from "../schemas/time-off-type-schema";
import { getAllTimeOffType } from "../services/getall-time-off-type-service";

export function useGetAllTimeOffType() {
  return useQuery<TimeOffType[]>({
    queryKey: ["time-off-types"],
    queryFn: getAllTimeOffType,
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
