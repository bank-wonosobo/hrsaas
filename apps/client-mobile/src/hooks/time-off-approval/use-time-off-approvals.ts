import {
  ListTimeOffApprovalParams,
  listTimeOffApprovals,
} from "@/services/time-off-approval/list";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export function useTimeOffApprovals(params: ListTimeOffApprovalParams) {
  return useQuery({
    queryKey: ["time-off-approvals", "current", params],
    queryFn: () => listTimeOffApprovals(params),
    placeholderData: keepPreviousData,
  });
}
