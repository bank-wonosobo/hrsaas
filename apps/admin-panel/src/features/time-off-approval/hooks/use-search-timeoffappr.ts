import { PaginatedData } from "@/lib/response";
import { useQuery } from "@tanstack/react-query";
import {
  SearchTimeOffApproval,
  TimeOffApproval,
} from "../schemas/time-off-approval-schema";
import { searchTimeOffApproval } from "../services/search-time-off-approval";

export function useSearchTimeOffAppr(search: SearchTimeOffApproval) {
  return useQuery<PaginatedData<TimeOffApproval>>({
    queryKey: ["time-off-approvals", search],
    queryFn: async () => searchTimeOffApproval(search),
    retry: 2,
    placeholderData: (prev) => prev,
  });
}
