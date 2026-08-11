import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  SearchTimeOffRequest,
  TimeOffRequest,
} from "../schemas/time-off-schema";
import { searchTimeOffRequest } from "../services/search-time-off-request";

export function useSearchTimeOffReq(search: SearchTimeOffRequest) {
  return useQuery<PaginatedData<TimeOffRequest>>({
    queryKey: ["time-off-requests", search],
    queryFn: async () => searchTimeOffRequest(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
