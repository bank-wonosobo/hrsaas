import { api } from "@/lib/axios";
import { PaginatedData } from "@/lib/response";
import { TimeOffApproval } from "@/schema/time-off-approval-schema";

export type ListTimeOffApprovalParams = {
  status?: string;
  page?: number;
  size?: number;
};

export const listTimeOffApprovals = async (
  params: ListTimeOffApprovalParams,
): Promise<PaginatedData<TimeOffApproval>> => {
  const response = await api.get("/time-off-approvals", { params });

  return {
    data: response.data.data,
    paging: response.data.paging,
  };
};
